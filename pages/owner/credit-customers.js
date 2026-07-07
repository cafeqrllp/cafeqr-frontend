import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import RoleGate from '../../components/RoleGate';
import ModuleGate from '../../components/ModuleGate';
import DocumentViewerPopup from '../../components/purchasing/DocumentViewerPopup';
import { formatTzDate } from '../../utils/timezoneUtils';

// All credit screen resources live inside components/CreditCustomers/
import useCreditCustomers from '../../components/CreditCustomers/useCreditCustomers';
import CreditCustomerHeader from '../../components/CreditCustomers/CreditCustomerHeader';
import CreditCustomerKPIs from '../../components/CreditCustomers/CreditCustomerKPIs';
import CreditCustomerToolbar from '../../components/CreditCustomers/CreditCustomerToolbar';
import CreditCustomerTable from '../../components/CreditCustomers/CreditCustomerTable';
import CustomerFormModal from '../../components/CreditCustomers/CustomerFormModal';
import PaymentModal from '../../components/CreditCustomers/PaymentModal';
import creditCustomersStyles from '../../components/CreditCustomers/creditCustomersStyles';

const STATUS_CFG = {
  DRAFT:     { label: 'Draft',     color: '#64748b', bg: '#f1f5f9', dot: '#94a3b8', border: '#cbd5e1' },
  BILLED:    { label: 'Billed',    color: '#b45309', bg: '#fffbeb', dot: '#f59e0b', border: '#fde68a' },
  COMPLETED: { label: 'Completed', color: '#059669', bg: '#ecfdf5', dot: '#10b981', border: '#6ee7b7' },
  PAID:      { label: 'Paid',      color: '#059669', bg: '#ecfdf5', dot: '#10b981', border: '#6ee7b7' },
  CANCELLED: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2', dot: '#ef4444', border: '#fca5a5' },
};

function CreditCustomersContent() {
  const {
    config,
    timezone,
    SYM,
    money,
    loading,
    search,
    setSearch,
    formOpen,
    setFormOpen,
    editing,
    form,
    setForm,
    saving,
    paymentCustomer,
    setPaymentCustomer,
    paymentInvoice,
    setPaymentInvoice,
    paymentAmount,
    setPaymentAmount,
    paymentMethod,
    setPaymentMethod,
    manualAllocations,
    setManualAllocations,
    expandedCustomer,
    ordersByCustomer,
    paymentsByCustomer,
    activeTab,
    setActiveTab,
    viewingDoc,
    setViewingDoc,
    filteredCustomers,
    totals,
    openForm,
    saveCustomer,
    toggleStatus,
    openPayment,
    submitPayment,
    toggleOrders,
    handleViewOrder,
    handleViewPayment,
  } = useCreditCustomers();

  return (
    <DashboardLayout title="Credit Customers" hideTitle={true}>
      <div className="rpt-page credit-page">

        <CreditCustomerHeader onNewCustomer={() => openForm()} />

        <CreditCustomerKPIs
          totals={totals}
          allocationMode={config?.creditAllocationMode}
          money={money}
        />

        <CreditCustomerToolbar
          search={search}
          onSearchChange={setSearch}
          onSearchClear={() => setSearch('')}
        />

        {loading ? (
          <div className="rpt-loading">
            <div className="spinner" />
            <span>Loading credit customers data...</span>
          </div>
        ) : (
          <CreditCustomerTable
            customers={filteredCustomers}
            expandedCustomer={expandedCustomer}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            ordersByCustomer={ordersByCustomer}
            paymentsByCustomer={paymentsByCustomer}
            timezone={timezone}
            money={money}
            openPayment={openPayment}
            toggleOrders={toggleOrders}
            toggleStatus={toggleStatus}
            openForm={openForm}
            handleViewOrder={handleViewOrder}
            handleViewPayment={handleViewPayment}
          />
        )}

        <CustomerFormModal
          open={formOpen}
          editing={editing}
          form={form}
          setForm={setForm}
          saving={saving}
          saveCustomer={saveCustomer}
          setFormOpen={setFormOpen}
          SYM={SYM}
        />

        <PaymentModal
          customer={paymentCustomer}
          invoice={paymentInvoice}
          amount={paymentAmount}
          setAmount={setPaymentAmount}
          method={paymentMethod}
          setMethod={setPaymentMethod}
          manualAllocations={manualAllocations}
          setManualAllocations={setManualAllocations}
          config={config}
          submitPayment={submitPayment}
          onClose={() => { setPaymentCustomer(null); setPaymentInvoice(null); }}
          money={money}
          SYM={SYM}
        />

        {viewingDoc && (
          <DocumentViewerPopup
            order={viewingDoc.order}
            docType={viewingDoc.type}
            vendors={[]}
            warehouses={[]}
            timezone={timezone || 'Asia/Kolkata'}
            currencySymbol={SYM}
            formatTzDate={formatTzDate}
            onClose={() => setViewingDoc(null)}
            onViewLinked={(order, type) => setViewingDoc({ order, type })}
            STATUS_CFG={STATUS_CFG}
          />
        )}
      </div>

      <style jsx global>{creditCustomersStyles}</style>
    </DashboardLayout>
  );
}

export default function CreditCustomersPage() {
  return (
    <RoleGate allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF']} requiredMenu="Credit Customers">
      <ModuleGate>
        <CreditCustomersContent />
      </ModuleGate>
    </RoleGate>
  );
}