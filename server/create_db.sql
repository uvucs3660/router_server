CREATE TABLE document_store (
  id serial primary key,
  path VARCHAR(255) NULL,
  data JSONB NULL,
  created TIMESTAMP NULL DEFAULT now(),
  db_user VARCHAR(255) NULL DEFAULT current_user
);

CREATE UNIQUE INDEX document_store_path_key ON document_store (path);

CREATE TABLE IF NOT EXISTS public.short_urls
(
    short_id bigserial,
    url text NOT NULL,
    CONSTRAINT short_urls_pkey PRIMARY KEY (short_id)
);

create table mqtt_user (
id bigserial primary key,
username character varying (100) not null,
password_hash character varying (200) not null,
is_admin boolean not null);

create table mqtt_acl (
id bigserial primary key,
mqtt_user_id bigint not null references mqtt_user on delete cascade,
topic character varying (200) not null,
rw int not null);
 
insert into mqtt_user values(1,'mqtt','PBKDF2$sha512$100000$os24lcPr9cJt2QDVWssblQ==$BK1BQ2wbwU1zNxv3Ml3wLuu5//hPop3/LvaPYjjCwdBvnpwusnukJPpcXQzyyjOlZdieXTx6sXAcX4WnZRZZnw==',true);
insert into mqtt_acl values(1,1,'mqtt_user/#',2);

create user mqtt_admin with encrypted password 'all4mqtt!';

GRANT ALL PRIVILEGES ON TABLE mqtt_user, mqtt_acl TO mqtt_admin;
GRANT ALL PRIVILEGES ON SEQUENCE mqtt_user_id_seq, mqtt_acl_id_seq TO mqtt_admin;
