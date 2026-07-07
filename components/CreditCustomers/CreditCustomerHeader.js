import React from 'react';

export default function CreditCustomerHeader({ onNewCustomer }) {
  return (
    <div className="credit-head">
      <div className="credit-title-area">
        <h1>Credit Customers</h1>
        <p className="subtitle">Manage customer ledger balances and payments</p>
      </div>
      <button className="primary" onClick={onNewCustomer}>
        New Customer
      </button>
    </div>
  );
}
