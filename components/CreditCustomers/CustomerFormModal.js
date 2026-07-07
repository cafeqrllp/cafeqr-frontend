import React from 'react';

export default function CustomerFormModal({
  open,
  editing,
  form,
  setForm,
  saving,
  saveCustomer,
  setFormOpen,
  SYM,
}) {
  if (!open) return null;

  return (
    <div className="rpt-modal-overlay" onMouseDown={() => setFormOpen(false)}>
      <div className="rpt-modal" onMouseDown={(event) => event.stopPropagation()} style={{ maxWidth: '540px' }}>
        <h2 className="modal-title">{editing ? 'Edit Credit Customer' : 'Create New Credit Customer'}</h2>
        <div className="modal-form">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              className="form-input"
              value={form.name} 
              onChange={(event) => setForm({ ...form, name: event.target.value })} 
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              className="form-input"
              value={form.phone} 
              onChange={(event) => setForm({ ...form, phone: event.target.value })} 
              placeholder="e.g. 9876543210"
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              className="form-input"
              type="email"
              value={form.email} 
              onChange={(event) => setForm({ ...form, email: event.target.value })} 
              placeholder="e.g. john@example.com"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Credit Limit ({SYM})</label>
              <input 
                className="form-input"
                type="number" 
                value={form.creditLimit} 
                onChange={(event) => setForm({ ...form, creditLimit: event.target.value })} 
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Opening Balance ({SYM})</label>
              <input 
                className="form-input"
                type="number" 
                value={form.openingBalance} 
                onChange={(event) => setForm({ ...form, openingBalance: event.target.value })} 
                placeholder="0"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Notes / Comments</label>
            <textarea 
              className="form-input"
              value={form.notes} 
              onChange={(event) => setForm({ ...form, notes: event.target.value })} 
              placeholder="Add optional notes about the customer..."
            />
          </div>
        </div>
        <div className="modal-actions">
          <button className="rpt-modal-btn rpt-modal-btn-outline" onClick={() => setFormOpen(false)}>Cancel</button>
          <button className="primary" disabled={saving} onClick={saveCustomer}>
            {saving ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}
