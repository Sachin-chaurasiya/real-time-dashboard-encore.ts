CREATE TABLE sales (
    id BIGSERIAL PRIMARY KEY,
    sale VARCHAR(255) NOT NULL,
    total INTEGER NOT NULL,
    date DATE NOT NULL
);