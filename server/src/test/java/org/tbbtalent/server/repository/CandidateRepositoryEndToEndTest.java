/*
 * Copyright (c) 2021 Talent Beyond Boundaries.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT 
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License 
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

package org.tbbtalent.server.repository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.tbbtalent.server.model.db.Candidate;
import org.tbbtalent.server.model.db.Role;
import org.tbbtalent.server.model.db.SavedList;
import org.tbbtalent.server.model.db.User;
import org.tbbtalent.server.repository.db.CandidateRepository;
import org.tbbtalent.server.repository.db.GetSavedListCandidatesQuery;
import org.tbbtalent.server.repository.db.NationalityRepository;
import org.tbbtalent.server.repository.db.SavedListRepository;
import org.tbbtalent.server.repository.db.UserRepository;
import org.tbbtalent.server.request.candidate.SavedListGetRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class CandidateRepositoryEndToEndTest {
    private static final Logger log = LoggerFactory.getLogger(CandidateRepositoryEndToEndTest.class);
    
    @Autowired
    private NationalityRepository nationalityRepository;
    
    @Autowired
    private CandidateRepository candidateRepository;
    
    @Autowired
    private SavedListRepository savedListRepository;

    @Autowired
    UserRepository userRepository;

    private User owningUser;
    private SavedList savedList;
    
    @BeforeEach
    void setUpListAndOwningUser() {
        assertNotNull(savedListRepository);
        assertNotNull(userRepository);

        User owningUser = userRepository.findByUsernameIgnoreCase("camerojox");
        if (owningUser == null) {
            //Create test user if it doesn't already exist.
            //Usually it won't because transactional tests are automatically
            //rolled back.
            owningUser = new User(
                    "camerojox", "TestFirst", "TestLast",
                    "Test@x.com", Role.user);
            owningUser.setPasswordEnc("xxxx");
            owningUser.setReadOnly(false);
            userRepository.save(owningUser);
        }

        //Create a test list if it is not already there
        String listName = "TestList";
        savedList = savedListRepository.findByNameIgnoreCase(listName, owningUser.getId() )
                .orElse(null);

        if (savedList == null) {
            savedList = new SavedList();
            savedList.setName("TestList");
            savedList.setAuditFields(owningUser);

            savedListRepository.save(savedList);
        } else {
            savedList = savedListRepository.findByIdLoadCandidates(savedList.getId())
            .orElse(null);
        }
        assertNotNull(savedList);
    }

    //@Transactional
    //@Test
    void testCandidateListSort() {
        Set<Candidate> candidates = fetchTestCandidates(20);
        assertThat(candidates).isNotNull();
        int totalCandidates = candidates.size();
        
        savedList.addCandidates(candidates);
        
        savedListRepository.save(savedList);

        SavedListGetRequest request;
        request = new SavedListGetRequest();
        request.setSortFields(new String[] {"nationality.name"});
        request.setSortDirection(Sort.Direction.ASC);
        
        request.setPageSize(10);
        request.setPageNumber(0);

        PageRequest pageRequest = request.getPageRequestWithoutSort();
        Page<Candidate> candidatesPage = candidateRepository.findAll(
                new GetSavedListCandidatesQuery(savedList.getId(), request), pageRequest);

        assertNotNull(candidatesPage);
        assertEquals(totalCandidates, candidatesPage.getTotalElements());

        List<Candidate> pageOfCandidates = candidatesPage.getContent();
        assertThat(pageOfCandidates).isNotNull();
        
        for (Candidate candidate : pageOfCandidates) {
            User user = candidate.getUser();
            log.info((user == null ? "?" : (user.getFirstName() + " " + user.getLastName())) + " " 
                    + candidate.getNationality().getName() + " " + candidate.getCountry().getName());
        }
    }

    private Set<Candidate> fetchTestCandidates(int n) {
        List<Candidate> candidates = candidateRepository.findAll();
        Set<Candidate> candidateSet = new HashSet<>();
        for (int i = 0; i < n; i++) {
            Candidate candidate;
            candidate = candidates.get(i);
            
            candidate = candidateRepository.findByIdLoadSavedLists(candidate.getId());
            candidateSet.add(candidate);
        }
        return candidateSet;
    }
}