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

import java.util.List;
import java.util.Map;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.tbbtalent.server.exception.EntityExistsException;
import org.tbbtalent.server.exception.InvalidRequestException;
import org.tbbtalent.server.exception.NoSuchObjectException;
import org.tbbtalent.server.model.db.SavedList;
import org.tbbtalent.server.request.candidate.UpdateCandidateContextNoteRequest;
import org.tbbtalent.server.request.candidate.UpdateDisplayedFieldPathsRequest;
import org.tbbtalent.server.request.list.CreateSavedListRequest;
import org.tbbtalent.server.request.list.SearchSavedListRequest;
import org.tbbtalent.server.request.list.TargetListSelection;
import org.tbbtalent.server.request.list.UpdateSavedListInfoRequest;
import org.tbbtalent.server.request.search.UpdateSharingRequest;
import org.tbbtalent.server.service.db.CandidateSavedListService;
import org.tbbtalent.server.service.db.SavedListService;
import org.tbbtalent.server.util.dto.DtoBuilder;

@RestController()
@RequestMapping("/api/admin/saved-list")
public class SavedListAdminApi implements 
        ITableApi<SearchSavedListRequest, CreateSavedListRequest, UpdateSavedListInfoRequest> {

    private final SavedListService savedListService;
    private final CandidateSavedListService candidateSavedListService;
    private final SavedListBuilderSelector builderSelector = new SavedListBuilderSelector();

    @Autowired
    public SavedListAdminApi(SavedListService savedListService, CandidateSavedListService candidateSavedListService) {
        this.savedListService = savedListService;
        this.candidateSavedListService = candidateSavedListService;
    }

    /*
        Standard ITableApi methods
     */
    
    /**
     * Creates a new SavedList.
     * <p>
     *   If {@link CreateSavedListRequest#getCandidateIds()} is not null then
     *   it initializes the contents of the list, otherwise the list is
     *   initialized as empty.
     * </p>
     * @param request Request defining new list plus optional initial contents.
     * @return The details about the list - but not the contents.  
     * @throws EntityExistsException if a list with this name already exists.
     */
    @Override
    public @NotNull Map<String, Object> create(
            @Valid CreateSavedListRequest request) throws EntityExistsException {
        SavedList savedList = savedListService.createSavedList(request);
        DtoBuilder builder = builderSelector.selectBuilder();
        return builder.build(savedList);
    }

    /**
     * Deletes the saved list with the given id.
     * @param id Requested id
     * @return True if list was deleted, false if it was not found.
     * @throws InvalidRequestException if not authorized to delete this list.
     */
    @Override
    public boolean delete(long id) throws InvalidRequestException {
        return savedListService.deleteSavedList(id);
    }

    /**
     * Gets the save list with the given id.
     * @param id Requested id
     * @return The details about the list - but not the contents.
     * @throws NoSuchObjectException if there is no saved list with this id. 
     */
    @Override
    public @NotNull Map<String, Object> get(long id) throws NoSuchObjectException {
        SavedList savedList = savedListService.get(id);
        DtoBuilder builder = builderSelector.selectBuilder();
        return builder.build(savedList);
    }

    /**
     * Returns all saved lists matching the request. 
     * <p/>
     * See also {@link #searchPaged} .
     * @param request Defines which lists should be returned. Any paging or
     *                sorting fields in the request are ignored.
     * @return All matching SavedLists
     */
    @Override
    public @NotNull List<Map<String, Object>> search(
            @Valid SearchSavedListRequest request) {
        List<SavedList> savedLists = savedListService.listSavedLists(request);
        DtoBuilder builder = builderSelector.selectBuilder();
        return builder.buildList(savedLists);
    }

    /**
     * Returns the requested page of saved lists matching the request. 
     * <p/>
     * See also {@link #search} 
     * @param request Defines which lists should be returned. Any sorting fields 
     *                in the request are ignored.
     * @return Requested page of matching SavedLists
     */
    @Override
    public @NotNull Map<String, Object> searchPaged(
            @Valid SearchSavedListRequest request) {
        Page<SavedList> savedLists = savedListService.searchSavedLists(request);
        DtoBuilder builder = builderSelector.selectBuilder();
        return builder.buildPage(savedLists);
    }

    @Override
    public @NotNull Map<String, Object> update(
            long id, @Valid UpdateSavedListInfoRequest request) 
            throws EntityExistsException, InvalidRequestException, NoSuchObjectException {
        SavedList savedList = savedListService.updateSavedList(id, request);
        DtoBuilder builder = builderSelector.selectBuilder();
        return builder.build(savedList);
    }
    
    /*
        End standard ITableApi methods
     */

    /**
     * Copies the given list to the list specified in the given request (which
     * may be a requested new list).
     * @param id ID of list to be copied
     * @param request Defines the target list and also whether copy is a 
     *                replace or an add.
     * @return The target list                
     * @throws EntityExistsException If a new list needs to be created but the
     * list name already exists.
     * @throws NoSuchObjectException if there is no saved list matching the id
     * or the target list id. 
     */
    @PutMapping("/copy/{id}")
    public @NotNull Map<String, Object> copy(@PathVariable("id") long id,
            @RequestBody TargetListSelection request) 
            throws EntityExistsException, NoSuchObjectException {
        SavedList targetList = this.savedListService.copy(id, request);
        DtoBuilder builder = builderSelector.selectBuilder();
        return builder.build(targetList);
    }

    @PutMapping("/shared-add/{id}")
    public Map<String, Object> addSharedUser(
            @PathVariable("id") long id,
            @RequestBody UpdateSharingRequest request) {
        SavedList savedList = this.savedListService.addSharedUser(id, request);
        DtoBuilder builder = builderSelector.selectBuilder();
        return builder.build(savedList);
    }

    @PutMapping("/shared-remove/{id}")
    public Map<String, Object> removeSharedUser(
            @PathVariable("id") long id,
            @RequestBody UpdateSharingRequest request) {
        SavedList savedList = this.savedListService.removeSharedUser(id, request);
        DtoBuilder builder = builderSelector.selectBuilder();
        return builder.build(savedList);
    }

    @PutMapping("/context/{id}")
    public void updateContextNote(
            @PathVariable("id") long id,
            @RequestBody UpdateCandidateContextNoteRequest request) {
        candidateSavedListService.updateCandidateContextNote(id, request);
    }

    @PutMapping("/displayed-fields/{id}")
    public void updateDisplayedFieldPaths(
            @PathVariable("id") long id,
            @RequestBody UpdateDisplayedFieldPathsRequest request) {
        savedListService.updateDisplayedFieldPaths(id, request);
    }
    
}
