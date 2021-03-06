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

import org.springframework.lang.Nullable;
import org.tbbtalent.server.model.db.Role;
import org.tbbtalent.server.model.db.User;
import org.tbbtalent.server.security.UserContext;
import org.tbbtalent.server.util.dto.DtoBuilder;

import javax.validation.constraints.NotNull;

/**
 * Utility for selecting the right DTO build based on the currently logged in
 * user.
 *
 * @author John Cameron
 */
public class CandidateBuilderSelector {
    private final UserContext userContext;

    public CandidateBuilderSelector(UserContext userContext) {
        this.userContext = userContext;
    }

    private @Nullable Role getRole() {
        User user = userContext.getLoggedInUser().orElse(null);
        return user == null ? null : user.getRole();
    }

    public @NotNull DtoBuilder selectBuilder() {
        DtoBuilder builder;
        Role role = getRole();
        if (role == Role.admin || role == Role.sourcepartneradmin) {
            builder = candidateBaseDto();
        } else if (role == Role.semilimited){
            builder = candidateSemiLimitedDto();
        } else {
            builder = candidateLimitedDto();
        }
        return builder;
    }

    private DtoBuilder candidateBaseDto() {
        return new DtoBuilder()
                .add("id")
                .add("status")
                .add("candidateNumber")
                .add("gender")
                .add("dob")
                .add("phone")
                .add("whatsapp")
                .add("city")
                .add("address1")
                .add("yearOfArrival")
                .add("additionalInfo")
                .add("linkedInLink")
                .add("candidateMessage")
                .add("folderlink")
                .add("sflink")
                .add("videolink")
                .add("unhcrStatus")
                .add("unhcrNumber")
                .add("surveyComment")
                .add("selected")
                .add("createdDate")
                .add("updatedDate")
                .add("contextNote")
                .add("maritalStatus")
                .add("drivingLicense")
                .add("surveyType", surveyTypeDto())
                .add("country", countryDto())
                .add("nationality", nationalityDto())
                .add("user", userDto())
                .add("candidateReviewStatusItems", reviewDto())
                ;
    }

    private DtoBuilder candidateSemiLimitedDto() {
        return new DtoBuilder()
                .add("id")
                .add("status")
                .add("candidateNumber")
                .add("gender")
                .add("dob")
                .add("city")
                .add("address1")
                .add("yearOfArrival")
                .add("additionalInfo")
                .add("candidateMessage")
                .add("folderlink")
                .add("sflink")
                .add("selected")
                .add("createdDate")
                .add("updatedDate")
                .add("contextNote")
                .add("country", countryDto())
                .add("user",userSemiLimitedDto())
                .add("nationality", nationalityDto())
                .add("candidateReviewStatusItems", reviewDto())
                ;
    }

    private DtoBuilder candidateLimitedDto() {
        return new DtoBuilder()
                .add("id")
                .add("status")
                .add("candidateNumber")
                .add("gender")
                .add("dob")
                .add("yearOfArrival")
                .add("additionalInfo")
                .add("candidateMessage")
                .add("folderlink")
                .add("sflink")
                .add("selected")
                .add("createdDate")
                .add("updatedDate")
                .add("contextNote")
                .add("user",userSemiLimitedDto())
                .add("candidateReviewStatusItems", reviewDto())
                ;
    }

    private DtoBuilder userDto() {
        return new DtoBuilder()
                .add("id")
                .add("firstName")
                .add("lastName")
                .add("email")
                .add("createdDate")
                .add("updatedDate")
                ;
    }

    private DtoBuilder userSemiLimitedDto() {
        return new DtoBuilder()
                .add("id")
                .add("createdDate")
                .add("updatedDate")
                ;
    }

    private DtoBuilder countryDto() {
        return new DtoBuilder()
                .add("id")
                .add("name")
                ;
    }

    private DtoBuilder nationalityDto() {
        return new DtoBuilder()
                .add("id")
                .add("name")
                ;
    }

    private DtoBuilder reviewDto() {
        return new DtoBuilder()
                .add("id")
                .add("reviewStatus")
                .add("savedSearch", savedSearchDto())
                ;
    }

    private DtoBuilder surveyTypeDto() {
        return new DtoBuilder()
                .add("id")
                .add("name")
                ;
    }

    private DtoBuilder savedSearchDto() {
        return new DtoBuilder()
                .add("id")
                ;
    }

    private DtoBuilder educationMajor() {
        return new DtoBuilder()
                .add("id")
                .add("name")
                ;
    }

    private DtoBuilder educationLevelDto() {
        return new DtoBuilder()
                .add("id")
                .add("name")
                ;
    }

}
