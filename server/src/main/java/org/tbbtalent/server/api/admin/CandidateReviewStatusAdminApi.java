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

package org.tbbtalent.server.api.admin;

import java.util.Map;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.tbbtalent.server.exception.EntityExistsException;
import org.tbbtalent.server.model.db.CandidateReviewStatusItem;
import org.tbbtalent.server.request.reviewstatus.CreateCandidateReviewStatusRequest;
import org.tbbtalent.server.request.reviewstatus.UpdateCandidateReviewStatusRequest;
import org.tbbtalent.server.service.db.CandidateReviewStatusService;
import org.tbbtalent.server.util.dto.DtoBuilder;

@RestController()
@RequestMapping("/api/admin/candidate-reviewstatus")
public class CandidateReviewStatusAdminApi {

    private final CandidateReviewStatusService candidateReviewStatusService;

    @Autowired
    public CandidateReviewStatusAdminApi(CandidateReviewStatusService candidateReviewStatusService) {
        this.candidateReviewStatusService = candidateReviewStatusService;
    }

    @GetMapping("{id}")
    public Map<String, Object> get(@PathVariable("id") long id) {
        CandidateReviewStatusItem reviewStatusItem = this.candidateReviewStatusService.getCandidateReviewStatusItem(id);
        return candidateReviewStatusDto().build(reviewStatusItem);
    }

    @PostMapping
    public Map<String, Object> create(@Valid @RequestBody CreateCandidateReviewStatusRequest request) throws EntityExistsException {
        CandidateReviewStatusItem candidateReviewStatusItem = this.candidateReviewStatusService.createCandidateReviewStatusItem(request);
        return candidateReviewStatusDto().build(candidateReviewStatusItem);
    }

    @PutMapping("{id}")
    public Map<String, Object> update(@PathVariable("id") long id,
                                      @RequestBody UpdateCandidateReviewStatusRequest request) {
        CandidateReviewStatusItem candidateReviewStatusItem = this.candidateReviewStatusService.updateCandidateReviewStatusItem(id, request);
        return candidateReviewStatusDto().build(candidateReviewStatusItem);
    }


    private DtoBuilder candidateReviewStatusDto() {
        return new DtoBuilder()
                .add("id")
                .add("reviewStatus")
                .add("comment")
                .add("createdBy", userDto())
                .add("createdDate")
                .add("updatedBy", userDto())
                .add("updatedDate")
                ;
    }

    private DtoBuilder userDto() {
        return new DtoBuilder()
                .add("id")
                .add("firstName")
                .add("lastName")
                ;
    }






}
