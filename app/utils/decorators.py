"""
Decorators for authentication and tenant scoping.
Critical for multi-tenant data isolation.
"""

from functools import wraps
from flask import g, abort, request, jsonify
from flask_login import current_user
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.business import Business


def get_current_business():
    """
    Get the current business context.
    Works for both web (Flask-Login) and API (JWT) requests.
    
    Returns:
        Business object or None if not authenticated
    """
    # Check if we already have business in g
    if hasattr(g, 'current_business') and g.current_business:
        return g.current_business
    
    user = None
    
    # Try Flask-Login first (web routes)
    try:
        from flask_login import current_user
        if hasattr(current_user, 'is_authenticated') and current_user.is_authenticated:
            user = current_user
    except ImportError:
        pass
    
    # Try JWT (API routes) if Flask-Login didn't work
    if not user:
        try:
            user_id = get_jwt_identity()
            if user_id:
                user = User.query.get(user_id)
        except:
            pass
    
    if user and hasattr(user, 'business_id') and user.business_id:
        business = Business.query.get(user.business_id)
        g.current_business = business
        g.current_user = user
        return business
    
    return None


def require_business(f):
    """
    Decorator to require business context for multi-tenant scoping.
    Works for both web and API routes.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        business = get_current_business()
        if not business:
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Authentication required'}), 401
            else:
                abort(401)
        return f(*args, **kwargs)
    return decorated_function


def owner_required(f):
    """
    Decorator to require business owner role.
    Must be used after @require_business.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = getattr(g, 'current_user', None)
        if not user or not user.is_owner():
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Owner access required'}), 403
            else:
                abort(403)
        return f(*args, **kwargs)
    return decorated_function


def api_auth_required(f):
    """
    Decorator for API routes that require JWT authentication.
    Also sets up business context.
    """
    @wraps(f)
    @jwt_required()
    @require_business
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)
    return decorated_function


def web_auth_required(f):
    """
    Decorator for web routes that require login.
    Also sets up business context.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # First check Flask-Login authentication
        from flask_login import current_user
        if not current_user.is_authenticated:
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Authentication required'}), 401
            else:
                return redirect(url_for('web.login'))
        
        # Then check business context
        business = get_current_business()
        if not business:
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Business context required'}), 401
            else:
                return redirect(url_for('web.login'))
        
        return f(*args, **kwargs)
    return decorated_function