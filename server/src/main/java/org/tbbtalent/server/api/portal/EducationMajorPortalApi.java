package org.tbbtalent.server.api.portal;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.tbbtalent.server.model.db.EducationMajor;
import org.tbbtalent.server.service.db.EducationMajorService;
import org.tbbtalent.server.util.dto.DtoBuilder;

@RestController()
@RequestMapping("/api/portal/education-major")
public class EducationMajorPortalApi {

    private final EducationMajorService educationMajorService;

    @Autowired
    public EducationMajorPortalApi(EducationMajorService educationMajorService) {
        this.educationMajorService = educationMajorService;
    }

    @GetMapping()
    public List<Map<String, Object>> listAllEducationMajors() {
        List<EducationMajor> educationMajors = educationMajorService.listActiveEducationMajors();
        return educationMajorDto().buildList(educationMajors);
    }

    private DtoBuilder educationMajorDto() {
        return new DtoBuilder()
                .add("id")
                .add("name")
                ;
    }

}
