// ============================================================
// expenses.js - Budget Tracker UI Logic
// ============================================================
// All functions are exposed as window.expenses.*
// ============================================================

(function(window) {
    'use strict';

    var CATEGORY_COLORS = {
        food: '#f59e0b',
        transport: '#3b82f6',
        lodging: '#8b5cf6',
        activities: '#10b981',
        shopping: '#ec4899',
        other: '#6b7280'
    };

    var CATEGORY_LABELS = {
        food: 'Food & Dining',
        transport: 'Transport',
        lodging: 'Lodging',
        activities: 'Activities',
        shopping: 'Shopping',
        other: 'Other'
    };

    var currentTripBudget = 0;
    var currentCurrency = 'USD';
    var currentTripId = null;

    // Render a single expense row
    function renderExpenseRow(expense) {
        var color = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.other;
        var category = CATEGORY_LABELS[expense.category] || 'Other';
        var dateFormatted = formatDate(expense.date);

        return '<div class="expense-row" data-expense-id="' + expense.id + '">' +
            '<div class="expense-color-bar" style="background: ' + color + '"></div>' +
            '<div class="expense-main">' +
            '<div class="expense-description">' + escapeHtml(expense.description) + '</div>' +
            '<div class="expense-meta">' +
            '<span class="expense-category" style="color: ' + color + '">' +
            '<i class="fas fa-tag"></i> ' + category +
            '</span>' +
            '<span class="expense-date"><i class="fas fa-calendar"></i> ' + dateFormatted + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="expense-amount">' +
            expense.currency + ' ' + parseFloat(expense.amount).toFixed(2) +
            '</div>' +
            '<div class="expense-actions">' +
            '<button class="btn btn-xs btn-secondary" onclick="window.expenses.editExpense(\'' + expense.id + '\')">' +
            '<i class="fas fa-edit"></i>' +
            '</button>' +
            '<button class="btn btn-xs btn-danger" onclick="window.expenses.deleteExpense(\'' + expense.id + '\')">' +
            '<i class="fas fa-trash"></i>' +
            '</button>' +
            '</div>' +
            '</div>';
    }

    // Render all expenses
    function renderExpenseList(expenses) {
        var container = document.getElementById('expenseList');
        if (!container) return;

        if (!expenses || expenses.length === 0) {
            container.innerHTML = '<div class="empty-state-inline">' +
                '<i class="fas fa-receipt"></i>' +
                '<p>No expenses recorded yet. Add your first expense above!</p>' +
                '</div>';
            return;
        }

        container.innerHTML = expenses.map(function(e) { return renderExpenseRow(e); }).join('');
    }

    // Update budget display
    function updateBudgetDisplay(totalSpent, budget) {
        currentTripBudget = budget || 0;

        var spentEl = document.getElementById('budgetSpent');
        var totalEl = document.getElementById('budgetTotal');
        var progressEl = document.getElementById('budgetProgress');
        var percentEl = document.getElementById('budgetPercentage');

        if (spentEl) spentEl.textContent = currentCurrency + ' ' + totalSpent.toFixed(2);
        if (totalEl) totalEl.textContent = currentCurrency + ' ' + budget.toFixed(2);

        var percent = budget > 0 ? Math.min(100, (totalSpent / budget) * 100) : 0;
        if (progressEl) progressEl.style.width = percent + '%';
        if (percentEl) percentEl.textContent = percent.toFixed(1) + '% used';

        // Color coding
        if (progressEl) {
            if (percent > 100) {
                progressEl.style.background = '#ef4444';
                progressEl.style.width = '100%';
            } else if (percent > 80) {
                progressEl.style.background = '#f59e0b';
            } else {
                progressEl.style.background = '#10b981';
            }
        }
    }

    // Render category breakdown
    function renderCategoryBreakdown(categoryTotals, totalSpent) {
        var container = document.getElementById('categoryList');
        if (!container) return;

        if (Object.keys(categoryTotals).length === 0) {
            container.innerHTML = '<p class="no-data">No spending data yet.</p>';
            return;
        }

        var html = '';
        var categories = Object.keys(categoryTotals).sort(function(a, b) {
            return categoryTotals[b] - categoryTotals[a];
        });

        categories.forEach(function(cat) {
            var amount = categoryTotals[cat];
            var percent = totalSpent > 0 ? (amount / totalSpent * 100) : 0;
            var color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;
            var label = CATEGORY_LABELS[cat] || cat;

            html += '<div class="category-item">' +
                '<div class="category-header">' +
                '<span class="category-name" style="color: ' + color + '">' +
                '<i class="fas fa-tag"></i> ' + label +
                '</span>' +
                '<span class="category-amount">' + currentCurrency + ' ' + amount.toFixed(2) + ' (' + percent.toFixed(1) + '%)</span>' +
                '</div>' +
                '<div class="category-bar-bg">' +
                '<div class="category-bar-fill" style="width: ' + percent + '%; background: ' + color + '"></div>' +
                '</div>' +
                '</div>';
        });

        container.innerHTML = html;
    }

    // Load expenses for a trip
    async function loadExpenses(tripId, budget, currency) {
        currentTripId = tripId;
        currentTripBudget = budget || 0;
        currentCurrency = currency || 'USD';

        var container = document.getElementById('expenseList');
        if (container) {
            container.innerHTML =
                '<div class="expense-row skeleton-row"><div class="skeleton-line" style="width:4px;height:40px;background:var(--border);border-radius:2px;"></div><div style="flex:1"><div class="skeleton-line" style="width:60%;height:1rem;margin-bottom:0.3rem;"></div><div class="skeleton-line" style="width:40%;height:0.75rem;"></div></div><div class="skeleton-line" style="width:5rem;height:1.2rem;"></div></div>'.repeat(3);
        }

        var result = await window.apiClient.getExpenses(tripId);
        if (!result.success) {
            if (container) {
                container.innerHTML = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ' + (result.error || 'Failed to load expenses') + '</div>';
            }
            return;
        }

        var expenses = result.expenses || [];
        renderExpenseList(expenses);

        // Calculate totals
        var totalSpent = 0;
        var categoryTotals = {};
        expenses.forEach(function(e) {
            totalSpent += parseFloat(e.amount) || 0;
            var cat = e.category || 'other';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + (parseFloat(e.amount) || 0);
        });

        updateBudgetDisplay(totalSpent, currentTripBudget);
        renderCategoryBreakdown(categoryTotals, totalSpent);
    }

    // Edit an expense — pre-fill form and show it for editing
    function showExpenseFormForEdit(expenseId, expense) {
        if (typeof showAddExpenseForm === 'function') {
            // Pre-fill before showing
            document.getElementById('expenseItemId').value = expenseId;
            document.getElementById('expenseAmount').value = expense.amount;
            document.getElementById('expenseCurrency').value = expense.currency || 'USD';
            document.getElementById('expenseCategory').value = expense.category || 'other';
            document.getElementById('expenseDescription').value = expense.description || '';
            document.getElementById('expenseDate').value = expense.date || '';
            document.getElementById('expenseFormTitle').textContent = 'Edit Expense';
            var saveLabel = document.getElementById('expenseSaveLabel');
            if (saveLabel) saveLabel.textContent = 'Update Expense';
            showAddExpenseForm();
            return;
        }
        // Fallback: open form in edit mode
        editExpense(expenseId);
    }

    // Edit an expense
    function editExpense(expenseId) {
        var container = document.getElementById('expenseList');
        var rows = container && container.querySelectorAll('.expense-row');
        if (!rows) return;

        window.apiClient.getExpenses(currentTripId).then(function(result) {
            if (!result.success) return;
            var expense = result.expenses.find(function(e) { return e.id === expenseId; });
            if (!expense) return;

            if (typeof showAddExpenseForm === 'function') {
                showExpenseFormForEdit(expenseId, expense);
            } else {
                var formCard = document.getElementById('expenseFormCard');
                if (!formCard) return;
                document.getElementById('expenseFormTitle').textContent = 'Edit Expense';
                document.getElementById('expenseItemId').value = expenseId;
                document.getElementById('expenseAmount').value = expense.amount;
                document.getElementById('expenseCurrency').value = expense.currency || 'USD';
                document.getElementById('expenseCategory').value = expense.category || 'other';
                document.getElementById('expenseDescription').value = expense.description || '';
                document.getElementById('expenseDate').value = expense.date || '';
                formCard.classList.remove('hidden');
                formCard.scrollIntoView({ behavior: 'smooth', block: 'top' });
            }
        });
    }

    // Delete an expense
    async function deleteExpense(expenseId) {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        var result = await window.apiClient.deleteExpense(expenseId);
        if (result.success) {
            loadExpenses(currentTripId, currentTripBudget, currentCurrency);
        } else {
            document.getElementById('expenseAlert').innerHTML =
                '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ' + result.error + '</div>';
        }
    }

    // --- Helpers ---
    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            var date = new Date(dateStr + 'T00:00:00');
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    }

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // --- Expose globally ---
    window.expenses = {
        loadExpenses: loadExpenses,
        editExpense: editExpense,
        deleteExpense: deleteExpense,
        updateBudgetDisplay: updateBudgetDisplay
    };

})(window);
