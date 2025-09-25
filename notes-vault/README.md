# Notes Vault - College Note Sharing Website

## Overview
Notes Vault is a centralized note sharing platform designed for college students, faculty, and staff. It provides a secure, user-friendly environment for uploading, downloading, and managing academic resources.

## Features
- **Student Features:**
  - User registration and profile management
  - Upload notes in multiple formats (PDF, DOCX, PPT)
  - Browse and download notes by subject
  - Personal dashboard with activity tracking

- **Admin/Faculty Features:**
  - Manage student registrations
  - Content moderation and quality control
  - System settings and configuration
  - Download logs and analytics

## Technology Stack
- **Frontend:** React.js, HTML5, CSS3, JavaScript
- **Backend:** Python (Flask)
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Local file system with organized structure

## Project Structure
```
notes-vault/
├── frontend/          # React.js application
├── backend/           # Python Flask API
├── database/          # Database schema and migrations
└── docs/              # Project documentation
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MySQL Server
- npm or yarn

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment: `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Configure database settings in `config.py`
6. Run database migrations: `python manage.py db upgrade`
7. Start the server: `python app.py`

### Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm start`

### Database Setup
1. Create MySQL database: `notes_vault`
2. Import schema from `database/schema.sql`
3. Update connection settings in backend configuration

## Usage
1. Start the backend server (runs on http://localhost:5000)
2. Start the frontend development server (runs on http://localhost:3000)
3. Access the application through your web browser
4. Register as a student or login as admin

## Contributing
This is an academic project. Please follow the contribution guidelines if you're part of the development team.

## License
This project is for educational purposes only.