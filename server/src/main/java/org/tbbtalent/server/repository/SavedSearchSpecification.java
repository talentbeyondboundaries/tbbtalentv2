package org.tbbtalent.server.repository;

import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;
import org.tbbtalent.server.model.Nationality;
import org.tbbtalent.server.model.SavedSearch;
import org.tbbtalent.server.request.search.SearchSavedSearchRequest;

import javax.persistence.criteria.Predicate;

public class SavedSearchSpecification {

    public static Specification<SavedSearch> buildSearchQuery(final SearchSavedSearchRequest request) {
        return (savedSearch, query, builder) -> {
            Predicate conjunction = builder.conjunction();
            query.distinct(true);

            // KEYWORD SEARCH
            if (!StringUtils.isBlank(request.getKeyword())){
                String lowerCaseMatchTerm = request.getKeyword().toLowerCase();
                String likeMatchTerm = "%" + lowerCaseMatchTerm + "%";
                conjunction.getExpressions().add(
                        builder.or(
                                builder.like(builder.lower(savedSearch.get("name")), likeMatchTerm)
                        ));
            }

        

            return conjunction;
        };
    }

}