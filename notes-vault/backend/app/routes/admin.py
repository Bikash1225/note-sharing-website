from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Note, DownloadLog, SystemSettings, Subject
from datetime import datetime, timedelta
from sqlalchemy import func, desc
from functools import wraps

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to check if user is admin"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.user_type not in ['admin', 'teacher']:
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/dashboard-stats', methods=['GET'])
@admin_required()
def get_dashboard_stats():
    try:
        # Get basic counts
        total_users = User.query.filter_by(user_type='student').count()
        total_notes = Note.query.count()
        pending_notes = Note.query.filter_by(is_approved=False).count()
        total_downloads = DownloadLog.query.count()
        
        # Get recent activity (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        new_users_week = User.query.filter(User.created_at >= week_ago).count()
        new_notes_week = Note.query.filter(Note.created_at >= week_ago).count()
        downloads_week = DownloadLog.query.filter(DownloadLog.download_date >= week_ago).count()
        
        # Get top subjects by note count
        top_subjects = db.session.query(
            Subject.name,
            func.count(Note.id).label('note_count')
        ).join(Note, Subject.id == Note.subject_id)\
         .group_by(Subject.id, Subject.name)\
         .order_by(desc('note_count'))\
         .limit(5).all()
        
        # Get recent uploads
        recent_notes = Note.query.order_by(Note.created_at.desc()).limit(5).all()
        
        return jsonify({
            'stats': {
                'total_users': total_users,
                'total_notes': total_notes,
                'pending_notes': pending_notes,
                'total_downloads': total_downloads,
                'new_users_week': new_users_week,
                'new_notes_week': new_notes_week,
                'downloads_week': downloads_week
            },
            'top_subjects': [
                {'name': subject.name, 'note_count': count} 
                for subject, count in top_subjects
            ],
            'recent_notes': [note.to_dict() for note in recent_notes]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@admin_required()
def get_users():
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        search = request.args.get('search')
        user_type = request.args.get('user_type')
        
        # Base query
        query = User.query
        
        # Apply filters
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                User.first_name.ilike(search_term) |
                User.last_name.ilike(search_term) |
                User.email.ilike(search_term) |
                User.username.ilike(search_term)
            )
        
        if user_type:
            query = query.filter_by(user_type=user_type)
        
        # Order by creation date
        query = query.order_by(User.created_at.desc())
        
        # Paginate results
        users = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'users': [user.to_dict() for user in users.items],
            'pagination': {
                'page': page,
                'pages': users.pages,
                'per_page': per_page,
                'total': users.total,
                'has_next': users.has_next,
                'has_prev': users.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['POST'])
@admin_required()
def toggle_user_status(user_id):
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Don't allow deactivating other admins
        if user.user_type == 'admin':
            return jsonify({'error': 'Cannot modify admin user status'}), 403
        
        user.is_active = not user.is_active
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        status = 'activated' if user.is_active else 'deactivated'
        return jsonify({
            'message': f'User {status} successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/notes/pending', methods=['GET'])
@admin_required()
def get_pending_notes():
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        
        # Get pending notes
        notes = Note.query.filter_by(is_approved=False)\
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

@admin_bp.route('/notes/<int:note_id>/approve', methods=['POST'])
@admin_required()
def approve_note(note_id):
    try:
        admin_id = get_jwt_identity()
        note = Note.query.get(note_id)
        
        if not note:
            return jsonify({'error': 'Note not found'}), 404
        
        if note.is_approved:
            return jsonify({'error': 'Note is already approved'}), 400
        
        note.is_approved = True
        note.approved_by = admin_id
        note.approved_at = datetime.utcnow()
        note.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Note approved successfully',
            'note': note.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/notes/<int:note_id>/reject', methods=['POST'])
@admin_required()
def reject_note(note_id):
    try:
        note = Note.query.get(note_id)
        
        if not note:
            return jsonify({'error': 'Note not found'}), 404
        
        # Delete the file
        import os
        if os.path.exists(note.file_path):
            os.remove(note.file_path)
        
        # Delete the note record
        db.session.delete(note)
        db.session.commit()
        
        return jsonify({'message': 'Note rejected and deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/notes/<int:note_id>', methods=['DELETE'])
@admin_required()
def delete_note(note_id):
    try:
        note = Note.query.get(note_id)
        
        if not note:
            return jsonify({'error': 'Note not found'}), 404
        
        # Delete the file
        import os
        if os.path.exists(note.file_path):
            os.remove(note.file_path)
        
        # Delete the note record (cascade will handle related records)
        db.session.delete(note)
        db.session.commit()
        
        return jsonify({'message': 'Note deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/subjects', methods=['POST'])
@admin_required()
def create_subject():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'code']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if subject code already exists
        if Subject.query.filter_by(code=data['code']).first():
            return jsonify({'error': 'Subject code already exists'}), 400
        
        # Create new subject
        subject = Subject(
            name=data['name'],
            code=data['code'],
            description=data.get('description'),
            department=data.get('department'),
            semester=data.get('semester')
        )
        
        db.session.add(subject)
        db.session.commit()
        
        return jsonify({
            'message': 'Subject created successfully',
            'subject': subject.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/subjects/<int:subject_id>', methods=['PUT'])
@admin_required()
def update_subject(subject_id):
    try:
        subject = Subject.query.get(subject_id)
        
        if not subject:
            return jsonify({'error': 'Subject not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = ['name', 'code', 'description', 'department', 'semester']
        
        for field in allowed_fields:
            if field in data:
                # Check if code is unique (if being updated)
                if field == 'code' and data[field] != subject.code:
                    if Subject.query.filter_by(code=data[field]).first():
                        return jsonify({'error': 'Subject code already exists'}), 400
                
                setattr(subject, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Subject updated successfully',
            'subject': subject.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/subjects/<int:subject_id>', methods=['DELETE'])
@admin_required()
def delete_subject(subject_id):
    try:
        subject = Subject.query.get(subject_id)
        
        if not subject:
            return jsonify({'error': 'Subject not found'}), 404
        
        # Check if subject has notes
        if subject.notes.count() > 0:
            return jsonify({'error': 'Cannot delete subject with existing notes'}), 400
        
        db.session.delete(subject)
        db.session.commit()
        
        return jsonify({'message': 'Subject deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/settings', methods=['GET'])
@admin_required()
def get_settings():
    try:
        settings = SystemSettings.query.all()
        return jsonify({
            'settings': [setting.to_dict() for setting in settings]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/settings/<setting_key>', methods=['PUT'])
@admin_required()
def update_setting(setting_key):
    try:
        admin_id = get_jwt_identity()
        data = request.get_json()
        
        if 'value' not in data:
            return jsonify({'error': 'Setting value is required'}), 400
        
        setting = SystemSettings.query.filter_by(setting_key=setting_key).first()
        
        if not setting:
            return jsonify({'error': 'Setting not found'}), 404
        
        setting.setting_value = data['value']
        setting.updated_by = admin_id
        setting.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Setting updated successfully',
            'setting': setting.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500