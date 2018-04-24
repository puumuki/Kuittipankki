-- Create schemas
createdb kuittipankki;

CREATE ROLE kuittipankki WITH LOGIN PASSWORD 'kuittipankki';

GRANT ALL PRIVILEGES ON DATABASE kuittipankki to kuittipankki;

TRUNCATE TABLE "receipt";
TRUNCATE TABLE "file" ;
TRUNCATE TABLE "tag";
TRUNCATE TABLE "user" CASCADE;

-- Create tables
CREATE TABLE IF NOT EXISTS "receipt"
(
    receipt_id BIGSERIAL NOT NULL UNIQUE PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100),
    purchase_date TIMESTAMP,
    warrantly_end_date TIMESTAMP,
    store VARCHAR(200),
    registered TIMESTAMP,
    description TEXT,
    price VARCHAR(50),
    removed BOOLEAN DEFAULT false,
    created_by BIGINT NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by BIGINT NOT NULL,
    updated_on TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "user"
(
    user_id BIGSERIAL NOT NULL UNIQUE PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(200) NOT NULL,
    salt VARCHAR(200) NOT NULL,
    lang VARCHAR(10)  NOT NULL,
    removed BOOLEAN DEFAULT false,
    created_by BIGINT NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by BIGINT NOT NULL,
    updated_on TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "file"
(
    file_id BIGSERIAL NOT NULL UNIQUE PRIMARY KEY,
    receipt_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    filename VARCHAR(200) NOT NULL,
    original_file_name VARCHAR(300),
    thumbnail VARCHAR(100),
    mimetype VARCHAR(100),
    size INTEGER,
    width INTEGER,
    height INTEGER,
    depth INTEGER,
    density_x INTEGER,
    density_y INTEGER,
    removed BOOLEAN DEFAULT false,
    created_by BIGINT NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by BIGINT NOT NULL,
    updated_on TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE file ADD COLUMN density_x INTEGER;
ALTER TABLE file ADD COLUMN density_y INTEGER;

CREATE TABLE IF NOT EXISTS "tag"
(
    tag_id BIGSERIAL NOT NULL UNIQUE PRIMARY KEY,
    receipt_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    created_by BIGINT NOT NULL,
    removed BOOLEAN DEFAULT false,
    created_on TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by BIGINT NOT NULL,
    updated_on TIMESTAMP NOT NULL DEFAULT NOW()
);

-- File table foreign keys
ALTER TABLE file
  ADD CONSTRAINT fk_file_to_receipt_id
  FOREIGN KEY (receipt_id)
  REFERENCES receipt(receipt_id);
    
ALTER TABLE file
    ADD CONSTRAINT fk_file_user_id
    FOREIGN KEY (user_id)
    REFERENCES "user"(user_id);

ALTER TABLE file
    ADD CONSTRAINT fk_file_created_by
    FOREIGN KEY (created_by)
    REFERENCES "user"(user_id);

ALTER TABLE file
    ADD CONSTRAINT fk_file_updated_by
    FOREIGN KEY (updated_by)
    REFERENCES "user"(user_id);
    
-- Receipt table foreign keys
ALTER TABLE receipt
    ADD CONSTRAINT fk_receipt_to_user_id
    FOREIGN KEY (user_id)
    REFERENCES "user"(user_id);

ALTER TABLE receipt
    ADD CONSTRAINT fk_receipt_created_by
    FOREIGN KEY (created_by)
    REFERENCES "user"(user_id);

ALTER TABLE receipt
    ADD CONSTRAINT fk_receipt_updated_by
    FOREIGN KEY (updated_by)
    REFERENCES "user"(user_id);

-- Tags table foreign keys
ALTER TABLE tag
    ADD CONSTRAINT fk_tag_receipt_id
    FOREIGN KEY (receipt_id)
    REFERENCES receipt(receipt_id);   

ALTER TABLE tag
    ADD CONSTRAINT fk_tag_created_by
    FOREIGN KEY (created_by)
    REFERENCES "user"(user_id);

 ALTER TABLE tag
    ADD CONSTRAINT fk_tag_updated_by
    FOREIGN KEY (updated_by)
    REFERENCES "user"(user_id);

-- Create Indexes

-- Add system users

INSERT INTO "user" (
    user_id,
    username,
    password,
    salt,
    lang,
    created_by,
    updated_by
)
VALUES (
    1,
    'admin',
    '',
    '',
    'en',
    1,
    1
);

INSERT INTO "user" (
    user_id,
    username,
    password,
    salt,
    lang,
    created_by,
    updated_by
)
VALUES (
    2,
    'integration',
    '',
    '',
    'en',
    1,
    1
);