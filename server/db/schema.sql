-- Create ENUMs
CREATE TYPE doctor_type AS ENUM ('general', 'child');
CREATE TYPE session_type_enum AS ENUM ('morning', 'evening');
CREATE TYPE booking_status AS ENUM ('confirmed', 'called', 'completed', 'cancelled', 'no_show');
CREATE TYPE admin_role AS ENUM ('superadmin', 'receptionist');

-- Create Tables
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    type doctor_type NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    session_type session_type_enum NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_tokens INT NOT NULL,
    booking_opens_at TIME NOT NULL,
    booking_closes_before_minutes INT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref VARCHAR UNIQUE NOT NULL,
    patient_name VARCHAR NOT NULL,
    patient_phone VARCHAR NOT NULL,
    patient_age_years INT NOT NULL,
    patient_age_months INT NOT NULL,
    patient_age_days INT NOT NULL,
    location TEXT NOT NULL,
    doctor_id UUID REFERENCES doctors(id),
    session_id UUID REFERENCES sessions(id),
    booking_date DATE NOT NULL,
    token_number INT NOT NULL,
    estimated_time TIME NOT NULL,
    status booking_status DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, booking_date, token_number)
);

CREATE TABLE blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    blocked_date DATE NOT NULL,
    session_type session_type_enum, -- NULL means full day
    reason VARCHAR,
    UNIQUE(doctor_id, blocked_date, session_type)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    phone VARCHAR,
    username VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    role admin_role DEFAULT 'superadmin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data
INSERT INTO doctors (id, name, type, is_active) VALUES
('d1bf98b4-0c2d-4d7a-b153-f72671fc82d5', 'Dr. Smith (General)', 'general', true),
('70fae1bd-1974-4b95-a8fa-7ca2acbf9368', 'Dr. Sarah (Child Specialist)', 'child', true);

INSERT INTO sessions (doctor_id, session_type, start_time, end_time, max_tokens, booking_opens_at, booking_closes_before_minutes, is_active) VALUES
('d1bf98b4-0c2d-4d7a-b153-f72671fc82d5', 'morning', '09:00:00', '12:00:00', 200, '22:00:00', 60, true),
('d1bf98b4-0c2d-4d7a-b153-f72671fc82d5', 'evening', '17:00:00', '20:00:00', 200, '22:00:00', 60, true),
('70fae1bd-1974-4b95-a8fa-7ca2acbf9368', 'morning', '09:30:00', '11:30:00', 200, '22:00:00', 60, true),
('70fae1bd-1974-4b95-a8fa-7ca2acbf9368', 'evening', '17:30:00', '19:30:00', 200, '22:00:00', 60, true);

-- Default Superadmin (password: admin)
INSERT INTO users (name, phone, username, password, role) VALUES
('Admin', '1234567890', 'admin', 'admin', 'superadmin');
