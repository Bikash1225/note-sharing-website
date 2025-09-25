from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.models import Note, Subject, User, DownloadLog, Bookmark
from datetime import datetime
import os
import uuid
from sqlalchemy import or_

notes_bp = Blueprint('notes', __name__)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def get_file_size(file_path):
    try:
        return os.path.getsize(file_path)
    except:
        return 0

@notes_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_note():
    try:
        user_id = get_jwt_identity()
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Get form data
        title = request.form.get('title')
        description = request.form.get('description', '')
        subject_id = request.form.get('subject_id')
        semester = request.form.get('semester', '')
        academic_year = request.form.get('academic_year', '')
        tags = request.form.get('tags', '')
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        # Create unique filename
        original_filename = secure_filename(file.filename)
        file_extension = original_filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        
        # Create upload directory if it doesn't exist
        upload_folder = current_app.config['UPLOAD_FOLDER']
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        
        # Save file
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)
        
        # Get file size
        file_size = get_file_size(file_path)
        
        # Create note record
        note = Note(
            title=title,
            description=description,
            file_name=unique_filename,
            original_filename=original_filename,
            file_path=file_path,
            file_size=file_size,
            file_type=file_extension,
            subject_id=int(subject_id) if subject_id else None,
            uploaded_by=user_id,
            semester=semester,
            academic_year=academic_year,
            tags=tags
        )
        
        db.session.add(note)
        db.session.commit()
        
        return jsonify({
            'message': 'Note uploaded successfully',
            'note': note.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        # Clean up file if it was created
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/', methods=['GET'])
def get_notes():
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        subject_id = request.args.get('subject_id', type=int)
        semester = request.args.get('semester')
        search = request.args.get('search')
        user_id = request.args.get('user_id', type=int)
        
        # Base query - only approved and public notes
        query = Note.query.filter_by(is_approved=True, is_public=True)
        
        # Apply filters
        if subject_id:
            query = query.filter_by(subject_id=subject_id)
        
        if semester:
            query = query.filter_by(semester=semester)
        
        if user_id:
            query = query.filter_by(uploaded_by=user_id)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Note.title.ilike(search_term),
                    Note.description.ilike(search_term),
                    Note.tags.ilike(search_term)
                )
            )
        
        # Order by creation date (newest first)
        query = query.order_by(Note.created_at.desc())
        
        # Paginate results
        notes = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'notes': [note.to_dict() for note in notes.items],
            'pagination': {
                'page': page,
                'pages': notes.pages,
                'per_page': per_page,
                'total': notes.total,
                'has_next': notes.has_next,
                'has_prev': notes.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/<int:note_id>', methods=['GET'])
def get_note(note_id):
    try:
        note = Note.query.get(note_id)
        
        if not note:
            return jsonify({'error': 'Note not found'}), 404
        
        # Check if note is public or user is the owner
        if not note.is_public and not note.is_approved:
            return jsonify({'error': 'Note not available'}), 403
        
        return jsonify({'note': note.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/<int:note_id>/download', methods=['GET'])
@jwt_required()
def download_note(note_id):
    try:
        user_id = get_jwt_identity()
        note = Note.query.get(note_id)
        
        if not note:
            return jsonify({'error': 'Note not found'}), 404
        
        # Check if note is accessible
        if not note.is_public or not note.is_approved:
            return jsonify({'error': 'Note not available for download'}), 403
        
        # Check if file exists
        if not os.path.exists(note.file_path):
            return jsonify({'error': 'File not found on server'}), 404
        
        # Log the download
        download_log = DownloadLog(
            note_id=note_id,
            downloaded_by=user_id,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        
        # Increment download count
        note.download_count += 1
        
        db.session.add(download_log)
        db.session.commit()
        
        # Send file
        return send_file(
            note.file_path,
            as_attachment=True,
            download_name=note.original_filename
        )
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/my-notes', methods=['GET'])
@jwt_required()
def get_my_notes():
    try:
        user_id = get_jwt_identity()
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        
        # Get user's notes
        notes = Note.query.filter_by(uploaded_by=user_id)\
                         .order_by(Note.created_at.desc())\
                         .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'notes': [note.to_dict() for note in notes.items],
            'pagination': {
                'page': page,
                'pages': notes.pages,
                'per_page': per_page,
                'total': notes.total,
                'has_next': notes.has_next,
                'has_prev': notes.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/<int:note_id>/bookmark', methods=['POST'])
@jwt_required()
def bookmark_note(note_id):
    try:
        user_id = get_jwt_identity()
        
        # Check if note exists
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'error': 'Note not found'}), 404
        
        # Check if already bookmarked
        existing_bookmark = Bookmark.query.filter_by(
            user_id=user_id, 
            note_id=note_id
        ).first()
        
        if existing_bookmark:
            return jsonify({'error': 'Note already bookmarked'}), 400
        
        # Create bookmark
        bookmark = Bookmark(user_id=user_id, note_id=note_id)
        db.session.add(bookmark)
        db.session.commit()
        
        return jsonify({'message': 'Note bookmarked successfully'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/<int:note_id>/bookmark', methods=['DELETE'])
@jwt_required()
def remove_bookmark(note_id):
    try:
        user_id = get_jwt_identity()
        
        bookmark = Bookmark.query.filter_by(
            user_id=user_id, 
            note_id=note_id
        ).first()
        
        if not bookmark:
            return jsonify({'error': 'Bookmark not found'}), 404
        
        db.session.delete(bookmark)
        db.session.commit()
        
        return jsonify({'message': 'Bookmark removed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/bookmarks', methods=['GET'])
@jwt_required()
def get_bookmarks():
    try:
        user_id = get_jwt_identity()
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        
        # Get bookmarked notes
        bookmarks = db.session.query(Note)\
                             .join(Bookmark, Note.id == Bookmark.note_id)\
                             .filter(Bookmark.user_id == user_id)\
                             .order_by(Bookmark.created_at.desc())\
                             .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'notes': [note.to_dict() for note in bookmarks.items],
            'pagination': {
                'page': page,
                'pages': bookmarks.pages,
                'per_page': per_page,
                'total': bookmarks.total,
                'has_next': bookmarks.has_next,
                'has_prev': bookmarks.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/subjects', methods=['GET'])
def get_subjects():
    try:
        subjects = Subject.query.all()
        return jsonify({
            'subjects': [subject.to_dict() for subject in subjects]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500