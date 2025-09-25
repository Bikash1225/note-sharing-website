from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Note, DownloadLog
from datetime import datetime

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user statistics
        uploaded_notes = Note.query.filter_by(uploaded_by=user_id).count()
        approved_notes = Note.query.filter_by(uploaded_by=user_id, is_approved=True).count()
        total_downloads = db.session.query(DownloadLog)\
                                   .join(Note, DownloadLog.note_id == Note.id)\
                                   .filter(Note.uploaded_by == user_id).count()
        
        user_data = user.to_dict()
        user_data['stats'] = {
            'uploaded_notes': uploaded_notes,
            'approved_notes': approved_notes,
            'total_downloads': total_downloads
        }
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/activity', methods=['GET'])
@jwt_required()
def get_user_activity():
    try:
        user_id = get_jwt_identity()
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        activity_type = request.args.get('type', 'all')  # 'uploads', 'downloads', 'all'
        
        activities = []
        
        if activity_type in ['uploads', 'all']:
            # Get user's uploaded notes
            uploaded_notes = Note.query.filter_by(uploaded_by=user_id)\
                                      .order_by(Note.created_at.desc())\
                                      .limit(per_page if activity_type == 'uploads' else per_page//2)\
                                      .all()
            
            for note in uploaded_notes:
                activities.append({
                    'type': 'upload',
                    'date': note.created_at.isoformat(),
                    'note': note.to_dict(),
                    'description': f'Uploaded "{note.title}"'
                })
        
        if activity_type in ['downloads', 'all']:
            # Get user's download history
            downloads = DownloadLog.query.filter_by(downloaded_by=user_id)\
                                        .order_by(DownloadLog.download_date.desc())\
                                        .limit(per_page if activity_type == 'downloads' else per_page//2)\
                                        .all()
            
            for download in downloads:
                activities.append({
                    'type': 'download',
                    'date': download.download_date.isoformat(),
                    'note': download.note.to_dict() if download.note else None,
                    'description': f'Downloaded "{download.note.title if download.note else "Unknown"}"'
                })
        
        # Sort activities by date (newest first)
        activities.sort(key=lambda x: x['date'], reverse=True)
        
        # Apply pagination manually
        start = (page - 1) * per_page
        end = start + per_page
        paginated_activities = activities[start:end]
        
        return jsonify({
            'activities': paginated_activities,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': len(activities),
                'has_next': end < len(activities),
                'has_prev': page > 1
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/download-history', methods=['GET'])
@jwt_required()
def get_download_history():
    try:
        user_id = get_jwt_identity()
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        
        # Get download history
        downloads = DownloadLog.query.filter_by(downloaded_by=user_id)\
                                    .order_by(DownloadLog.download_date.desc())\
                                    .paginate(page=page, per_page=per_page, error_out=False)
        
        download_data = []
        for download in downloads.items:
            if download.note:  # Check if note still exists
                download_data.append({
                    'id': download.id,
                    'download_date': download.download_date.isoformat(),
                    'note': download.note.to_dict()
                })
        
        return jsonify({
            'downloads': download_data,
            'pagination': {
                'page': page,
                'pages': downloads.pages,
                'per_page': per_page,
                'total': downloads.total,
                'has_next': downloads.has_next,
                'has_prev': downloads.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<int:user_id>/public-profile', methods=['GET'])
def get_public_profile(user_id):
    try:
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'User not found'}), 404
        
        # Get public user information (limited fields)
        public_data = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'college_name': user.college_name,
            'department': user.department,
            'semester': user.semester,
            'profile_picture': user.profile_picture,
            'created_at': user.created_at.isoformat()
        }
        
        # Get user's public notes statistics
        total_notes = Note.query.filter_by(uploaded_by=user_id, is_approved=True, is_public=True).count()
        total_downloads = db.session.query(DownloadLog)\
                                   .join(Note, DownloadLog.note_id == Note.id)\
                                   .filter(Note.uploaded_by == user_id, 
                                          Note.is_approved == True, 
                                          Note.is_public == True).count()
        
        public_data['stats'] = {
            'total_notes': total_notes,
            'total_downloads': total_downloads
        }
        
        # Get recent public notes
        recent_notes = Note.query.filter_by(uploaded_by=user_id, is_approved=True, is_public=True)\
                                .order_by(Note.created_at.desc())\
                                .limit(5).all()
        
        public_data['recent_notes'] = [note.to_dict() for note in recent_notes]
        
        return jsonify({'user': public_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/search', methods=['GET'])
def search_users():
    try:
        # Get query parameters
        query = request.args.get('q', '').strip()
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Search users by name or username
        search_term = f"%{query}%"
        users = User.query.filter(
            (User.first_name.ilike(search_term) |
             User.last_name.ilike(search_term) |
             User.username.ilike(search_term)) &
            (User.is_active == True) &
            (User.user_type == 'student')
        ).order_by(User.first_name, User.last_name)\
         .paginate(page=page, per_page=per_page, error_out=False)
        
        # Return limited public information
        user_data = []
        for user in users.items:
            user_data.append({
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'college_name': user.college_name,
                'department': user.department,
                'semester': user.semester,
                'profile_picture': user.profile_picture
            })
        
        return jsonify({
            'users': user_data,
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