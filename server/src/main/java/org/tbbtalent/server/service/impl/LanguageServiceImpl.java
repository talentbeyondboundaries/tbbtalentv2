package org.tbbtalent.server.service.impl;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tbbtalent.server.exception.EntityExistsException;
import org.tbbtalent.server.exception.EntityReferencedException;
import org.tbbtalent.server.exception.NoSuchObjectException;
import org.tbbtalent.server.model.CandidateLanguage;
import org.tbbtalent.server.model.Language;
import org.tbbtalent.server.model.Status;
import org.tbbtalent.server.model.SystemLanguage;
import org.tbbtalent.server.repository.CandidateLanguageRepository;
import org.tbbtalent.server.repository.LanguageRepository;
import org.tbbtalent.server.repository.LanguageSpecification;
import org.tbbtalent.server.repository.SystemLanguageRepository;
import org.tbbtalent.server.request.language.CreateLanguageRequest;
import org.tbbtalent.server.request.language.SearchLanguageRequest;
import org.tbbtalent.server.request.language.UpdateLanguageRequest;
import org.tbbtalent.server.service.LanguageService;

import io.jsonwebtoken.lang.Collections;

@Service
public class LanguageServiceImpl implements LanguageService {

    private static final Logger log = LoggerFactory.getLogger(LanguageServiceImpl.class);

    private final LanguageRepository languageRepository;
    private final CandidateLanguageRepository candidateLanguageRepository;
    private final SystemLanguageRepository systemLanguageRepository;

    @Autowired
    public LanguageServiceImpl(CandidateLanguageRepository candidateLanguageRepository,
                               LanguageRepository languageRepository,
                               SystemLanguageRepository systemLanguageRepository) {
        this.candidateLanguageRepository = candidateLanguageRepository;
        this.languageRepository = languageRepository;
        this.systemLanguageRepository = systemLanguageRepository;
    }

    @Override
    public List<Language> listLanguages() {
        return languageRepository.findByStatus(Status.active);
    }
    
    @Override
    public List<SystemLanguage> listSystemLanguages() {
        return systemLanguageRepository.findByStatus(Status.active);
    }

    @Override
    public Page<Language> searchLanguages(SearchLanguageRequest request) {
        Page<Language> languages = languageRepository.findAll(
                LanguageSpecification.buildSearchQuery(request), request.getPageRequest());
        log.info("Found " + languages.getTotalElements() + " languages in search");
        return languages;
    }

    @Override
    public Language getLanguage(long id) {
        return this.languageRepository.findById(id)
                .orElseThrow(() -> new NoSuchObjectException(Language.class, id));
    }

    @Override
    @Transactional
    public Language createLanguage(CreateLanguageRequest request) throws EntityExistsException {
        Language language = new Language(
                request.getName(), request.getStatus());
        checkDuplicates(null, request.getName());
        return this.languageRepository.save(language);
    }


    @Override
    @Transactional
    public Language updateLanguage(long id, UpdateLanguageRequest request) throws EntityExistsException {
        Language language = this.languageRepository.findById(id)
                .orElseThrow(() -> new NoSuchObjectException(Language.class, id));
        checkDuplicates(id, request.getName());

        language.setName(request.getName());
        language.setStatus(request.getStatus());
        return languageRepository.save(language);
    }

    @Override
    @Transactional
    public boolean deleteLanguage(long id) throws EntityReferencedException {
        Language language = languageRepository.findById(id).orElse(null);
        List<CandidateLanguage> candidateLanguages = candidateLanguageRepository.findByLanguageId(id);
        if (!Collections.isEmpty(candidateLanguages)){
            throw new EntityReferencedException("language");
        }
        if (language != null) {
            language.setStatus(Status.deleted);
            languageRepository.save(language);
            return true;
        }
        return false;
    }

    private void checkDuplicates(Long id, String name) {
        Language existing = languageRepository.findByNameIgnoreCase(name);
        if (existing != null && !existing.getId().equals(id) || (existing != null && id == null)){
            throw new EntityExistsException("country");
        }
    }
}