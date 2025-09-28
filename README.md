# Note Sharing Website

A simple student note sharing platform built with Node.js, Express, SQLite, and Clerk authentication.

## Features

- User authentication with Clerk.com
- Upload notes with file attachments
- Filter notes by course, subject, and tags
- Vote on notes (upvote/downvote)
- User profiles with bio and profile pictures
- Admin panel for user management and content moderation

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Clerk Authentication

1. Create a free account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your API keys from the Clerk dashboard
4. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

5. Fill in your Clerk keys in the `.env` file:
   - `CLERK_FRONTEND_API` - Your Frontend API key
   - `CLERK_PUBLISHABLE_KEY` - Your Publishable key  
   - `CLERK_SECRET_KEY` - Your Secret key

6. Update the publishable key in `frontend/js/auth.js`:
   - Replace `pk_test_your-publishable-key-here` with your actual publishable key

### 3. Create Upload Directories

```bash
mkdir -p uploads/profiles
mkdir -p uploads/notes
```

### 4. Initialize Database

The database will be automatically created when you first run the application. The SQLite file will be created at `backend/notes.db`.

### 5. Start the Application

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Making a User Admin

To give admin privileges to a user:

1. First, have the user sign up and log in to create their account
2. Open the SQLite database file (`backend/notes.db`) with a SQLite client
3. Find the user in the `users` table and update their `is_admin` field:

```sql
UPDATE users SET is_admin = 1 WHERE email = 'admin@example.com';
```

Or using the SQLite command line:
```bash
sqlite3 backend/notes.db "UPDATE users SET is_admin = 1 WHERE email = 'admin@example.com';"
```

## File Structure

```
/
├── backend/
│   ├── app.js              # Express server setup
│   ├── db.js               # Database connection and initialization
│   ├── routes/             # API routes
│   ├── migrations/         # Database schema
│   └── notes.db           # SQLite database (created automatically)
├── frontend/
│   ├── *.html             # HTML pages
│   ├── css/style.css      # Styling
│   └── js/                # Frontend JavaScript
├── uploads/
│   ├── profiles/          # Profile pictures
│   └── notes/             # Uploaded note files
├── package.json
├── .env                   # Environment variables (create from .env.example)
└── README.md
```

## Supported File Types

- **Notes**: PDF, DOC, DOCX, JPG, JPEG, PNG (max 10MB)
- **Profile Pictures**: JPG, JPEG, PNG (max 2MB)

## Courses Supported

- BCA (Bachelor of Computer Applications)
- MCA (Master of Computer Applications)  
- BBA (Bachelor of Business Administration)
- CCC (Course on Computer Concepts)
- A Level

## Admin Features

Admin users have access to:
- View all users
- Ban/unban users
- Delete any note
- View system statistics

## Database Schema

The application uses SQLite with the following tables:
- `users` - User information and admin status
- `notes` - Uploaded notes with metadata
- `votes` - User votes on notes
- `bans` - Ban history and reasons

## Troubleshooting

### Common Issues

1. **"Not authenticated" errors**: Make sure your Clerk keys are properly set in both `.env` and `auth.js`

2. **File upload fails**: Check that the `uploads` directories exist and have write permissions

3. **Database errors**: Delete `backend/notes.db` to reset the database (you'll lose all data)

4. **Admin panel not accessible**: Make sure you've set `is_admin = 1` for your user in the database

### Getting Help

This is a student project template. For issues with Clerk authentication, check their [documentation](https://clerk.com/docs).