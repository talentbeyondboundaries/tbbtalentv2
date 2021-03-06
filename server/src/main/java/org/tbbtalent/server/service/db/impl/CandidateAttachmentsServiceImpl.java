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

package org.tbbtalent.server.service.db.impl;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.tbbtalent.server.exception.InvalidCredentialsException;
import org.tbbtalent.server.exception.InvalidRequestException;
import org.tbbtalent.server.exception.InvalidSessionException;
import org.tbbtalent.server.exception.NoSuchObjectException;
import org.tbbtalent.server.model.db.*;
import org.tbbtalent.server.repository.db.CandidateAttachmentRepository;
import org.tbbtalent.server.repository.db.CandidateRepository;
import org.tbbtalent.server.request.PagedSearchRequest;
import org.tbbtalent.server.request.attachment.CreateCandidateAttachmentRequest;
import org.tbbtalent.server.request.attachment.SearchCandidateAttachmentsRequest;
import org.tbbtalent.server.request.attachment.UpdateCandidateAttachmentRequest;
import org.tbbtalent.server.security.UserContext;
import org.tbbtalent.server.service.db.CandidateAttachmentService;
import org.tbbtalent.server.service.db.CandidateService;
import org.tbbtalent.server.service.db.GoogleFileSystemService;
import org.tbbtalent.server.service.db.aws.S3ResourceHelper;
import org.tbbtalent.server.util.filesystem.FileSystemFile;
import org.tbbtalent.server.util.filesystem.FileSystemFolder;
import org.tbbtalent.server.util.textExtract.TextExtractHelper;

import java.io.*;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class CandidateAttachmentsServiceImpl implements CandidateAttachmentService {

    private static final Logger log = LoggerFactory.getLogger(CandidateAttachmentsServiceImpl.class);

    private final CandidateRepository candidateRepository;
    private final CandidateService candidateService;
    private final CandidateAttachmentRepository candidateAttachmentRepository;
    private final GoogleFileSystemService fileSystemService;
    private final UserContext userContext;
    private final S3ResourceHelper s3ResourceHelper;
    private final TextExtractHelper textExtractHelper;

    @Value("{aws.s3.bucketName}")
    String s3Bucket;

    @Autowired
    public CandidateAttachmentsServiceImpl(CandidateRepository candidateRepository,
                                           CandidateService candidateService,
                                           CandidateAttachmentRepository candidateAttachmentRepository,
                                           GoogleFileSystemService fileSystemService, S3ResourceHelper s3ResourceHelper,
                                           UserContext userContext) {
        this.candidateRepository = candidateRepository;
        this.candidateService = candidateService;
        this.candidateAttachmentRepository = candidateAttachmentRepository;
        this.fileSystemService = fileSystemService;
        this.s3ResourceHelper = s3ResourceHelper;
        this.userContext = userContext;
        this.textExtractHelper = new TextExtractHelper(candidateAttachmentRepository, s3ResourceHelper);
    }

    @Override
    public Page<CandidateAttachment> searchCandidateAttachments(SearchCandidateAttachmentsRequest request) {
        return candidateAttachmentRepository.findByCandidateId(request.getCandidateId(), request.getPageRequest());
    }

    @Override
    public Page<CandidateAttachment> searchCandidateAttachmentsForLoggedInCandidate(PagedSearchRequest request) {
        Long candidateId = userContext.getLoggedInCandidateId();
        if (candidateId == null) {
            throw new InvalidSessionException("Not logged in");
        }
        return candidateAttachmentRepository
                .findByCandidateId(candidateId, request.getPageRequest());
    }

    @Override
    public List<CandidateAttachment> listCandidateAttachmentsForLoggedInCandidate() {
        Long candidateId = userContext.getLoggedInCandidateId();
        if (candidateId == null) {
            throw new InvalidSessionException("Not logged in");
        }
        return candidateAttachmentRepository.findByCandidateIdLoadAudit(candidateId);
    }

    @Override
    public List<CandidateAttachment> listCandidateCvs(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new NoSuchObjectException(Candidate.class, candidateId));
        return candidateAttachmentRepository.findByCandidateIdAndCv(candidate.getId(), true);
    }

    @Override
    public List<CandidateAttachment> listCandidateAttachments(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new NoSuchObjectException(Candidate.class, candidateId));
        return candidateAttachmentRepository.findByCandidateId(candidate.getId());
    }

    @Override
    public CandidateAttachment createCandidateAttachment(CreateCandidateAttachmentRequest request) {
        User user = userContext.getLoggedInUser()
                .orElseThrow(() -> new InvalidSessionException("Not logged in"));

        Candidate candidate;
        String textExtract;

        // Handle requests coming from the admin portal
        if (request.getCandidateId() != null) {
            candidate = candidateRepository.findById(request.getCandidateId())
                    .orElseThrow(() -> new NoSuchObjectException(Candidate.class, request.getCandidateId()));
        } else {
            candidate = userContext.getLoggedInCandidate();
            if (candidate == null) {
                throw new InvalidSessionException("Not logged in");
            }
        }

        // Create a record of the attachment
        CandidateAttachment attachment = new CandidateAttachment();

        attachment.setCandidate(candidate);
        attachment.setMigrated(false);
        attachment.setAuditFields(user);

        if (request.getType().equals(AttachmentType.link)) {

            attachment.setType(AttachmentType.link);
            attachment.setLocation(request.getLocation());
            attachment.setName(request.getName());

        } else if (request.getType().equals(AttachmentType.googlefile)) {
            attachment.setLocation(request.getLocation());
            attachment.setName(request.getName());
            attachment.setType(AttachmentType.googlefile);
            attachment.setFileType(request.getFileType());
            attachment.setCv(request.getCv());
            attachment.setTextExtract(request.getTextExtract());

        } else if (request.getType().equals(AttachmentType.file)) {
            // Prepend the filename with a UUID to ensure an existing file doesn't get overwritten on S3
            String uniqueFilename = UUID.randomUUID() + "_" + request.getName();
            // Source is temporary folder where the file got uploaded, destination is the candidates unique folder
            String source = "temp/" + request.getFolder() + "/" + request.getName();
            String destination = "candidate/" + candidate.getCandidateNumber() + "/" + uniqueFilename;
            // Download the file from the S3 temporary file before it is copying over
            File srcFile = this.s3ResourceHelper.downloadFile(this.s3ResourceHelper.getS3Bucket(), source);
            // Copy the file from temp folder in s3 into the candidate's folder on S3
            this.s3ResourceHelper.copyObject(source, destination);
            log.info("[S3] Transferred candidate attachment from source [" + source + "] to destination [" + destination + "]");

            // The location is set to the filename because we can derive it's location from the candidate number
            attachment.setLocation(uniqueFilename);
            attachment.setName(request.getName());
            attachment.setType(AttachmentType.file);
            attachment.setFileType(request.getFileType());

            // Extract text from the file
            if(request.getCv()) {
                try {
                    textExtract = textExtractHelper.getTextExtractFromFile(srcFile, request.getFileType());
                    if(StringUtils.isNotBlank(textExtract)) {
                        attachment.setTextExtract(textExtract);
                        candidateAttachmentRepository.save(attachment);
                    }
                } catch (Exception e) {
                    log.error("Could not extract text from uploaded cv file", e);
                    attachment.setTextExtract(null);
                }
                attachment.setCv(request.getCv());
            }

        }


        // Update candidate audit fields
        candidate.setAuditFields(user);
        candidateService.save(candidate, true);

        return candidateAttachmentRepository.save(attachment);
    }

    // Removed @Transactional to fix logged error ObjectDeletedException. There is a risk that now deleting from
    // repository but not from S3 bucket.
    @Override
    public void deleteCandidateAttachment(Long id) {
        User user = userContext.getLoggedInUser()
                .orElseThrow(() -> new InvalidSessionException("Not logged in"));

        CandidateAttachment candidateAttachment = candidateAttachmentRepository.findByIdLoadCandidate(id)
                .orElseThrow(() -> new NoSuchObjectException(CandidateAttachment.class, id));

        Candidate candidate;

        // If coming from candidate portal check delete logic
        if (user.getRole().equals(Role.user)) {
             candidate = userContext.getLoggedInCandidate();
            if (candidate == null) {
                throw new InvalidSessionException("Not logged in");
            }
            // Check that the candidate is deleting an attachment related to themselves
            if (!candidate.getId().equals(candidateAttachment.getCandidate().getId())) {
                throw new InvalidCredentialsException("You do not have permission to perform that action");
            }
            // Check that candidate is only deleting their own uploads
            if (!candidate.getUser().getId().equals(candidateAttachment.getCreatedBy().getId())) {
                throw new InvalidRequestException("You can only delete your own uploads.");
            }
        } else {
            candidate = candidateRepository.findById(candidateAttachment.getCandidate().getId())
                    .orElseThrow(() -> new NoSuchObjectException(Candidate.class, candidateAttachment.getCandidate().getId()));
        }

        // Delete the record from the database
        candidateAttachmentRepository.delete(candidateAttachment);

        // Update the candidate audit fields
        candidate.setAuditFields(candidate.getUser());
        candidateService.save(candidate, true);
        
        //Try and delete associated file on file system
        AttachmentType attachmentType = candidateAttachment.getType();
        if (attachmentType != null) {
            switch (attachmentType) {
                case file:
                    String folder = BooleanUtils.isTrue(
                            candidateAttachment.isMigrated()) ? "migrated"
                            : candidate.getCandidateNumber();
                    s3ResourceHelper.deleteFile("candidate/" + folder + "/" + candidateAttachment.getLocation());
                    break;
                case googlefile:
                    FileSystemFile fsf = new FileSystemFile();
                    fsf.setUrl(candidateAttachment.getLocation());
                    if (!user.getRole().equals(Role.admin)) {
                        fsf.setName("RemovedByCandidate_" + candidateAttachment.getName());
                        try {
                            fileSystemService.renameFile(fsf);
                        } catch (IOException e) {
                            log.error("Could not rename attachment in Google Drive: " + candidateAttachment.getName(), e);
                        }
                    } else {
                        try {
                            fileSystemService.deleteFile(fsf);
                        } catch (IOException e) {
                            log.error("Could not delete attachment from Google Drive: " + fsf, e);
                        }

                    }
                    break;
            }
        }
    }

    @Override
    public void downloadCandidateAttachment(Long id, OutputStream out) 
            throws IOException, NoSuchObjectException {
        CandidateAttachment attachment = getCandidateAttachment(id);
        downloadCandidateAttachment(attachment, out);
    }

    @Override
    public void downloadCandidateAttachment(
            CandidateAttachment attachment, OutputStream out) throws IOException {
        if (attachment.getType() == AttachmentType.googlefile) {
            FileSystemFile file = new FileSystemFile();
            file.setUrl(attachment.getLocation());
            fileSystemService.downloadFile(file, out);
        } else {
            //We only handle Google attachments for now because that is all
            //we need.
            //We can access link and AWS attachments simply using their urls.
            //We can do that with Google attachments because of security 
            //restrictions with the Google Shared Drive.
            //To get around that, we actually download a copy of the Google
            //file and return that copy to the user's browser.
        }
    }

    @Override
    public CandidateAttachment getCandidateAttachment(Long id) 
            throws NoSuchObjectException {
        CandidateAttachment candidateAttachment = 
                candidateAttachmentRepository.findByIdLoadCandidate(id)
                .orElseThrow(() -> 
                        new NoSuchObjectException(CandidateAttachment.class, id));
        return candidateAttachment;
    }

    @Override
    public CandidateAttachment updateCandidateAttachment(Long id,
            UpdateCandidateAttachmentRequest request) throws IOException {
        User user = userContext.getLoggedInUser()
                .orElseThrow(() -> new InvalidSessionException("Not logged in"));

        CandidateAttachment candidateAttachment = getCandidateAttachment(id);

        final AttachmentType attachmentType = candidateAttachment.getType();
        
        // Update the name
        if (!candidateAttachment.getName().equals(request.getName())) {
            candidateAttachment.setName(request.getName());
            if (attachmentType == AttachmentType.googlefile) {
                //For Google files we also rename the uploaded file 
                FileSystemFile fsf = new FileSystemFile();
                fsf.setName(request.getName());
                fsf.setUrl(candidateAttachment.getLocation());
                fileSystemService.renameFile(fsf);
            }
        }

        //Only AWS/S3 files support this CV to not CV and vice versa
        //for CV to non CV and vice versa only applies to AWS/S3 files
        if (attachmentType == AttachmentType.file) {
            // Run text extraction if attachment changed from not CV to a CV or remove if changed from CV to not CV.
            if (request.getCv() && !candidateAttachment.isCv()) {
                try {
                    String uniqueFilename = candidateAttachment.getLocation();
                    String destination;
                    if (candidateAttachment.isMigrated()) {
                        destination = "candidate/migrated/" + uniqueFilename;
                    } else {
                        destination = "candidate/" + candidateAttachment.getCandidate().getCandidateNumber() + "/" + uniqueFilename;
                    }
                    File srcFile = this.s3ResourceHelper.downloadFile(this.s3ResourceHelper.getS3Bucket(), destination);
                    String extractedText = textExtractHelper.getTextExtractFromFile(srcFile, candidateAttachment.getFileType());
                    if (StringUtils.isNotBlank(extractedText)) {
                        candidateAttachment.setTextExtract(extractedText);
                        candidateAttachmentRepository.save(candidateAttachment);
                    }
                } catch (Exception e) {
                    log.error("Unable to extract text from file " + candidateAttachment.getLocation(), e.getMessage());
                    candidateAttachment.setTextExtract(null);
                }
            } else if (!request.getCv() && candidateAttachment.isCv()) {
                candidateAttachment.setTextExtract(null);
                candidateAttachmentRepository.save(candidateAttachment);
            }
        }

        // Update the fields related to the file type
        if (candidateAttachment.getType().equals(AttachmentType.link)) {
            candidateAttachment.setLocation(request.getLocation());
            candidateAttachment.setAuditFields(user);
        } else if (candidateAttachment.getType().equals(AttachmentType.file)){
            candidateAttachment.setCv(request.getCv());
            candidateAttachment.setAuditFields(user);
        }

        // Update the candidate audit fields
        Candidate candidate = candidateAttachment.getCandidate();
        candidate.setAuditFields(candidate.getUser());
        candidateService.save(candidate, true);

        return candidateAttachmentRepository.save(candidateAttachment);
    }

    @Override
    @NonNull
    public CandidateAttachment uploadAttachment( 
            @NonNull Long candidateId, Boolean cv, MultipartFile file )
            throws IOException, NoSuchObjectException {

        Candidate candidate = candidateRepository.findById(candidateId)
                    .orElseThrow(() -> new NoSuchObjectException(Candidate.class, candidateId));
        
        //Save to a temporary file
        InputStream is = file.getInputStream();
        File tempFile = File.createTempFile("tbb", ".tmp");
        try (FileOutputStream outputStream = new FileOutputStream(tempFile)) {
            int read;
            byte[] bytes = new byte[1024];

            while ((read = is.read(bytes)) != -1) {
                outputStream.write(bytes, 0, read);
            }
        }
       

        //Name of file being uploaded (this is the name it had on the 
        //originating computer).
        String fileName = file.getOriginalFilename();

        //Get link to candidate folder if we have one.
        String folderLink = candidate.getFolderlink();
        if (folderLink == null || !folderLink.startsWith("http")) {
            //No candidate folder recorded, create one.
            candidate = candidateService.createCandidateFolder(candidateId);
            folderLink = candidate.getFolderlink();
        }

        //Create a folder object for the candidate folder (where the attachment 
        //file will be uploaded to)
        FileSystemFolder parentFolder = new FileSystemFolder();
        //Only need the Google folder id, which can be extracted from the 
        //folder's url.
        parentFolder.setId(fileSystemService.extractIdFromUrl(folderLink));
        
        //Upload the file to its folder, with the correct name (not the temp
        //file name).
        FileSystemFile uploadedFile = fileSystemService.uploadFile(
                parentFolder, fileName, tempFile);

        final String fileType = getFileExtension((fileName));
        
        //Do text extraction if CV - otherwise leave as null.
        String textExtract = null;
        if(cv) {
            try {
                textExtract = textExtractHelper
                        .getTextExtractFromFile(tempFile, fileType);
            } catch (Exception e) {
                log.error("Could not extract text from uploaded cv file", e);
            }
        }
        
        //Delete tempfile
        if (!tempFile.delete()) {
            log.error("Failed to delete temporary file " + tempFile);
        }

        //Now create corresponding CandidateAttachment record.
        CreateCandidateAttachmentRequest req = new CreateCandidateAttachmentRequest();
        req.setCandidateId(candidateId);
        req.setType(AttachmentType.googlefile);
        req.setName(fileName);
        req.setFileType(fileType); 
        req.setLocation(uploadedFile.getUrl());
        req.setCv(cv);
        if(StringUtils.isNotBlank(textExtract)) {
            // Remove any null bytes to avoid PSQLException: ERROR: invalid byte sequence for encoding "UTF8"
            textExtract = Pattern.compile("\\x00").matcher(textExtract).replaceAll("?");
            req.setTextExtract(textExtract);
        }
        
        CandidateAttachment attachment = 
                createCandidateAttachment(req);

        return attachment;
    }

    @Override
    @NonNull
    public CandidateAttachment uploadAttachment(Boolean cv, MultipartFile file) 
            throws IOException, InvalidSessionException {
        Long candidateId = userContext.getLoggedInCandidateId();
        if (candidateId == null) {
            throw new InvalidSessionException("Not logged in");
        }
        
        return uploadAttachment(candidateId, cv, file);
    }

    private String getFileExtension(String filename) {
        if (filename == null) {
            return "";
        }
        int lastIndexOf = filename.lastIndexOf(".");
        if (lastIndexOf == -1) {
            return ""; // empty extension
        }
        return filename.substring(lastIndexOf+1);
    }
}
