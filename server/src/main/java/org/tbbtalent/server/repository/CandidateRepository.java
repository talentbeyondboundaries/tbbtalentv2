package org.tbbtalent.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.tbbtalent.server.model.Candidate;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    /* Used for candidate authentication */
    @Query(" select distinct c from Candidate c "
            + " where lower(c.email) = lower(:username) "
            + " or lower(c.phone) = lower(:username) "
            + " or lower(c.whatsapp) = lower(:username) ")
    Candidate findByAnyUserIdentityIgnoreCase(@Param("username") String username);

    /* Used for JWT token parsing */
    Candidate findByCandidateNumber(String number);

    /* Used for candidate registration to check for existing accounts with different username options */
    Candidate findByEmailIgnoreCase(String email);
    Candidate findByPhoneIgnoreCase(String phone);
    Candidate findByWhatsappIgnoreCase(String whatsapp);

}
