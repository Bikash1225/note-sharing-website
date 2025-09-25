-- Notes Vault Database Schema
-- MySQL Database for College Note Sharing System

CREATE DATABASE IF NOT EXISTS notes_vault;
USE notes_vault;

-- Users table (Students and Admin)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50),
    college_name VARCHAR(200),
    department VARCHAR(100),
    semester VARCHAR(20),
    phone VARCHAR(20),
    user_type ENUM('student', 'admin', 'teacher') DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Subjects table
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    department VARCHAR(100),
    semester VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    file_type VARCHAR(50),
    subject_id INT,
    uploaded_by INT NOT NULL,
    semester VARCHAR(20),
    academic_year VARCHAR(10),
    tags TEXT,
    download_count INT DEFAULT 0,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Download logs table
CREATE TABLE download_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note_id INT NOT NULL,
    downloaded_by INT NOT NULL,
    download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (downloaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Bookmarks table (for students to save favorite notes)
CREATE TABLE bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    note_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_bookmark (user_id, note_id)
);

-- Comments table (for notes)
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- System settings table
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default subjects
INSERT INTO subjects (name, code, description, department, semester) VALUES
('Mathematics I', 'MATH101', 'Basic Mathematics for Engineering', 'Mathematics', '1st'),
('Physics I', 'PHY101', 'Fundamentals of Physics', 'Physics', '1st'),
('Chemistry I', 'CHEM101', 'Basic Chemistry Concepts', 'Chemistry', '1st'),
('Computer Programming', 'CS101', 'Introduction to Programming', 'Computer Science', '1st'),
('English Communication', 'ENG101', 'English Language and Communication Skills', 'English', '1st'),
('Data Structures', 'CS201', 'Data Structures and Algorithms', 'Computer Science', '2nd'),
('Database Management', 'CS301', 'Database Design and Management', 'Computer Science', '3rd'),
('Web Development', 'CS302', 'Modern Web Development Technologies', 'Computer Science', '3rd');

-- Insert default admin user (password: admin123)
INSERT INTO users (email, username, password_hash, first_name, last_name, user_type, is_active, email_verified) VALUES
('admin@notesvault.com', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeOgE2ggzF6CvEQMe', 'System', 'Administrator', 'admin', TRUE, TRUE);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('max_file_size', '16777216', 'Maximum file size in bytes (16MB)'),
('allowed_file_types', 'pdf,docx,pptx,txt,doc,ppt', 'Allowed file extensions for upload'),
('require_approval', 'true', 'Whether notes require admin approval before being public'),
('site_name', 'Notes Vault', 'Name of the website'),
('site_description', 'College Note Sharing Platform', 'Description of the website');