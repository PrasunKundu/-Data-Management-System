// AI Data Management System - Main Application
class DataManagementApp {
    constructor() {
        this.data = {
            clients: [],
            workers: [],
            tasks: []
        };
        
        this.businessRules = [];
        this.validationSettings = {
            emailValidation: true,
            phoneValidation: true,
            dateValidation: true,
            duplicateValidation: true,
            requiredValidation: true
        };
        
        this.priorities = {
            qualitySpeed: 75,
            validationStrictness: 60,
            autoCorrection: 40,
            conflictResolution: 'ask_user'
        };
        
        this.currentGrid = 'clients';
        this.validationResults = [];
        
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupFileUploads();
        this.setupDataGrid();
        this.setupValidation();
        this.setupBusinessRules();
        this.setupPriorities();
        this.setupExport();
        this.loadSampleData();
    }
    
    // Navigation System
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.section');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetSection = item.dataset.section;
                
                // Update nav active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Update section visibility
                sections.forEach(section => section.classList.remove('active'));
                document.getElementById(`${targetSection}-section`).classList.add('active');
            });
        });
    }
    
    // File Upload System
    setupFileUploads() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        const uploadZones = document.querySelectorAll('.upload-zone');
        
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleFileUpload(file, input.id.replace('-file', ''));
                }
            });
        });
        
        // Drag and drop functionality
        uploadZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('dragover');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('dragover');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    const fileType = zone.dataset.type;
                    this.handleFileUpload(files[0], fileType);
                }
            });
        });
        
        // Sample data and clear buttons
        document.getElementById('load-sample-data').addEventListener('click', () => {
            this.loadSampleData();
        });
        
        document.getElementById('clear-all-data').addEventListener('click', () => {
            this.clearAllData();
        });
    }
    
    handleFileUpload(file, type) {
        const statusElement = document.getElementById(`${type}-status`);
        statusElement.innerHTML = '<div class="status status--info">Processing file...</div>';
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let data;
                if (file.name.endsWith('.csv')) {
                    data = this.parseCSV(e.target.result);
                } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    // For demo purposes, we'll simulate XLSX parsing
                    data = this.parseCSV(e.target.result);
                }
                
                this.data[type] = data;
                this.updateDataGrid();
                this.runValidation();
                
                statusElement.innerHTML = `<div class="status status--success">✓ ${data.length} records loaded</div>`;
                this.updateDataStatus();
            } catch (error) {
                statusElement.innerHTML = `<div class="status status--error">Error: ${error.message}</div>`;
            }
        };
        
        reader.readAsText(file);
    }
    
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }
        
        return data;
    }
    
    loadSampleData() {
        this.data = {
            clients: [
                {id: 1, name: "Acme Corp", email: "contact@acme.com", phone: "+1-555-0123", industry: "Technology", priority: "High"},
                {id: 2, name: "Global Industries", email: "info@global.com", phone: "+1-555-0124", industry: "Manufacturing", priority: "Medium"},
                {id: 3, name: "Tech Solutions", email: "hello@techsol.com", phone: "+1-555-0125", industry: "Technology", priority: "Low"}
            ],
            workers: [
                {id: 1, name: "John Smith", email: "john@company.com", department: "Engineering", skill_level: "Senior", hourly_rate: 75},
                {id: 2, name: "Sarah Johnson", email: "sarah@company.com", department: "Design", skill_level: "Mid", hourly_rate: 60},
                {id: 3, name: "Mike Wilson", email: "mike@company.com", department: "Engineering", skill_level: "Junior", hourly_rate: 45}
            ],
            tasks: [
                {id: 1, title: "Website Redesign", client_id: 1, worker_id: 2, status: "In Progress", estimated_hours: 40, due_date: "2025-07-15"},
                {id: 2, title: "API Development", client_id: 2, worker_id: 1, status: "Planning", estimated_hours: 60, due_date: "2025-08-01"},
                {id: 3, title: "Bug Fixes", client_id: 3, worker_id: 3, status: "Completed", estimated_hours: 20, due_date: "2025-06-30"}
            ]
        };
        
        this.updateDataGrid();
        this.runValidation();
        this.updateDataStatus();
        this.updateUploadStatus();
    }
    
    clearAllData() {
        this.data = {
            clients: [],
            workers: [],
            tasks: []
        };
        
        this.updateDataGrid();
        this.runValidation();
        this.updateDataStatus();
        this.clearUploadStatus();
    }
    
    updateUploadStatus() {
        ['clients', 'workers', 'tasks'].forEach(type => {
            const statusElement = document.getElementById(`${type}-status`);
            const count = this.data[type].length;
            if (count > 0) {
                statusElement.innerHTML = `<div class="status status--success">✓ ${count} records loaded</div>`;
            }
        });
    }
    
    clearUploadStatus() {
        ['clients', 'workers', 'tasks'].forEach(type => {
            const statusElement = document.getElementById(`${type}-status`);
            statusElement.innerHTML = '';
        });
    }
    
    updateDataStatus() {
        const totalRecords = this.data.clients.length + this.data.workers.length + this.data.tasks.length;
        const statusElement = document.getElementById('data-status');
        statusElement.innerHTML = `<span>${totalRecords} Records Loaded</span>`;
    }
    
    // Data Grid System
    setupDataGrid() {
        const gridTabs = document.querySelectorAll('.grid-tab');
        const gridActions = document.querySelectorAll('.grid-actions button');
        
        gridTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const gridType = tab.dataset.grid;
                this.switchGrid(gridType);
            });
        });
        
        document.getElementById('add-row').addEventListener('click', () => {
            this.addRow();
        });
        
        document.getElementById('delete-selected').addEventListener('click', () => {
            this.deleteSelectedRows();
        });
        
        document.getElementById('save-changes').addEventListener('click', () => {
            this.saveChanges();
        });
    }
    
    switchGrid(gridType) {
        this.currentGrid = gridType;
        
        // Update tab active state
        document.querySelectorAll('.grid-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-grid="${gridType}"]`).classList.add('active');
        
        // Update grid visibility
        document.querySelectorAll('.data-grid').forEach(grid => {
            grid.classList.remove('active');
        });
        document.getElementById(`${gridType}-grid`).classList.add('active');
        
        this.renderGrid(gridType);
    }
    
    renderGrid(gridType) {
        const gridContainer = document.getElementById(`${gridType}-grid`);
        const data = this.data[gridType];
        
        if (data.length === 0) {
            gridContainer.innerHTML = '<p>No data available. Upload a file or load sample data.</p>';
            return;
        }
        
        const headers = Object.keys(data[0]);
        
        let html = '<table class="data-table"><thead><tr>';
        html += '<th><input type="checkbox" id="select-all"></th>';
        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        html += '<th>Actions</th></tr></thead><tbody>';
        
        data.forEach((row, index) => {
            html += `<tr data-index="${index}">`;
            html += `<td><input type="checkbox" class="row-select"></td>`;
            headers.forEach(header => {
                const value = row[header] || '';
                const cellClass = this.getCellValidationClass(gridType, index, header, value);
                html += `<td class="${cellClass}">
                    <input type="text" value="${value}" 
                           data-field="${header}" 
                           data-index="${index}"
                           onchange="app.updateCell('${gridType}', ${index}, '${header}', this.value)">
                </td>`;
            });
            html += `<td>
                <button class="btn btn--sm btn--outline" onclick="app.deleteRow('${gridType}', ${index})">Delete</button>
            </td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        gridContainer.innerHTML = html;
        
        // Setup select all functionality
        const selectAllCheckbox = document.getElementById('select-all');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.row-select');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
            });
        }
    }
    
    getCellValidationClass(gridType, rowIndex, field, value) {
        const errors = this.validateCell(gridType, rowIndex, field, value);
        if (errors.length > 0) {
            return errors.some(e => e.type === 'error') ? 'cell-error' : 'cell-warning';
        }
        return '';
    }
    
    updateCell(gridType, rowIndex, field, value) {
        this.data[gridType][rowIndex][field] = value;
        this.runValidation();
        
        // Update cell validation class
        const cell = document.querySelector(`[data-index="${rowIndex}"][data-field="${field}"]`).parentElement;
        const validationClass = this.getCellValidationClass(gridType, rowIndex, field, value);
        cell.className = validationClass;
    }
    
    addRow() {
        const data = this.data[this.currentGrid];
        const newRow = {};
        
        if (data.length > 0) {
            const headers = Object.keys(data[0]);
            headers.forEach(header => {
                newRow[header] = '';
            });
        }
        
        data.push(newRow);
        this.renderGrid(this.currentGrid);
        this.updateGridTab(this.currentGrid);
        this.runValidation();
    }
    
    deleteRow(gridType, index) {
        if (confirm('Are you sure you want to delete this row?')) {
            this.data[gridType].splice(index, 1);
            this.renderGrid(gridType);
            this.updateGridTab(gridType);
            this.runValidation();
        }
    }
    
    deleteSelectedRows() {
        const selectedCheckboxes = document.querySelectorAll('.row-select:checked');
        if (selectedCheckboxes.length === 0) {
            alert('Please select rows to delete.');
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${selectedCheckboxes.length} row(s)?`)) {
            const indices = Array.from(selectedCheckboxes).map(cb => 
                parseInt(cb.closest('tr').dataset.index)
            ).sort((a, b) => b - a);
            
            indices.forEach(index => {
                this.data[this.currentGrid].splice(index, 1);
            });
            
            this.renderGrid(this.currentGrid);
            this.updateGridTab(this.currentGrid);
            this.runValidation();
        }
    }
    
    saveChanges() {
        // Simulate save operation
        alert('Changes saved successfully!');
    }
    
    updateGridTab(gridType) {
        const tab = document.querySelector(`[data-grid="${gridType}"]`);
        const count = this.data[gridType].length;
        const tabName = gridType.charAt(0).toUpperCase() + gridType.slice(1);
        tab.textContent = `${tabName} (${count})`;
    }
    
    updateDataGrid() {
        ['clients', 'workers', 'tasks'].forEach(gridType => {
            this.updateGridTab(gridType);
        });
        
        if (document.querySelector('.data-grid.active')) {
            this.renderGrid(this.currentGrid);
        }
    }
    
    // Validation System
    setupValidation() {
        const validationCheckboxes = document.querySelectorAll('#validation-section input[type="checkbox"]');
        
        validationCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const settingName = e.target.id.replace('-', '');
                this.validationSettings[settingName] = e.target.checked;
                this.runValidation();
            });
        });
    }
    
    runValidation() {
        this.validationResults = [];
        let totalRecords = 0;
        let errorCount = 0;
        let warningCount = 0;
        
        ['clients', 'workers', 'tasks'].forEach(gridType => {
            const data = this.data[gridType];
            totalRecords += data.length;
            
            data.forEach((row, index) => {
                Object.keys(row).forEach(field => {
                    const value = row[field];
                    const errors = this.validateCell(gridType, index, field, value);
                    
                    errors.forEach(error => {
                        this.validationResults.push({
                            gridType,
                            rowIndex: index,
                            field,
                            value,
                            ...error
                        });
                        
                        if (error.type === 'error') errorCount++;
                        else if (error.type === 'warning') warningCount++;
                    });
                });
            });
        });
        
        const validCount = totalRecords - errorCount - warningCount;
        
        // Update validation stats
        document.getElementById('total-records').textContent = totalRecords;
        document.getElementById('error-count').textContent = errorCount;
        document.getElementById('warning-count').textContent = warningCount;
        document.getElementById('valid-count').textContent = validCount;
        
        // Update validation results
        this.updateValidationResults();
        
        // Update validation status
        const validationStatus = document.getElementById('validation-status');
        if (errorCount > 0) {
            validationStatus.innerHTML = '<span>⚠️ Validation Errors</span>';
            validationStatus.className = 'status status--error';
        } else if (warningCount > 0) {
            validationStatus.innerHTML = '<span>⚠️ Validation Warnings</span>';
            validationStatus.className = 'status status--warning';
        } else {
            validationStatus.innerHTML = '<span>✓ Validation Active</span>';
            validationStatus.className = 'status status--success';
        }
    }
    
    validateCell(gridType, rowIndex, field, value) {
        const errors = [];
        
        // Required field validation
        if (this.validationSettings.requiredValidation && ['name', 'email', 'title'].includes(field) && !value.trim()) {
            errors.push({
                type: 'error',
                message: `${field} is required`
            });
        }
        
        // Email validation
        if (this.validationSettings.emailValidation && field === 'email' && value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
                errors.push({
                    type: 'error',
                    message: 'Invalid email format'
                });
            }
        }
        
        // Phone validation
        if (this.validationSettings.phoneValidation && field === 'phone' && value.trim()) {
            const phonePattern = /^\+?[\d\s\-\(\)]+$/;
            if (!phonePattern.test(value)) {
                errors.push({
                    type: 'warning',
                    message: 'Invalid phone format'
                });
            }
        }
        
        // Date validation
        if (this.validationSettings.dateValidation && field.includes('date') && value.trim()) {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                errors.push({
                    type: 'error',
                    message: 'Invalid date format'
                });
            }
        }
        
        // Duplicate validation
        if (this.validationSettings.duplicateValidation && field === 'email' && value.trim()) {
            const duplicates = this.findDuplicates(gridType, field, value, rowIndex);
            if (duplicates.length > 0) {
                errors.push({
                    type: 'warning',
                    message: 'Duplicate email found'
                });
            }
        }
        
        return errors;
    }
    
    findDuplicates(gridType, field, value, currentIndex) {
        return this.data[gridType].filter((row, index) => 
            index !== currentIndex && row[field] === value && value.trim() !== ''
        );
    }
    
    updateValidationResults() {
        const resultsContainer = document.querySelector('.results-list');
        
        if (this.validationResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="result-item success">
                    <span class="result-icon">✓</span>
                    <span>All data validation checks passed</span>
                </div>
            `;
        } else {
            let html = '';
            this.validationResults.slice(0, 10).forEach(result => {
                html += `
                    <div class="result-item ${result.type}">
                        <span class="result-icon">${result.type === 'error' ? '✗' : '⚠'}</span>
                        <span>${result.gridType}.${result.field} (Row ${result.rowIndex + 1}): ${result.message}</span>
                    </div>
                `;
            });
            
            if (this.validationResults.length > 10) {
                html += `
                    <div class="result-item info">
                        <span class="result-icon">ℹ</span>
                        <span>And ${this.validationResults.length - 10} more issues...</span>
                    </div>
                `;
            }
            
            resultsContainer.innerHTML = html;
        }
    }
    
    // Business Rules System
    setupBusinessRules() {
        document.getElementById('add-rule').addEventListener('click', () => {
            this.showRuleBuilder();
        });
        
        document.getElementById('load-templates').addEventListener('click', () => {
            this.loadRuleTemplates();
        });
        
        document.getElementById('close-builder').addEventListener('click', () => {
            this.hideRuleBuilder();
        });
        
        document.getElementById('save-rule').addEventListener('click', () => {
            this.saveRule();
        });
        
        document.getElementById('test-rule').addEventListener('click', () => {
            this.testRule();
        });
        
        this.renderRulesList();
    }
    
    showRuleBuilder() {
        document.getElementById('rule-builder').style.display = 'block';
        this.clearRuleForm();
    }
    
    hideRuleBuilder() {
        document.getElementById('rule-builder').style.display = 'none';
    }
    
    clearRuleForm() {
        document.getElementById('rule-name').value = '';
        document.getElementById('condition-field').value = '';
        document.getElementById('condition-operator').value = 'equals';
        document.getElementById('condition-value').value = '';
        document.getElementById('rule-action').value = '';
        document.getElementById('rule-priority').value = 'medium';
        document.getElementById('rule-active').checked = true;
    }
    
    saveRule() {
        const ruleName = document.getElementById('rule-name').value;
        const conditionField = document.getElementById('condition-field').value;
        const conditionOperator = document.getElementById('condition-operator').value;
        const conditionValue = document.getElementById('condition-value').value;
        const ruleAction = document.getElementById('rule-action').value;
        const rulePriority = document.getElementById('rule-priority').value;
        const ruleActive = document.getElementById('rule-active').checked;
        
        if (!ruleName || !conditionField || !conditionValue || !ruleAction) {
            alert('Please fill in all required fields.');
            return;
        }
        
        const rule = {
            id: Date.now(),
            name: ruleName,
            condition: {
                field: conditionField,
                operator: conditionOperator,
                value: conditionValue
            },
            action: ruleAction,
            priority: rulePriority,
            active: ruleActive,
            description: `${conditionField} ${conditionOperator} ${conditionValue} → ${ruleAction}`
        };
        
        this.businessRules.push(rule);
        this.renderRulesList();
        this.hideRuleBuilder();
        
        alert('Rule saved successfully!');
    }
    
    testRule() {
        const conditionField = document.getElementById('condition-field').value;
        const conditionOperator = document.getElementById('condition-operator').value;
        const conditionValue = document.getElementById('condition-value').value;
        
        if (!conditionField || !conditionValue) {
            alert('Please fill in condition fields to test.');
            return;
        }
        
        // Simple rule testing simulation
        let matchCount = 0;
        
        ['clients', 'workers', 'tasks'].forEach(gridType => {
            this.data[gridType].forEach(row => {
                if (this.evaluateCondition(row, conditionField, conditionOperator, conditionValue)) {
                    matchCount++;
                }
            });
        });
        
        alert(`Rule test complete: ${matchCount} records match this condition.`);
    }
    
    evaluateCondition(row, field, operator, value) {
        const fieldParts = field.split('.');
        const fieldValue = fieldParts.length > 1 ? row[fieldParts[1]] : row[field];
        
        if (!fieldValue) return false;
        
        switch (operator) {
            case 'equals':
                return fieldValue.toString().toLowerCase() === value.toLowerCase();
            case 'not_equals':
                return fieldValue.toString().toLowerCase() !== value.toLowerCase();
            case 'contains':
                return fieldValue.toString().toLowerCase().includes(value.toLowerCase());
            case 'greater_than':
                return parseFloat(fieldValue) > parseFloat(value);
            case 'less_than':
                return parseFloat(fieldValue) < parseFloat(value);
            default:
                return false;
        }
    }
    
    loadRuleTemplates() {
        const templates = [
            {
                name: "High Priority Client Rule",
                condition: { field: "client.priority", operator: "equals", value: "High" },
                action: "assign_senior_worker",
                priority: "high",
                active: true,
                description: "Automatically assign senior workers to high priority clients"
            },
            {
                name: "Overdue Task Alert",
                condition: { field: "task.due_date", operator: "less_than", value: "2025-06-26" },
                action: "send_alert",
                priority: "high",
                active: true,
                description: "Send alerts for overdue tasks"
            },
            {
                name: "Resource Allocation",
                condition: { field: "worker.skill_level", operator: "equals", value: "Senior" },
                action: "flag_overallocation",
                priority: "medium",
                active: true,
                description: "Flag senior workers for optimal allocation"
            }
        ];
        
        templates.forEach(template => {
            this.businessRules.push({
                id: Date.now() + Math.random(),
                ...template
            });
        });
        
        this.renderRulesList();
        alert('Rule templates loaded successfully!');
    }
    
    renderRulesList() {
        const rulesList = document.getElementById('rules-list');
        
        if (this.businessRules.length === 0) {
            rulesList.innerHTML = '<p>No business rules defined. Click "Add New Rule" to create one.</p>';
            return;
        }
        
        let html = '';
        this.businessRules.forEach(rule => {
            html += `
                <div class="rule-item">
                    <div class="rule-info">
                        <h4>${rule.name} ${rule.active ? '' : '(Inactive)'}</h4>
                        <p>${rule.description}</p>
                        <div class="status status--${rule.priority === 'high' ? 'error' : rule.priority === 'medium' ? 'warning' : 'info'}">
                            ${rule.priority} priority
                        </div>
                    </div>
                    <div class="rule-actions">
                        <button class="btn btn--sm btn--outline" onclick="app.toggleRule(${rule.id})">
                            ${rule.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button class="btn btn--sm btn--secondary" onclick="app.deleteRule(${rule.id})">Delete</button>
                    </div>
                </div>
            `;
        });
        
        rulesList.innerHTML = html;
    }
    
    toggleRule(ruleId) {
        const rule = this.businessRules.find(r => r.id === ruleId);
        if (rule) {
            rule.active = !rule.active;
            this.renderRulesList();
        }
    }
    
    deleteRule(ruleId) {
        if (confirm('Are you sure you want to delete this rule?')) {
            this.businessRules = this.businessRules.filter(r => r.id !== ruleId);
            this.renderRulesList();
        }
    }
    
    // Priority System
    setupPriorities() {
        const sliders = document.querySelectorAll('.priority-slider');
        const conflictSelect = document.getElementById('conflict-resolution');
        
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                this.priorities[e.target.id.replace('-', '')] = parseInt(value);
                this.updatePriorityDisplay();
            });
        });
        
        conflictSelect.addEventListener('change', (e) => {
            this.priorities.conflictResolution = e.target.value;
            this.updatePriorityDisplay();
        });
        
        this.updatePriorityDisplay();
    }
    
    updatePriorityDisplay() {
        document.getElementById('quality-display').textContent = `${this.priorities.qualitySpeed}%`;
        document.getElementById('strictness-display').textContent = `${this.priorities.validationStrictness}%`;
        document.getElementById('correction-display').textContent = `${this.priorities.autoCorrection}%`;
        document.getElementById('resolution-display').textContent = this.priorities.conflictResolution.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Export System
    setupExport() {
        const exportButtons = document.querySelectorAll('[data-export]');
        
        exportButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const dataType = e.target.dataset.export;
                const format = e.target.dataset.format;
                this.exportData(dataType, format);
            });
        });
        
        document.getElementById('export-rules').addEventListener('click', () => {
            this.exportRules();
        });
        
        document.getElementById('export-validation').addEventListener('click', () => {
            this.exportValidationReport();
        });
        
        document.getElementById('export-all').addEventListener('click', () => {
            this.exportAll();
        });
    }
    
    exportData(dataType, format) {
        const data = this.data[dataType];
        
        if (data.length === 0) {
            alert(`No ${dataType} data to export.`);
            return;
        }
        
        let content, filename, mimeType;
        
        switch (format) {
            case 'csv':
                content = this.convertToCSV(data);
                filename = `${dataType}.csv`;
                mimeType = 'text/csv';
                break;
            case 'xlsx':
                // For demo purposes, we'll export as CSV
                content = this.convertToCSV(data);
                filename = `${dataType}.xlsx`;
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case 'json':
                content = JSON.stringify(data, null, 2);
                filename = `${dataType}.json`;
                mimeType = 'application/json';
                break;
        }
        
        this.downloadFile(content, filename, mimeType);
    }
    
    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }
    
    exportRules() {
        const rulesConfig = {
            rules: this.businessRules,
            priorities: this.priorities,
            validationSettings: this.validationSettings,
            exportDate: new Date().toISOString()
        };
        
        const content = JSON.stringify(rulesConfig, null, 2);
        this.downloadFile(content, 'rules.json', 'application/json');
    }
    
    exportValidationReport() {
        const report = {
            summary: {
                totalRecords: this.data.clients.length + this.data.workers.length + this.data.tasks.length,
                errorCount: this.validationResults.filter(r => r.type === 'error').length,
                warningCount: this.validationResults.filter(r => r.type === 'warning').length,
                validationDate: new Date().toISOString()
            },
            validationResults: this.validationResults,
            settings: this.validationSettings
        };
        
        const content = JSON.stringify(report, null, 2);
        this.downloadFile(content, 'validation-report.json', 'application/json');
    }
    
    exportAll() {
        // For demo purposes, we'll create a simple zip-like structure
        const allData = {
            data: this.data,
            rules: this.businessRules,
            priorities: this.priorities,
            validationSettings: this.validationSettings,
            validationResults: this.validationResults,
            exportDate: new Date().toISOString()
        };
        
        const content = JSON.stringify(allData, null, 2);
        this.downloadFile(content, 'all-data-export.json', 'application/json');
        
        alert('All data and configuration exported! In a real application, this would be a ZIP file.');
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Initialize the application
const app = new DataManagementApp();

// Make functions available globally for HTML event handlers
window.app = app;