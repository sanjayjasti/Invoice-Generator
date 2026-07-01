"""
Test models and basic functionality.
"""

import pytest
from decimal import Decimal
from app.models import Business, User, Client, Invoice, InvoiceLineItem
from app.extensions import db


def test_business_model(app, sample_business):
    """Test Business model basic functionality."""
    with app.app_context():
        assert sample_business.name == "Test Business"
        assert sample_business.next_invoice_seq == 1
        
        # Test invoice number generation
        invoice_number = sample_business.get_next_invoice_number()
        assert invoice_number == "INV-0001"
        assert sample_business.next_invoice_seq == 2


def test_user_model(app, sample_user):
    """Test User model and password handling."""
    with app.app_context():
        # Test password hashing
        sample_user.set_password("newpassword")
        assert sample_user.check_password("newpassword")
        assert not sample_user.check_password("wrongpassword")
        
        # Test role methods
        assert sample_user.is_owner()
        assert not sample_user.is_member()


def test_client_model(app, sample_client):
    """Test Client model functionality.""" 
    with app.app_context():
        assert sample_client.get_display_name() == "Example Corp"
        assert sample_client.get_invoice_count() == 0
        assert sample_client.get_total_invoiced() == 0.0


def test_invoice_model(app, sample_business, sample_client):
    """Test Invoice model and calculations."""
    with app.app_context():
        from datetime import date, timedelta
        
        # Create invoice with explicit due_date
        invoice = Invoice(
            business_id=sample_business.id,
            client_id=sample_client.id,
            invoice_number="INV-TEST-001",
            due_date=date.today() + timedelta(days=30)
        )
        db.session.add(invoice)
        db.session.flush()
        
        # Add line items
        line_item1 = InvoiceLineItem(
            invoice_id=invoice.id,
            description="Consulting",
            quantity=Decimal('10'),
            unit_price=Decimal('100.00')
        )
        line_item1.calculate_line_total()
        
        line_item2 = InvoiceLineItem(
            invoice_id=invoice.id,
            description="Travel",
            quantity=Decimal('1'),
            unit_price=Decimal('250.00')
        )
        line_item2.calculate_line_total()
        
        db.session.add_all([line_item1, line_item2])
        db.session.flush()
        
        # Calculate totals
        invoice.calculate_totals()
        
        assert invoice.subtotal == Decimal('1250.00')
        assert len(list(invoice.line_items)) == 2


def test_invoice_status_transitions(app, sample_business, sample_client):
    """Test invoice status state machine."""
    with app.app_context():
        from datetime import date, timedelta
        
        invoice = Invoice(
            business_id=sample_business.id,
            client_id=sample_client.id,
            invoice_number="INV-STATUS-001",
            due_date=date.today() + timedelta(days=30)
        )
        db.session.add(invoice)
        db.session.commit()
        
        # Test valid transitions
        assert invoice.status == Invoice.STATUS_DRAFT
        assert invoice.can_transition_to(Invoice.STATUS_SENT)
        
        old_status, new_status = invoice.update_status(Invoice.STATUS_SENT)
        assert old_status == Invoice.STATUS_DRAFT
        assert new_status == Invoice.STATUS_SENT
        
        # Test invalid transition
        assert not invoice.can_transition_to(Invoice.STATUS_DRAFT)


def test_tenant_isolation():
    """Critical test - ensure tenant isolation works."""
    # This is a placeholder for the actual tenant isolation test
    # Will be implemented in Phase 1 with proper test fixtures
    pass