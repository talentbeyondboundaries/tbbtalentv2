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

package org.tbbtalent.server.request.note;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class CreateCandidateNoteRequest {

    @NotNull
    private Long candidateId;

    @NotBlank
    private String title;

    private String comment;

    public CreateCandidateNoteRequest() {
    }

    public CreateCandidateNoteRequest(@NotNull Long candidateId, @NotBlank String title, @NotBlank String comment) {
        this.candidateId = candidateId;
        this.title = title;
        this.comment = comment;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
