from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    student_id = db.Column(db.String(50))
    college_name = db.Column(db.String(200))
    department = db.Column(db.String(100))
    semester = db.Column(db.String(20))
    phone = db.Column(db.String(20))
    user_type = db.Column(db.Enum('student', 'admin', 'teacher'), default='student')
    is_active = db.Column(db.Boolean, default=True)
    email_verified = db.Column(db.Boolean, default=False)
    profile_picture = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    uploaded_notes = db.relationship('Note', foreign_keys='Note.uploaded_by', backref='uploader', lazy='dynamic')
    approved_notes = db.relationship('Note', foreign_keys='Note.approved_by', backref='approver', lazy='dynamic')
    downloads = db.relationship('DownloadLog', backref='user', lazy='dynamic')
    bookmarks = db.relationship('Bookmark', backref='user', lazy='dynamic')
    comments = db.relationship('Comment', backref='user', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'student_id': self.student_id,
            'college_name': self.college_name,
            'department': self.department,
            'semester': self.semester,
            'phone': self.phone,
            'user_type': self.user_type,
            'is_active': self.is_active,
            'email_verified': self.email_verified,
            'profile_picture': self.profile_picture,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class Subject(db.Model):
    __tablename__ = 'subjects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    description = db.Column(db.Text)
    department = db.Column(db.String(100))
    semester = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    notes = db.relationship('Note', backref='subject', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'department': self.department,
            'semester': self.semester,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Note(db.Model):
    __tablename__ = 'notes'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    file_name = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)
    file_type = db.Column(db.String(50))
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'))
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    semester = db.Column(db.String(20))
    academic_year = db.Column(db.String(10))
    tags = db.Column(db.Text)
    download_count = db.Column(db.Integer, default=0)
    is_approved = db.Column(db.Boolean, default=False)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    approved_at = db.Column(db.DateTime)
    is_public = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    downloads = db.relationship('DownloadLog', backref='note', lazy='dynamic')
    bookmarks = db.relationship('Bookmark', backref='note', lazy='dynamic')
    comments = db.relationship('Comment', backref='note', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'file_name': self.file_name,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'subject_id': self.subject_id,
            'uploaded_by': self.uploaded_by,
            'semester': self.semester,
            'academic_year': self.academic_year,
            'tags': self.tags.split(',') if self.tags else [],
            'download_count': self.download_count,
            'is_approved': self.is_approved,
            'approved_by': self.approved_by,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'uploader': self.uploader.to_dict() if self.uploader else None,
            'subject': self.subject.to_dict() if self.subject else None
        }

class DownloadLog(db.Model):
    __tablename__ = 'download_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    note_id = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=False)
    downloaded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    download_date = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'note_id': self.note_id,
            'downloaded_by': self.downloaded_by,
            'download_date': self.download_date.isoformat() if self.download_date else None,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent
        }

class Bookmark(db.Model):
    __tablename__ = 'bookmarks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    note_id = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'note_id', name='unique_bookmark'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'note_id': self.note_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Comment(db.Model):
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    note_id = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'note_id': self.note_id,
            'user_id': self.user_id,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user': self.user.to_dict() if self.user else None
        }

class SystemSettings(db.Model):
    __tablename__ = 'system_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    setting_key = db.Column(db.String(100), unique=True, nullable=False)
    setting_value = db.Column(db.Text)
    description = db.Column(db.Text)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'setting_key': self.setting_key,
            'setting_value': self.setting_value,
            'description': self.description,
            'updated_by': self.updated_by,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }