// Invoice form JavaScript - dynamic line item management

document.addEventListener('DOMContentLoaded', function() {
    // Initialize line item functionality
    initializeLineItems();
    
    // Initialize calculation updates
    initializeCalculations();
});

function initializeLineItems() {
    const addLineItemBtn = document.getElementById('add-line-item');
    const lineItemsContainer = document.getElementById('line-items-container');
    
    if (!addLineItemBtn || !lineItemsContainer) return;
    
    // Add new line item
    addLineItemBtn.addEventListener('click', function() {
        const lineItemCount = lineItemsContainer.children.length;
        const newLineItem = createLineItemRow(lineItemCount);
        lineItemsContainer.appendChild(newLineItem);
        
        // Reinitialize calculations for new row
        initializeCalculations();
    });
    
    // Handle remove line item (event delegation)
    lineItemsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-line-item')) {
            e.preventDefault();
            const row = e.target.closest('.line-item-row');
            if (lineItemsContainer.children.length > 1) {
                row.remove();
                updateCalculations();
                renumberLineItems();
            }
        }
    });
}

function createLineItemRow(index) {
    const template = `
        <div class="line-item-row">
            <div class="row mb-3">
                <div class="col-md-4">
                    <label class="form-label">Description *</label>
                    <input type="text" class="form-control" name="line_items[${index}][description]" required>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Quantity *</label>
                    <input type="number" class="form-control line-quantity" name="line_items[${index}][quantity]" 
                        min="0.001" step="0.001" value="1" required>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Unit Price *</label>
                    <input type="number" class="form-control line-price" name="line_items[${index}][unit_price]" 
                        min="0" step="0.01" required>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Tax Rate (%)</label>
                    <input type="number" class="form-control line-tax" name="line_items[${index}][tax_rate]" 
                        min="0" max="100" step="0.01">
                </div>
                <div class="col-md-1">
                    <label class="form-label">Total</label>
                    <input type="text" class="form-control line-total" readonly value="$0.00">
                </div>
                <div class="col-md-1">
                    <label class="form-label">&nbsp;</label>
                    <button type="button" class="btn btn-outline-danger btn-sm remove-line-item d-block">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>`;
    
    const div = document.createElement('div');
    div.innerHTML = template;
    return div.firstElementChild;
}

function initializeCalculations() {
    const lineItemsContainer = document.getElementById('line-items-container');
    if (!lineItemsContainer) return;
    
    // Add event listeners to all calculation inputs
    const inputs = lineItemsContainer.querySelectorAll('.line-quantity, .line-price, .line-tax');
    inputs.forEach(input => {
        input.addEventListener('input', updateCalculations);
        input.addEventListener('change', updateCalculations);
    });
    
    // Add listener to discount input
    const discountInput = document.getElementById('discount');
    if (discountInput) {
        discountInput.addEventListener('input', updateCalculations);
        discountInput.addEventListener('change', updateCalculations);
    }
    
    // Initial calculation
    updateCalculations();
}

function updateCalculations() {
    const lineItemsContainer = document.getElementById('line-items-container');
    if (!lineItemsContainer) return;
    
    let subtotal = 0;
    let taxTotal = 0;
    
    // Calculate each line item
    const lineItems = lineItemsContainer.querySelectorAll('.line-item-row');
    lineItems.forEach(item => {
        const quantity = parseFloat(item.querySelector('.line-quantity').value) || 0;
        const unitPrice = parseFloat(item.querySelector('.line-price').value) || 0;
        const taxRate = parseFloat(item.querySelector('.line-tax').value) || 0;
        
        const lineTotal = quantity * unitPrice;
        const lineTax = lineTotal * (taxRate / 100);
        
        // Update line total display
        const lineTotalInput = item.querySelector('.line-total');
        lineTotalInput.value = `$${lineTotal.toFixed(2)}`;
        
        subtotal += lineTotal;
        taxTotal += lineTax;
    });
    
    // Get discount
    const discountInput = document.getElementById('discount');
    const discount = discountInput ? (parseFloat(discountInput.value) || 0) : 0;
    
    // Calculate grand total
    const grandTotal = subtotal + taxTotal - discount;
    
    // Update displays
    const subtotalDisplay = document.getElementById('subtotal-display');
    const taxDisplay = document.getElementById('tax-display');
    const discountDisplay = document.getElementById('discount-display');
    const totalDisplay = document.getElementById('total-display');
    
    if (subtotalDisplay) subtotalDisplay.textContent = subtotal.toFixed(2);
    if (taxDisplay) taxDisplay.textContent = taxTotal.toFixed(2);
    if (discountDisplay) discountDisplay.textContent = discount.toFixed(2);
    if (totalDisplay) totalDisplay.textContent = Math.max(0, grandTotal).toFixed(2);
}

function renumberLineItems() {
    const lineItemsContainer = document.getElementById('line-items-container');
    if (!lineItemsContainer) return;
    
    const lineItems = lineItemsContainer.querySelectorAll('.line-item-row');
    lineItems.forEach((item, index) => {
        // Update input names
        const inputs = item.querySelectorAll('input[name*="line_items"]');
        inputs.forEach(input => {
            const name = input.name;
            const newName = name.replace(/\[\d+\]/, `[${index}]`);
            input.name = newName;
        });
    });
}
                    <input type="number" class="form-control quantity-input" 
                           name="line_items[${index}][quantity]" 
                           min="0" step="0.001" value="1" required>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Unit Price</label>
                    <input type="number" class="form-control unit-price-input" 
                           name="line_items[${index}][unit_price]" 
                           min="0" step="0.01" required>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Tax Rate %</label>
                    <input type="number" class="form-control tax-rate-input" 
                           name="line_items[${index}][tax_rate]" 
                           min="0" max="100" step="0.01">
                </div>
                <div class="col-md-2">
                    <label class="form-label">Line Total</label>
                    <div class="input-group">
                        <span class="input-group-text">$</span>
                        <input type="text" class="form-control line-total" readonly value="0.00">
                        <button type="button" class="btn btn-outline-danger remove-line-item" title="Remove line item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const div = document.createElement('div');
    div.innerHTML = template.trim();
    return div.firstChild;
}

function renumberLineItems() {
    const lineItems = document.querySelectorAll('.line-item-row');
    lineItems.forEach((row, index) => {
        // Update field names
        const inputs = row.querySelectorAll('input[name*="line_items"]');
        inputs.forEach(input => {
            const name = input.getAttribute('name');
            const newName = name.replace(/line_items\[\d+\]/, `line_items[${index}]`);
            input.setAttribute('name', newName);
        });
    });
}

function initializeCalculations() {
    // Add event listeners to quantity, unit price, and tax rate inputs
    const calculationInputs = document.querySelectorAll(
        '.quantity-input, .unit-price-input, .tax-rate-input, #discount-input'
    );
    
    calculationInputs.forEach(input => {
        input.addEventListener('input', updateCalculations);
        input.addEventListener('change', updateCalculations);
    });
    
    // Initial calculation
    updateCalculations();
}

function updateCalculations() {
    let subtotal = 0;
    let taxTotal = 0;
    
    // Calculate each line item
    const lineItems = document.querySelectorAll('.line-item-row');
    lineItems.forEach(row => {
        const quantity = parseFloat(row.querySelector('.quantity-input').value) || 0;
        const unitPrice = parseFloat(row.querySelector('.unit-price-input').value) || 0;
        const taxRate = parseFloat(row.querySelector('.tax-rate-input').value) || 0;
        
        const lineTotal = quantity * unitPrice;
        const lineTax = lineTotal * (taxRate / 100);
        
        // Update line total display
        const lineTotalDisplay = row.querySelector('.line-total');
        if (lineTotalDisplay) {
            lineTotalDisplay.value = lineTotal.toFixed(2);
        }
        
        subtotal += lineTotal;
        taxTotal += lineTax;
    });
    
    // Get discount
    const discountInput = document.getElementById('discount-input');
    const discount = discountInput ? parseFloat(discountInput.value) || 0 : 0;
    
    // Calculate grand total
    const grandTotal = subtotal + taxTotal - discount;
    
    // Update displays
    updateDisplay('subtotal-display', subtotal);
    updateDisplay('tax-total-display', taxTotal);
    updateDisplay('discount-display', discount);
    updateDisplay('grand-total-display', grandTotal);
    
    // Update hidden fields for form submission
    updateHiddenField('subtotal', subtotal);
    updateHiddenField('tax_total', taxTotal);
    updateHiddenField('grand_total', grandTotal);
}

function updateDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = '$' + value.toFixed(2);
    }
}

function updateHiddenField(fieldName, value) {
    let field = document.querySelector(`input[name="${fieldName}"]`);
    if (!field) {
        // Create hidden field if it doesn't exist
        field = document.createElement('input');
        field.type = 'hidden';
        field.name = fieldName;
        document.querySelector('form').appendChild(field);
    }
    field.value = value.toFixed(2);
}

// File upload handling for import
function initializeFileUpload() {
    const uploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('import-file');
    
    if (!uploadArea || !fileInput) return;
    
    // Handle drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect(files[0]);
        }
    });
    
    // Handle file input change
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

function handleFileSelect(file) {
    const fileName = document.getElementById('file-name');
    if (fileName) {
        fileName.textContent = file.name;
    }
    
    // Show file info
    const fileInfo = document.getElementById('file-info');
    if (fileInfo) {
        fileInfo.style.display = 'block';
        fileInfo.innerHTML = `
            <strong>Selected file:</strong> ${file.name}<br>
            <strong>Size:</strong> ${(file.size / 1024).toFixed(1)} KB<br>
            <strong>Type:</strong> ${file.type || 'Unknown'}
        `;
    }
}

// Initialize file upload if on import page
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('file-upload-area')) {
        initializeFileUpload();
    }
});

// Status update handling
function updateInvoiceStatus(invoiceId, newStatus, confirmation = null) {
    if (confirmation && !confirm(confirmation)) {
        return;
    }
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/invoices/${invoiceId}/status`;
    
    const statusInput = document.createElement('input');
    statusInput.type = 'hidden';
    statusInput.name = 'status';
    statusInput.value = newStatus;
    
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrf_token';
    csrfInput.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    form.appendChild(statusInput);
    form.appendChild(csrfInput);
    document.body.appendChild(form);
    form.submit();
}

// Export functions for global use
window.invoiceForm = {
    updateInvoiceStatus: updateInvoiceStatus,
    updateCalculations: updateCalculations
};