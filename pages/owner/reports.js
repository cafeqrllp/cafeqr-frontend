import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import PremiumDateTimePicker from '../../components/PremiumDateTimePicker';
import NiceSelect from '../../components/NiceSelect';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  FaChartBar, FaReceipt, FaBoxes, FaCreditCard, FaFileInvoice,
  FaChartLine, FaClock, FaWallet, FaShoppingCart, FaFileCsv,
  FaFileExcel, FaPrint, FaChevronDown, FaChevronRight, FaBan,
  FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaSearch
} from 'react-icons/fa';

const TABS = [
  { key: 'summary', label: 'Sales Summary', icon: <FaChartBar /> },
  { key: 'orders', label: 'Sales Orders', icon: <FaReceipt /> },
  { key: 'items', label: 'Item-wise', icon: <FaBoxes /> },
  { key: 'payments', label: 'Payments', icon: <FaCreditCard /> },
  { key: 'tax', label: 'Tax Report', icon: <FaFileInvoice /> },
  { key: 'invoices', label: 'Invoices', icon: <FaWallet /> },
  { key: 'pnl', label: 'Profit & Loss', icon: <FaChartLine /> },
  { key: 'hourly', label: 'Hourly Trends', icon: <FaClock /> },
];

const SYM = '₹';

export default function Reports() {
  const { timezone } = useAuth();
  const { notify, showConfirm } = useNotification();
  const [tab, setTab] = useState('summary');
  const [loading, setLoading] = useState(false);

  const getLocalDate = (d = new Date()) => {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const getBizNow = () => {
    const now = new Date();
    if (!timezone) return now;
    try {
      const m = timezone.match(/UTC([+-])(\d+):(\d+)/);
      if (m) {
        const off = (m[1]==='+' ? 1 : -1) * (parseInt(m[2])*60 + parseInt(m[3]));
        return new Date(now.getTime() + (off - (-now.getTimezoneOffset())) * 60000);
      }
    } catch {}
    return now;
  };

  const [dateFrom, setDateFrom] = useState(() => `${getLocalDate(getBizNow())}T00:00`);
  const [dateTo, setDateTo] = useState(() => `${getLocalDate(getBizNow())}T23:59`);

  // Data states
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [taxData, setTaxData] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [pnl, setPnl] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [invoiceFilter, setInvoiceFilter] = useState('ALL');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const toInstant = (dtLocal) => {
    if (!dtLocal) return undefined;
    try { return new Date(dtLocal + ':00').toISOString(); } catch { return undefined; }
  };

  const loadTab = useCallback(async (t) => {
    setLoading(true);
    const params = { from: toInstant(dateFrom), to: toInstant(dateTo) };
    try {
      const ep = {
        summary: '/api/v1/reports/sales-summary',
        orders: '/api/v1/reports/sales-orders',
        items: '/api/v1/reports/item-wise',
        payments: '/api/v1/reports/payment-breakdown',
        tax: '/api/v1/reports/tax-summary',
        invoices: '/api/v1/reports/invoices',
        pnl: '/api/v1/reports/profit-loss',
        hourly: '/api/v1/reports/hourly',
      }[t];
      if (!ep) return;
      const p = t === 'invoices' ? { ...params, type: invoiceFilter } : params;
      const res = await api.get(ep, { params: p });
      if (res.data?.success) {
        const d = res.data.data;
        if (t === 'summary') setSummary(d);
        else if (t === 'orders') setOrders(d || []);
        else if (t === 'items') setItems(d || []);
        else if (t === 'payments') setPayments(d || []);
        else if (t === 'tax') setTaxData(d || []);
        else if (t === 'invoices') setInvoices(d || []);
        else if (t === 'pnl') setPnl(d);
        else if (t === 'hourly') setHourly(d || []);
      }
    } catch (e) {
      console.error('Report load error:', e);
      notify('error', 'Failed to load report data');
    } finally { setLoading(false); }
  }, [dateFrom, dateTo, invoiceFilter]);

  useEffect(() => { loadTab(tab); }, [tab, dateFrom, dateTo]);
  useEffect(() => { if (tab === 'invoices') loadTab('invoices'); }, [invoiceFilter]);

  const fmt = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const exportCSV = (headers, rows, filename) => {
    if (!rows.length) return notify('error', 'No data to export');
    const csv = [headers.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `${filename}_${getLocalDate()}.csv`;
    a.click();
  };

  const exportExcel = async (data, sheetName, filename) => {
    if (!data.length) return notify('error', 'No data');
    try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${filename}_${getLocalDate()}.xlsx`);
    } catch { notify('error', 'Excel export failed'); }
  };

  const handleVoid = (inv) => {
    showConfirm({
      title: 'Void Invoice?',
      message: `Void invoice ${inv.invoiceNo}? This will cancel the linked order.`,
      type: 'error',
      onConfirm: async () => {
        try {
          await api.post(`/api/v1/reports/invoices/${inv.id}/void`, { reason: 'Voided from reports' });
          notify('success', 'Invoice voided');
          loadTab('invoices');
        } catch (e) { notify('error', e.response?.data?.message || 'Void failed'); }
      }
    });
  };

  // ─── RENDER HELPERS ─────────────────────────────────────────────────
  const renderSummary = () => {
    if (!summary) return <div className="rpt-empty">No data for selected range</div>;
    const cards = [
      { label: 'Total Revenue', val: `${SYM}${fmt(summary.grandTotal)}`, color: '#10b981', bg: '#ecfdf5' },
      { label: 'Total Orders', val: summary.totalOrders, color: '#3b82f6', bg: '#eff6ff' },
      { label: 'Avg Order Value', val: `${SYM}${fmt(summary.avgOrderValue)}`, color: '#8b5cf6', bg: '#f5f3ff' },
      { label: 'Items Sold', val: summary.itemsSold, color: '#f97316', bg: '#fff7ed' },
      { label: 'Total Tax', val: `${SYM}${fmt(summary.totalTax)}`, color: '#ef4444', bg: '#fef2f2' },
      { label: 'Discounts', val: `${SYM}${fmt(summary.totalDiscount)}`, color: '#ec4899', bg: '#fdf2f8' },
    ];
    return (
      <div className="rpt-kpi-grid">
        {cards.map((c, i) => (
          <div key={i} className="rpt-kpi" style={{ borderLeft: `4px solid ${c.color}` }}>
            <div className="rpt-kpi-icon" style={{ background: c.bg, color: c.color }}>{TABS[0].icon}</div>
            <div className="rpt-kpi-data">
              <span className="rpt-kpi-label">{c.label}</span>
              <span className="rpt-kpi-val">{c.val}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderOrders = () => (
    <>
      <div className="rpt-toolbar">
        <button className="rpt-exp-btn" onClick={() => exportCSV(
          ['Order No','Date','Customer','Status','Payment','Total'],
          orders.map(o => `${o.orderNo},"${o.createdAt}","${o.customerName||''}",${o.orderStatus},${o.paymentStatus},${o.grandTotal}`),
          'sales_orders'
        )}><FaFileCsv /> CSV</button>
        <button className="rpt-exp-btn" onClick={() => exportExcel(
          orders.map(o => ({ 'Order No': o.orderNo, Date: o.createdAt, Customer: o.customerName, Status: o.orderStatus, Total: o.grandTotal })),
          'Orders', 'sales_orders'
        )}><FaFileExcel /> Excel</button>
      </div>
      {orders.length === 0 ? <div className="rpt-empty">No orders found</div> : (
        <div className="rpt-tbl-wrap">
          <table className="rpt-tbl">
            <thead><tr>
              <th>Order No</th><th>Date</th><th>Customer</th><th>Type</th><th>Status</th><th className="r">Total</th><th></th>
            </tr></thead>
            <tbody>{orders.map(o => (
              <React.Fragment key={o.id}>
                <tr onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)} style={{cursor:'pointer'}}>
                  <td><span className="rpt-mono">{o.orderNo}</span></td>
                  <td>{o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:true}) : '—'}</td>
                  <td>{o.customerName || '—'}</td>
                  <td><span className="rpt-pill">{o.fulfillmentType || 'COUNTER'}</span></td>
                  <td><span className={`rpt-st ${o.orderStatus?.toLowerCase()}`}>{o.orderStatus}</span></td>
                  <td className="r rpt-amt">{SYM}{fmt(o.grandTotal)}</td>
                  <td>{expandedOrder === o.id ? <FaChevronDown /> : <FaChevronRight />}</td>
                </tr>
                {expandedOrder === o.id && o.lines?.length > 0 && (
                  <tr><td colSpan={7} style={{padding:0}}>
                    <div className="rpt-subrows">
                      {o.lines.map((l, i) => (
                        <div key={i} className="rpt-subrow">
                          <span>{l.productName}</span>
                          <span>{l.quantity} × {SYM}{fmt(l.unitPrice)}</span>
                          <span className="rpt-amt">{SYM}{fmt(l.lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                  </td></tr>
                )}
              </React.Fragment>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );

  const renderItems = () => {
    const maxRev = items.length ? Math.max(...items.map(i => Number(i.revenue || 0))) : 1;
    return (
      <>
        <div className="rpt-toolbar">
          <button className="rpt-exp-btn" onClick={() => exportCSV(
            ['Item,Category,Qty Sold,Revenue'],
            items.map(i => `"${i.productName}","${i.categoryName}",${i.quantitySold},${i.revenue}`),
            'item_wise'
          )}><FaFileCsv /> CSV</button>
        </div>
        {items.length === 0 ? <div className="rpt-empty">No item data</div> : (
          <div className="rpt-tbl-wrap">
            <table className="rpt-tbl">
              <thead><tr><th>#</th><th>Product</th><th>Category</th><th className="r">Qty</th><th className="r">Revenue</th><th>Share</th></tr></thead>
              <tbody>{items.map((it, i) => (
                <tr key={i}>
                  <td>{i+1}</td>
                  <td><strong>{it.productName}</strong></td>
                  <td><span className="rpt-pill">{it.categoryName}</span></td>
                  <td className="r">{Number(it.quantitySold)}</td>
                  <td className="r rpt-amt">{SYM}{fmt(it.revenue)}</td>
                  <td><div className="rpt-bar-wrap"><div className="rpt-bar" style={{width:`${(Number(it.revenue)/maxRev*100).toFixed(0)}%`}} /></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </>
    );
  };

  const renderPayments = () => (
    payments.length === 0 ? <div className="rpt-empty">No payment data</div> : (
      <div className="rpt-pay-grid">
        {payments.map((p, i) => (
          <div key={i} className="rpt-pay-card">
            <div className="rpt-pay-method">{p.paymentMethod}</div>
            <div className="rpt-pay-amt">{SYM}{fmt(p.totalAmount)}</div>
            <div className="rpt-pay-meta">{p.orderCount} txns · {Number(p.percentage || 0).toFixed(1)}%</div>
            <div className="rpt-pay-bar"><div style={{width:`${p.percentage}%`}} /></div>
          </div>
        ))}
      </div>
    )
  );

  const renderTax = () => (
    <>
      <div className="rpt-toolbar">
        <button className="rpt-exp-btn" onClick={() => exportCSV(
          ['Tax Rate,Taxable Amount,CGST,SGST,Total Tax,Lines'],
          taxData.map(t => `${t.taxRate}%,${t.taxableAmount},${t.cgst},${t.sgst},${t.totalTax},${t.lineCount}`),
          'tax_report'
        )}><FaFileCsv /> HSN CSV</button>
      </div>
      {taxData.length === 0 ? <div className="rpt-empty">No tax data</div> : (
        <div className="rpt-tbl-wrap">
          <table className="rpt-tbl">
            <thead><tr><th>Tax Slab</th><th className="r">Taxable</th><th className="r">CGST</th><th className="r">SGST</th><th className="r">Total Tax</th><th className="r">Lines</th></tr></thead>
            <tbody>{taxData.map((t, i) => (
              <tr key={i}>
                <td><span className="rpt-pill tax">{Number(t.taxRate)}%</span></td>
                <td className="r">{SYM}{fmt(t.taxableAmount)}</td>
                <td className="r">{SYM}{fmt(t.cgst)}</td>
                <td className="r">{SYM}{fmt(t.sgst)}</td>
                <td className="r rpt-amt">{SYM}{fmt(t.totalTax)}</td>
                <td className="r">{t.lineCount}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );

  const renderInvoices = () => (
    <>
      <div className="rpt-toolbar">
        <NiceSelect value={invoiceFilter} onChange={setInvoiceFilter} options={[
          {value:'ALL',label:'All Invoices'},{value:'PAID',label:'Paid Sales'},{value:'CREDIT',label:'Credit/Unpaid'},{value:'VOIDED',label:'Voided'}
        ]} style={{width:180}} />
        <button className="rpt-exp-btn" onClick={() => exportCSV(
          ['Invoice No,Date,Status,Amount,Due,Customer'],
          invoices.map(i => `${i.invoiceNo},"${i.invoiceDate}",${i.status},${i.totalAmount},${i.amountDue},"${i.customerName||''}"` ),
          'invoices'
        )}><FaFileCsv /> CSV</button>
      </div>
      {invoices.length === 0 ? <div className="rpt-empty">No invoices found</div> : (
        <div className="rpt-tbl-wrap">
          <table className="rpt-tbl">
            <thead><tr><th>Invoice No</th><th>Date</th><th>Customer</th><th>Payment</th><th>Status</th><th className="r">Amount</th><th className="r">Due</th><th></th></tr></thead>
            <tbody>{invoices.map(inv => (
              <tr key={inv.id} className={inv.status === 'VOID' ? 'voided' : ''}>
                <td><span className="rpt-mono">{inv.invoiceNo || '—'}</span></td>
                <td>{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}) : '—'}</td>
                <td>{inv.customerName || '—'}</td>
                <td><span className="rpt-pill">{inv.paymentMethod || '—'}</span></td>
                <td><span className={`rpt-st ${inv.status?.toLowerCase()}`}>{inv.status}</span></td>
                <td className="r rpt-amt">{SYM}{fmt(inv.totalAmount)}</td>
                <td className="r">{SYM}{fmt(inv.amountDue)}</td>
                <td>{inv.status !== 'VOID' && <button className="rpt-void-btn" onClick={() => handleVoid(inv)} title="Void"><FaBan /></button>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );

  const renderPnL = () => {
    if (!pnl) return <div className="rpt-empty">No P&L data</div>;
    const rows = [
      { label: 'Gross Sales', val: pnl.grossSales, color: '#10b981', type: '+' },
      { label: 'Total Tax Collected', val: pnl.totalTax, color: '#6366f1', type: 'i' },
      { label: 'Total Expenses', val: pnl.totalExpenses, color: '#ef4444', type: '-' },
      { label: 'Net Profit', val: pnl.netProfit, color: '#0ea5e9', type: '=' },
      { label: 'Credit Outstanding', val: pnl.creditOutstanding, color: '#f59e0b', type: '-' },
      { label: 'Net Cash Profit', val: pnl.netCashProfit, color: Number(pnl.netCashProfit) >= 0 ? '#10b981' : '#ef4444', type: '=' },
    ];
    return (
      <div className="rpt-pnl-grid">
        {rows.map((r, i) => (
          <div key={i} className="rpt-pnl-row" style={{ borderLeft: `4px solid ${r.color}` }}>
            <span className="rpt-pnl-type" style={{color: r.color}}>{r.type}</span>
            <span className="rpt-pnl-label">{r.label}</span>
            <span className="rpt-pnl-val" style={{color: r.color}}>{SYM}{fmt(r.val)}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderHourly = () => {
    const maxAmt = hourly.length ? Math.max(...hourly.map(h => Number(h.totalAmount || 0)), 1) : 1;
    return hourly.length === 0 ? <div className="rpt-empty">No hourly data</div> : (
      <div className="rpt-hourly-chart">
        {hourly.map((h, i) => (
          <div key={i} className="rpt-hour-col">
            <div className="rpt-hour-bar-area">
              <div className="rpt-hour-bar" style={{height:`${(Number(h.totalAmount)/maxAmt*100).toFixed(0)}%`}}>
                <span className="rpt-hour-tip">{SYM}{fmt(h.totalAmount)}</span>
              </div>
            </div>
            <div className="rpt-hour-label">{h.hourLabel}</div>
            <div className="rpt-hour-cnt">{h.orderCount}</div>
          </div>
        ))}
      </div>
    );
  };

  const tabContent = { summary: renderSummary, orders: renderOrders, items: renderItems, payments: renderPayments, tax: renderTax, invoices: renderInvoices, pnl: renderPnL, hourly: renderHourly };

  return (
    <DashboardLayout title="Reports & Billing">
      <div className="rpt-page">
        <div className="rpt-controls">
          <div className="rpt-dates">
            <PremiumDateTimePicker value={dateFrom} onChange={setDateFrom} />
            <span className="rpt-sep">→</span>
            <PremiumDateTimePicker value={dateTo} onChange={setDateTo} />
          </div>
          <button className="rpt-refresh" onClick={() => loadTab(tab)}>Refresh</button>
        </div>
        <div className="rpt-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`rpt-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </div>
        <div className="rpt-body">
          {loading ? <div className="rpt-loading">Loading report data…</div> : tabContent[tab]?.()}
        </div>
      </div>
      <style jsx global>{`
        .rpt-page{padding:0 20px;width:100%}
        .rpt-controls{display:flex;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap;background:#fff;padding:12px 16px;border-radius:16px;border:1px solid #f1f5f9;box-shadow:0 2px 10px rgba(0,0,0,.02)}
        .rpt-dates{display:flex;align-items:center;gap:8px;flex:1}
        .rpt-dates>:global(.premium-dt-picker){width:230px}
        .rpt-sep{color:#cbd5e1;font-weight:300;font-size:18px}
        .rpt-refresh{padding:10px 20px;border-radius:12px;border:1.5px solid #f97316;background:#fff;color:#f97316;font-size:11px;font-weight:800;cursor:pointer;transition:.2s}
        .rpt-refresh:hover{background:#f97316;color:#fff}
        .rpt-tabs{display:flex;gap:4px;margin-bottom:20px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch}
        .rpt-tab{display:flex;align-items:center;gap:6px;padding:10px 16px;border-radius:12px;border:1px solid #f1f5f9;background:#fff;color:#64748b;font-size:11px;font-weight:700;cursor:pointer;transition:.25s;white-space:nowrap}
        .rpt-tab:hover{border-color:#f97316;color:#f97316;transform:translateY(-1px)}
        .rpt-tab.active{background:#f97316;color:#fff;border-color:#f97316;box-shadow:0 4px 12px rgba(249,115,22,.25)}
        .rpt-tab svg{font-size:13px}
        .rpt-tab span{display:inline}
        .rpt-body{min-height:300px}
        .rpt-loading{text-align:center;padding:60px 20px;color:#94a3b8;font-weight:700;font-size:14px}
        .rpt-empty{text-align:center;padding:60px 20px;color:#cbd5e1;font-size:14px;font-weight:600}
        .rpt-toolbar{display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap}
        .rpt-exp-btn{padding:8px 14px;border-radius:10px;border:1.5px solid #f97316;background:#fff;color:#f97316;font-size:10px;font-weight:800;display:flex;align-items:center;gap:6px;cursor:pointer;transition:.2s}
        .rpt-exp-btn:hover{background:#fff7ed;transform:translateY(-1px)}
        .rpt-exp-btn svg{font-size:12px}
        .rpt-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
        .rpt-kpi{background:#fff;padding:20px;border-radius:16px;border:1px solid #f1f5f9;display:flex;align-items:center;gap:16px;transition:.3s}
        .rpt-kpi:hover{transform:translateY(-2px);box-shadow:0 10px 20px rgba(0,0,0,.03)}
        .rpt-kpi-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
        .rpt-kpi-data{display:flex;flex-direction:column}
        .rpt-kpi-label{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px}
        .rpt-kpi-val{font-size:22px;font-weight:800;color:#1e293b}
        .rpt-tbl-wrap{background:#fff;border-radius:16px;border:1px solid #f1f5f9;overflow:auto;box-shadow:0 4px 12px rgba(0,0,0,.02)}
        .rpt-tbl{width:100%;border-collapse:collapse;min-width:600px}
        .rpt-tbl th{background:#f8fafc;padding:12px 16px;text-align:left;font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid #f1f5f9}
        .rpt-tbl td{padding:14px 16px;border-bottom:1px solid #f8fafc;font-size:12px;color:#475569;vertical-align:middle}
        .rpt-tbl tr:hover td{background:#fcfdfe}
        .rpt-tbl .r{text-align:right}
        .rpt-tbl .voided td{opacity:.5;background:#fef2f2}
        .rpt-mono{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;color:#64748b;background:#f1f5f9;padding:4px 8px;border-radius:6px}
        .rpt-pill{font-size:9px;font-weight:700;padding:3px 8px;border-radius:20px;background:#f1f5f9;color:#475569;text-transform:uppercase}
        .rpt-pill.tax{background:#eff6ff;color:#3b82f6}
        .rpt-st{font-size:9px;font-weight:800;padding:3px 8px;border-radius:6px;text-transform:uppercase}
        .rpt-st.completed,.rpt-st.paid{background:#ecfdf5;color:#10b981}
        .rpt-st.confirmed,.rpt-st.billed{background:#eff6ff;color:#3b82f6}
        .rpt-st.draft,.rpt-st.pending{background:#fff7ed;color:#f97316}
        .rpt-st.cancelled,.rpt-st.void{background:#fef2f2;color:#ef4444}
        .rpt-amt{font-weight:800;color:#1e293b}
        .rpt-subrows{background:#f8fafc;padding:12px 20px;border-left:4px solid #f97316}
        .rpt-subrow{display:flex;justify-content:space-between;padding:6px 0;font-size:11px;color:#64748b;border-bottom:1px solid #f1f5f9}
        .rpt-subrow:last-child{border-bottom:none}
        .rpt-bar-wrap{width:100%;height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden}
        .rpt-bar{height:100%;background:linear-gradient(90deg,#f97316,#fb923c);border-radius:4px;transition:width .6s ease}
        .rpt-pay-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
        .rpt-pay-card{background:#fff;padding:20px;border-radius:16px;border:1px solid #f1f5f9;transition:.3s}
        .rpt-pay-card:hover{transform:translateY(-2px);box-shadow:0 10px 20px rgba(0,0,0,.03)}
        .rpt-pay-method{font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
        .rpt-pay-amt{font-size:24px;font-weight:800;color:#1e293b;margin-bottom:4px}
        .rpt-pay-meta{font-size:11px;color:#94a3b8;font-weight:600;margin-bottom:12px}
        .rpt-pay-bar{height:6px;background:#f1f5f9;border-radius:3px;overflow:hidden}
        .rpt-pay-bar>div{height:100%;background:linear-gradient(90deg,#f97316,#fb923c);border-radius:3px;transition:width .6s}
        .rpt-pnl-grid{display:flex;flex-direction:column;gap:12px}
        .rpt-pnl-row{background:#fff;padding:20px 24px;border-radius:16px;border:1px solid #f1f5f9;display:flex;align-items:center;gap:16px}
        .rpt-pnl-type{font-size:18px;font-weight:900;width:30px;text-align:center}
        .rpt-pnl-label{flex:1;font-size:14px;font-weight:700;color:#475569}
        .rpt-pnl-val{font-size:22px;font-weight:800}
        .rpt-hourly-chart{display:flex;gap:4px;align-items:flex-end;padding:20px;background:#fff;border-radius:16px;border:1px solid #f1f5f9;min-height:280px;overflow-x:auto}
        .rpt-hour-col{display:flex;flex-direction:column;align-items:center;flex:1;min-width:36px}
        .rpt-hour-bar-area{width:100%;height:200px;display:flex;align-items:flex-end;justify-content:center}
        .rpt-hour-bar{width:70%;min-width:16px;background:linear-gradient(180deg,#f97316,#fb923c);border-radius:6px 6px 0 0;position:relative;transition:height .6s ease;min-height:4px}
        .rpt-hour-tip{position:absolute;top:-24px;left:50%;transform:translateX(-50%);font-size:8px;font-weight:700;color:#64748b;white-space:nowrap;opacity:0;transition:.2s}
        .rpt-hour-col:hover .rpt-hour-tip{opacity:1}
        .rpt-hour-label{font-size:9px;font-weight:700;color:#64748b;margin-top:8px}
        .rpt-hour-cnt{font-size:8px;color:#cbd5e1;font-weight:600}
        .rpt-void-btn{width:30px;height:30px;border-radius:8px;border:1px solid #fecaca;background:#fff;color:#ef4444;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.2s;font-size:12px}
        .rpt-void-btn:hover{background:#fef2f2;transform:scale(1.05)}
        @media(max-width:768px){
          .rpt-page{padding:0 4px}
          .rpt-controls{flex-direction:column;align-items:stretch}
          .rpt-dates{flex-direction:column}
          .rpt-dates>:global(.premium-dt-picker){width:100%!important}
          .rpt-tabs{gap:2px}
          .rpt-tab{padding:8px 10px;font-size:10px}
          .rpt-tab span{display:none}
          .rpt-kpi-grid{grid-template-columns:1fr}
          .rpt-pay-grid{grid-template-columns:1fr}
        }
      `}</style>
    </DashboardLayout>
  );
}
