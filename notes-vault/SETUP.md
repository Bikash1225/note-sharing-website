# Notes Vault Setup Instructions

## Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- MySQL Server 8.0 or higher
- Git (for version control)

## Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   SECRET_KEY=your-secret-key-here
   JWT_SECRET_KEY=your-jwt-secret-key
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your-mysql-password
   MYSQL_DB=notes_vault
   FLASK_ENV=development
   ```

5. **Set up the database:**
   ```bash
   # Create database in MySQL
   mysql -u root -p
   CREATE DATABASE notes_vault;
   exit;

   # Import the schema
   mysql -u root -p notes_vault < ../database/schema.sql
   ```

6. **Run the backend server:**
   ```bash
   python run.py
   ```
   The API will be available at `http://localhost:5000`

## Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`

## Production Deployment

### Backend (Flask)
1. Use a production WSGI server like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 run:app
   ```

2. Set up a reverse proxy with Nginx
3. Use a process manager like systemd or supervisor
4. Enable HTTPS with Let's Encrypt

### Frontend (React)
1. Build the production version:
   ```bash
   npm run build
   ```

2. Serve with Nginx or deploy to services like:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront

### Database
1. Use a managed MySQL service for production
2. Set up automated backups
3. Configure SSL connections
4. Optimize for performance

## Environment Variables Reference

### Backend (.env)
- `SECRET_KEY`: Flask secret key for sessions
- `JWT_SECRET_KEY`: Secret key for JWT tokens
- `MYSQL_HOST`: MySQL server hostname
- `MYSQL_USER`: MySQL username
- `MYSQL_PASSWORD`: MySQL password
- `MYSQL_DB`: Database name
- `FLASK_ENV`: Environment (development/production)

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API base URL

## Default Admin Account
- Email: admin@notesvault.com
- Password: admin123

**Important:** Change the admin password immediately after first login in production!

## Troubleshooting

### Common Issues:

1. **MySQL Connection Error:**
   - Ensure MySQL server is running
   - Check credentials in .env file
   - Verify database exists

2. **Module Import Errors:**
   - Ensure virtual environment is activated
   - Reinstall requirements: `pip install -r requirements.txt`

3. **CORS Errors:**
   - Check API URL in frontend .env
   - Ensure Flask-CORS is properly configured

4. **Port Already in Use:**
   - Change port in run.py or package.json
   - Kill existing processes: `pkill -f python` or `pkill -f node`

## Development Tips

1. **Database Migrations:**
   Use Flask-Migrate for database schema changes:
   ```bash
   flask db init
   flask db migrate -m "Description"
   flask db upgrade
   ```

2. **Code Formatting:**
   - Backend: Use Black for Python code formatting
   - Frontend: Use Prettier for JavaScript/React formatting

3. **Testing:**
   - Write unit tests for API endpoints
   - Use React Testing Library for frontend tests
   - Set up CI/CD pipeline for automated testing

4. **Monitoring:**
   - Use logging for debugging
   - Monitor API performance
   - Set up error tracking (e.g., Sentry)

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the code documentation
3. Create an issue in the project repository