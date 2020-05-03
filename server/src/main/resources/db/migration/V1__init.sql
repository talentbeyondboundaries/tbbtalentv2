create table country
(
id                      bigserial not null primary key,
name                    text not null,
status                  text not null default 'active'
);


create table nationality
(
id                      bigserial not null primary key,
name                    text not null,
status                  text not null default 'active'

);


create table language
(
id                      bigserial not null primary key,
name                    text not null,
status                  text not null default 'active'

);

create table language_level
(
id                       bigserial not null primary key,
level                    text not null,
status                   text not null default 'active',
sort_order               integer not null

);

create table industry
(
  id                      bigserial not null primary key,
  name                    text not null,
  status                  text not null default 'active'
);


create table occupation
(
  id                      bigserial not null primary key,
  name                    text not null,
  status                  text not null default 'active'
);



create table education_level
(
id                      bigserial not null primary key,
name                    text not null,
sort_order              integer not null,
status                  text not null default 'active'

);

create table education_major
(
id                      bigserial not null primary key,
name                    text not null,
status                  text not null default 'active'

);

create table users
(
  id                      bigserial not null primary key,
  username                text,
  first_name              text,
  last_name               text,
  email                   text,
  role                    text not null,
  status                  text not null,
  password_enc            text,
  last_login              timestamp with time zone,
  created_by              bigint references users,
  created_date            timestamp with time zone,
  updated_by              bigint references users,
  updated_date            timestamp with time zone
);

create table candidate
(
  id                      bigserial not null primary key,
  candidate_number        varchar(16) not null,
  user_id                 bigint references users,
  gender                  text,
  dob                     date,
  email                   text,
  phone                   text,
  whatsapp                text,
  status                  text not null,
  country_id              bigint references country,
  city                    text,
  year_of_arrival         integer,
  nationality_id          bigint references nationality,
  un_registered           boolean,
  un_registration_number  text,
  additional_info         text,
  max_education_level_id     bigint references education_level,
  created_by              bigint not null references users,
  created_date            timestamp with time zone not null,
  updated_by              bigint references users,
  updated_date            timestamp with time zone
);


create table candidate_occupation
(
  id                      bigserial not null primary key,
  candidate_id            bigint not null references candidate,
  occupation_id           bigint not null references occupation,
  years_experience        integer not null,
  verified                boolean default false,
  top_candidate           boolean
);


create table candidate_education
(
  id                      bigserial not null primary key,
  candidate_id            bigint not null references candidate,
  education_type          text,
  country_id              bigint not null references country,
  length_of_course_years  integer,
  institution             text,
  course_name             text,
  date_completed          text
);

create table candidate_language
(
id                      bigserial not null primary key,
candidate_id            bigint not null references candidate,
language_id             bigint not null references language,
written_level_id        bigint not null references language_level,
spoken_level_id         bigint not null references language_level
);

create table candidate_job_experience
(
id                      bigserial not null primary key,
candidate_id            bigint not null references candidate,
candidate_occupation_id bigint not null references candidate_occupation,
company_name            text,
country_id              bigint references country,
role                    text,
start_date              date,
end_date                date,
full_time               boolean,
paid                    boolean,
description             text
);

create table candidate_certification
(
id                      bigserial not null primary key,
candidate_id            bigint not null references candidate,
name                    text,
institution             text,
date_completed          text
);

create table candidate_attachment
(
id                      bigserial not null primary key,
candidate_id            bigint not null references candidate,
type                    text,
name                    text,
url                     text,
file_name               text,
created_by              bigint references users,
created_date            timestamp with time zone
);

create table admin_note
(
id                      bigserial not null primary key,
candidate_id            bigint not null references candidate,
comment                 text,
created_by              bigint references users,
created_date            timestamp with time zone
);


insert into users (username, password_enc, role, first_name, last_name, email, status)
values('jo', '$2a$10$LxKSxD8HD3Dy1ZSEpo8rV.FFehgd.lILL002epXj41ITvg9askvv6', 'admin','Jo', 'Thatcher', 'jo@digitalpurpose.com.au', 'active');

insert into users (username, password_enc, role, first_name, last_name, email, status)
values('dan', '$2a$10$LxKSxD8HD3Dy1ZSEpo8rV.FFehgd.lILL002epXj41ITvg9askvv6', 'admin','Dan', 'Zwolenski', 'dan@digitalpurpose.com.au', 'active');

insert into users (username, password_enc, role, first_name, last_name, email, status)
values('martina', '$2a$10$LxKSxD8HD3Dy1ZSEpo8rV.FFehgd.lILL002epXj41ITvg9askvv6', 'admin','Martina', 'Kainberger', 'martina@digitalpurpose.com.au', 'active');

insert into users (username, password_enc, role, first_name, last_name, email, status)
values('louise', '$2a$10$LxKSxD8HD3Dy1ZSEpo8rV.FFehgd.lILL002epXj41ITvg9askvv6', 'admin','Louise', 'Muszynkski', 'louise@digitalpurpose.com.au', 'active');

insert into users (username, password_enc, role, first_name, last_name, email, status)
values('dean', '$2a$10$LxKSxD8HD3Dy1ZSEpo8rV.FFehgd.lILL002epXj41ITvg9askvv6', 'admin','Dean', 'El-Mouslimani', 'dean@digitalpurpose.com.au', 'active');

insert into users (username, password_enc, role, first_name, last_name, email, status)
values('caroline', '$2a$10$LxKSxD8HD3Dy1ZSEpo8rV.FFehgd.lILL002epXj41ITvg9askvv6', 'admin','Caroline', 'Cameron', 'caroline@cameronfoundation.org', 'active');



