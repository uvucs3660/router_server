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
