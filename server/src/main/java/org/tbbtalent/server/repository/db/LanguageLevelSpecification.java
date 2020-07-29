/*
 * Copyright (c) 2020 Talent Beyond Boundaries. All rights reserved.
 */

package org.tbbtalent.server.repository.db;

import javax.persistence.criteria.Predicate;

import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;
import org.tbbtalent.server.model.db.LanguageLevel;
import org.tbbtalent.server.request.language.level.SearchLanguageLevelRequest;

public class LanguageLevelSpecification {

    public static Specification<LanguageLevel> buildSearchQuery(final SearchLanguageLevelRequest request) {
        return (languageLevel, query, builder) -> {
            Predicate conjunction = builder.conjunction();
            query.distinct(true);

            // KEYWORD SEARCH
            if (!StringUtils.isBlank(request.getKeyword())){
                String lowerCaseMatchTerm = request.getKeyword().toLowerCase();
                String likeMatchTerm = "%" + lowerCaseMatchTerm + "%";
                conjunction.getExpressions().add(
                        builder.or(
                                builder.like(builder.lower(languageLevel.get("level")), likeMatchTerm)
                        ));
            }

            if (request.getStatus() != null){
                conjunction.getExpressions().add(builder.equal(languageLevel.get("status"), request.getStatus()));
            }

            return conjunction;
        };
    }
}