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

alter table candidate_occupation add column updated_by bigint references users;
alter table candidate_occupation add column updated_date timestamptz;
alter table candidate_occupation add column created_by bigint references users;
alter table candidate_occupation add column created_date timestamptz;

create table audit_log
(
  id                      bigserial not null primary key,
  event_date              date not null,
  user_id                 bigint not null,
  type                    text not null,
  action                  text not null,
  object_ref              text not null,
  description             text not null
);
