/*
 * Copyright (c) 2020 Talent Beyond Boundaries. All rights reserved.
 */

package org.tbbtalent.server.repository.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tbbtalent.server.model.db.CandidateDependant;

public interface CandidateDependantRepository
        extends JpaRepository<CandidateDependant, Long> {
}