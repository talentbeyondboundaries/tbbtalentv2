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

package org.tbbtalent.server.service.db;

import org.tbbtalent.server.model.db.Candidate;
import org.tbbtalent.server.model.db.SavedList;
import org.tbbtalent.server.request.candidate.UpdateCandidateContextNoteRequest;

/**
 * Handle anything to do with deletion of candidate savedList relationships.
 * <p/>
 * Relying on Cascading from SavedList or Candidate candidateSavedList 
 * collections doesn't work. 
 * See doc on SavedList and Candidate where candidateSavedList is declared 
 */
public interface CandidateSavedListService {

    /**
     * Removes the given candidate from all its lists
     * @param candidate Candidate whose lists are being cleared
     */
    void clearCandidateSavedLists(Candidate candidate);

    /**
     * Removes all candidates from the given list
     * @param savedList List whose contents are being cleared
     */
    void clearSavedListCandidates(SavedList savedList);

    /**
     * Remove the given candidate from the given savedList
     * @param candidate Candidate to remove
     * @param savedList SavedList to remove from
     */
    void removeFromSavedList(Candidate candidate, SavedList savedList);

    /**
     * Updates a candidate context note associated with the given saved list.
     * @param savedListId Id of saved list
     * @param request Request containing the candidate id and the context note 
     *                text
     */
    void updateCandidateContextNote(
            long savedListId, UpdateCandidateContextNoteRequest request);
}
