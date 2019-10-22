package org.tbbtalent.server.api.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.tbbtalent.server.model.CandidateOccupation;
import org.tbbtalent.server.model.Occupation;
import org.tbbtalent.server.request.candidate.occupation.VerifyCandidateOccupationRequest;
import org.tbbtalent.server.service.CandidateOccupationService;
import org.tbbtalent.server.util.dto.DtoBuilder;

import java.util.List;
import java.util.Map;

@RestController()
@RequestMapping("/api/admin/candidate-occupation")
public class CandidateOccupationAdminApi {

    private final CandidateOccupationService candidateOccupationService;

    @Autowired
    public CandidateOccupationAdminApi(CandidateOccupationService candidateOccupationService) {
        this.candidateOccupationService = candidateOccupationService;
    }

    @GetMapping("verified")
    public List<Map<String, Object>> getVerifiedOccupations() {
        List<Occupation> candidateOccupations = this.candidateOccupationService.listVerifiedOccupations();
        return occupationDto().buildList(candidateOccupations);
    }

    @GetMapping("occupation")
    public List<Map<String, Object>> getAllOccupations() {
        List<Occupation> candidateOccupations = this.candidateOccupationService.listOccupations();
        return occupationDto().buildList(candidateOccupations);
    }

    @GetMapping("{id}/list")
    public List<Map<String, Object>> get(@PathVariable("id") long candidateId) {
        List<CandidateOccupation> candidateOccupations = this.candidateOccupationService.listCandidateOccupations(candidateId);
        return candidateOccupationDto().buildList(candidateOccupations);
    }

    @PutMapping("{id}")
    public Map<String, Object> update(@PathVariable("id") long id,
                                      @RequestBody VerifyCandidateOccupationRequest request) {
        CandidateOccupation candidateOccupation = this.candidateOccupationService.verifyCandidateOccupation(id, request);
        return candidateOccupationDto().build(candidateOccupation);
    }

    private DtoBuilder occupationDto() {
        return new DtoBuilder()
                .add("id")
                .add("name")
                ;
    }

    private DtoBuilder candidateOccupationDto() {
        return new DtoBuilder()
                .add("id")
                .add("migrationOccupation")
                .add("occupation", occupationDto())
                .add("yearsExperience")
                .add("verified")
                ;
    }



}
