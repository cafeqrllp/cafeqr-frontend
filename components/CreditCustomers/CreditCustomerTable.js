import React from 'react';
import CreditCustomerRow from './CreditCustomerRow';

export default function CreditCustomerTable({
  customers = [],
  expandedCustomer,
  activeTab,
  setActiveTab,
  ordersByCustomer,
  paymentsByCustomer,
  timezone,
  money,
  openPayment,
  toggleOrders,
  toggleStatus,
  openForm,
  handleViewOrder,
  handleViewPayment,
}) {
  return (
    <div className="rpt-tbl-wrap">
      <table className="rpt-tbl">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th className="r">Balance</th>
            <th className="r">Total Credit</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <CreditCustomerRow
              key={customer.id}
              customer={customer}
              expandedCustomer={expandedCustomer}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              orders={ordersByCustomer[customer.id] || []}
              payments={paymentsByCustomer[customer.id] || []}
              timezone={timezone}
              money={money}
              openPayment={openPayment}
              toggleOrders={toggleOrders}
              toggleStatus={toggleStatus}
              openForm={openForm}
              handleViewOrder={handleViewOrder}
              handleViewPayment={handleViewPayment}
            />
          ))}
          {customers.length === 0 && (
            <tr>
              <td colSpan={6} className="rpt-empty">
                No credit customers found matching your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
