"""
Test configuration and fixtures.
"""

import pytest
import tempfile
import os
from app import create_app
from app.extensions import db
from app.models import Business, User, Client, Invoice


@pytest.fixture
def app():
    """Create application for testing."""
    # Create temporary database
    db_fd, db_path = tempfile.mkstemp()
    
    app = create_app('testing')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['TESTING'] = True
    
    with app.app_context():
        db.create_all()
        yield app
        
    # Clean up
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    """Test client."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Test CLI runner."""
    return app.test_cli_runner()


@pytest.fixture
def sample_business():
    """Create sample business."""
    business = Business(
        name="Test Business",
        address="123 Test St\nTest City, TS 12345",
        tax_id="123456789",
        accent_color="#007bff"
    )
    db.session.add(business)
    db.session.commit()
    return business


@pytest.fixture  
def sample_user(sample_business):
    """Create sample user."""
    user = User(
        business_id=sample_business.id,
        email="test@example.com",
        role=User.ROLE_OWNER
    )
    user.set_password("password123")
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def sample_client(sample_business):
    """Create sample client."""
    client = Client(
        business_id=sample_business.id,
        name="John Doe",
        email="john@example.com",
        company_name="Example Corp",
        billing_address="456 Client Ave\nClient City, CC 67890"
    )
    db.session.add(client)
    db.session.commit()
    return client