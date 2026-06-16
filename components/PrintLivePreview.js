import React, { useState, useMemo } from 'react';
import { FaPrint, FaUtensils, FaReceipt } from 'react-icons/fa';
import { bitmapToPngBase64 } from '../utils/logoBitmap';

export default function PrintLivePreview({ config }) {
  const [activePreview, setActivePreview] = useState('receipt'); // 'receipt' or 'kot'

  // Convert logo bitmap to image data URL if present
  const logoSrc = useMemo(() => {
    if (config?.print_logo_bitmap && config?.print_logo_cols && config?.print_logo_rows) {
      return bitmapToPngBase64(config.print_logo_bitmap, config.print_logo_cols, config.print_logo_rows);
    }
    return null;
  }, [config?.print_logo_bitmap, config?.print_logo_cols, config?.print_logo_rows]);

  // CSS mappings for ESC/POS font sizes in HTML preview
  const getFontClass = (font) => {
    switch (font) {
      case 'DOUBLE':
        return 'font-double';
      case 'DOUBLE_HEIGHT':
        return 'font-double-height';
      case 'DOUBLE_WIDTH':
        return 'font-double-width';
      case 'NORMAL':
      default:
        return 'font-normal';
    }
  };

  return (
    <div className="preview-container">
      {/* Selector Tabs */}
      <div className="preview-tabs">
        <button 
          className={`preview-tab-btn ${activePreview === 'receipt' ? 'active' : ''}`}
          onClick={() => setActivePreview('receipt')}
        >
          <FaReceipt /> Receipt
        </button>
        <button 
          className={`preview-tab-btn ${activePreview === 'kot' ? 'active' : ''}`}
          onClick={() => setActivePreview('kot')}
        >
          <FaUtensils /> KOT
        </button>
      </div>

      {/* Simulated Thermal Paper Strip */}
      <div className="paper-viewport">
        <div className="paper-strip">
          <div className="paper-edge-top"></div>
          
          <div className="paper-content">
            {activePreview === 'receipt' ? (
              /* ================= RECEIPT VIEW ================= */
              <div className="receipt-view">
                
                {/* Logo */}
                {logoSrc && (
                  <div className="receipt-logo-container">
                    <img src={logoSrc} alt="Restaurant Logo" className="receipt-logo" />
                  </div>
                )}

                {/* Restaurant Name */}
                {config.pt_show_restaurant_name && (
                  <div className={`restaurant-name ${getFontClass(config.pt_receipt_title_font)}`}>
                    MY CAFE RESTAURANT
                  </div>
                )}

                {/* Restaurant Address & License Info */}
                <div className="restaurant-details text-center font-small">
                  <div>123 Gourmet Boulevard, Food District</div>
                  <div>Phone: +91 98765 43210</div>
                  {config.pt_show_fssai && (
                    <div className="license-info">FSSAI: 12345678901234</div>
                  )}
                  {config.pt_show_gst_breakdown && (
                    <div className="license-info">GSTIN: 29AAAAA1111A1Z1</div>
                  )}
                </div>

                <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>

                {/* Order Details */}
                <div className="order-meta text-left font-small">
                  <div>Date: 16/06/2026 02:45 PM</div>
                  <div>Invoice: INV-2026-0842</div>
                  <div>Bill No: B-941</div>
                  {config.pt_show_daily_bill_no && (
                    <div className="highlight-line">Daily Bill No: #042</div>
                  )}
                  {config.pt_show_table_label && (
                    <div className="highlight-line">Order Type: Dine in (Table 5)</div>
                  )}
                  {config.pt_show_customer_details && (
                    <div className="customer-info">
                      Customer: John Doe (+91 99999 88888)
                    </div>
                  )}
                </div>

                <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>

                {/* Header Custom Text */}
                {config.pt_receipt_header && (
                  <div className="custom-header-text text-center">
                    {config.pt_receipt_header}
                  </div>
                )}

                {config.pt_receipt_header && (
                  <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>
                )}

                {/* Items Table Header */}
                <div className="items-table header font-small">
                  <span className="col-item text-left">ITEM</span>
                  <span className="col-qty text-right">QTY</span>
                  <span className="col-rate text-right">RATE</span>
                  <span className="col-total text-right">TOTAL</span>
                </div>
                <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>

                {/* Items Table Body */}
                <div className={`items-list ${getFontClass(config.pt_receipt_body_font)}`}>
                  <div className="items-row">
                    <div className="col-item text-left">
                      Chicken Biryani
                      <span className="item-variant">Double Masala</span>
                    </div>
                    <span className="col-qty text-right">1</span>
                    <span className="col-rate text-right">250.00</span>
                    <span className="col-total text-right">250.00</span>
                  </div>
                  
                  <div className="items-row">
                    <div className="col-item text-left">
                      Paneer Butter Masala
                    </div>
                    <span className="col-qty text-right">2</span>
                    <span className="col-rate text-right">180.00</span>
                    <span className="col-total text-right">360.00</span>
                  </div>
                  
                  <div className="items-row">
                    <div className="col-item text-left">
                      Garlic Naan
                      <span className="item-variant">Butter</span>
                    </div>
                    <span className="col-qty text-right">4</span>
                    <span className="col-rate text-right">40.00</span>
                    <span className="col-total text-right">160.00</span>
                  </div>
                </div>

                <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>

                {/* Pricing Calculation Summary */}
                <div className="totals-summary font-small">
                  <div className="total-row">
                    <span>Gross Total:</span>
                    <span>770.00</span>
                  </div>
                  <div className="total-row">
                    <span>Discount:</span>
                    <span>-77.00</span>
                  </div>
                  
                  {config.pt_show_gst_breakdown && (
                    <>
                      <div className="total-row">
                        <span>CGST (2.5%):</span>
                        <span>17.33</span>
                      </div>
                      <div className="total-row">
                        <span>SGST (2.5%):</span>
                        <span>17.33</span>
                      </div>
                    </>
                  )}
                  
                  <div className="total-row">
                    <span>Round Off:</span>
                    <span>+0.34</span>
                  </div>
                  
                  <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>
                  
                  <div className="grand-total-row">
                    <span>GRAND TOTAL:</span>
                    <span>₹728.00</span>
                  </div>
                </div>

                <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>

                {/* Footer Custom Texts */}
                {config.pt_receipt_footer && (
                  <div className="custom-footer-text text-center">
                    {config.pt_receipt_footer}
                  </div>
                )}
                
                {config.bill_footer && (
                  <div className="bill-footer-msg text-center font-small">
                    {config.bill_footer}
                  </div>
                )}

                <div className="powered-by text-center font-small">
                  Powered by Cafe QR
                </div>

              </div>
            ) : (
              /* ================= KOT VIEW ================= */
              <div className="kot-view">
                
                {/* Restaurant Name on KOT */}
                {config.pt_show_restaurant_name && (
                  <div className={`restaurant-name ${getFontClass(config.pt_kot_title_font)}`}>
                    MY CAFE RESTAURANT
                  </div>
                )}

                <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>
                
                {/* KOT Custom Header */}
                {config.pt_kot_header && (
                  <div className="custom-header-text text-center">
                    {config.pt_kot_header}
                  </div>
                )}
                
                {config.pt_kot_header && (
                  <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>
                )}

                {/* KOT Meta Info */}
                <div className="order-meta text-left font-small">
                  <div>Date: 16/06/2026 02:45 PM</div>
                  <div>KOT Ref: KOT-842A</div>
                  {config.pt_show_daily_bill_no && (
                    <div>Daily Bill No: #042</div>
                  )}
                  <div>Attended by: Cashier Sam</div>
                  {config.pt_show_customer_details && (
                    <div className="customer-info">
                      Customer: John Doe
                    </div>
                  )}
                </div>

                {/* Special Instructions */}
                <div className="special-instructions text-left font-small">
                  <div className="inst-label">Instructions:</div>
                  <div className="inst-content">Make Paneer Butter Masala extra spicy. Naan should be crisp.</div>
                </div>

                <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>

                {/* Table Highlight (KOT Title Font) */}
                {config.pt_show_table_label && (
                  <div className={`kot-table-label text-center ${getFontClass(config.pt_kot_title_font)}`}>
                    TABLE: 5
                  </div>
                )}

                {config.pt_show_table_label && (
                  <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>
                )}

                {/* KOT Items List Header */}
                <div className="kot-table-header font-small">
                  <span className="col-item text-left">ITEM</span>
                  <span className="col-qty text-right">QTY</span>
                </div>
                
                <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>

                {/* KOT Items Table Body */}
                <div className={`kot-items-list ${getFontClass(config.pt_kot_body_font)}`}>
                  <div className="items-row font-bold">
                    <div className="col-item text-left">
                      Chicken Biryani
                      <span className="item-variant">Double Masala</span>
                    </div>
                    <span className="col-qty text-right">1</span>
                  </div>
                  
                  <div className="items-row font-bold">
                    <div className="col-item text-left">
                      Paneer Butter Masala
                    </div>
                    <span className="col-qty text-right">2</span>
                  </div>
                  
                  <div className="items-row font-bold">
                    <div className="col-item text-left">
                      Garlic Naan
                      <span className="item-variant">Butter</span>
                    </div>
                    <span className="col-qty text-right">4</span>
                  </div>
                </div>

                <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>

                {/* KOT Custom Footer */}
                {config.pt_kot_footer && (
                  <div className="custom-footer-text text-center">
                    {config.pt_kot_footer}
                  </div>
                )}

              </div>
            )}
          </div>

          <div className="paper-edge-bottom"></div>
        </div>
      </div>

      <style jsx>{`
        .preview-container {
          background: #0f172a;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          color: white;
          width: 100%;
          max-width: 380px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .preview-tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px;
          border-radius: 12px;
          gap: 4px;
        }

        .preview-tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          padding: 10px;
          border-radius: 8px;
          color: #94a3b8;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .preview-tab-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.02);
        }

        .preview-tab-btn.active {
          background: #f97316;
          color: white;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
        }

        .paper-viewport {
          display: flex;
          justify-content: center;
          max-height: 580px;
          overflow-y: auto;
          padding: 10px 4px;
          border-radius: 16px;
          background: rgba(0, 0, 0, 0.2);
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        /* Customize Scrollbar for Paper Viewport */
        .paper-viewport::-webkit-scrollbar {
          width: 6px;
        }
        .paper-viewport::-webkit-scrollbar-track {
          background: transparent;
        }
        .paper-viewport::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 99px;
        }

        .paper-strip {
          background: #ffffff;
          color: #1e293b;
          width: 100%;
          max-width: 310px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          line-height: 1.4;
          position: relative;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
        }

        .paper-content {
          width: 100%;
        }

        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .font-small { font-size: 11px; }

        .receipt-divider {
          color: #64748b;
          text-align: center;
          margin: 6px 0;
          letter-spacing: 1px;
          user-select: none;
          font-weight: bold;
        }

        /* Logo image styling */
        .receipt-logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }
        .receipt-logo {
          max-width: 100px;
          max-height: 50px;
          object-fit: contain;
          filter: grayscale(100%) contrast(200%);
        }

        .restaurant-name {
          text-transform: uppercase;
          text-align: center;
          margin-bottom: 4px;
        }

        .restaurant-details {
          color: #475569;
          margin-bottom: 4px;
        }

        .license-info {
          margin-top: 2px;
        }

        .order-meta {
          color: #334155;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .highlight-line {
          font-weight: bold;
        }

        .customer-info {
          margin-top: 2px;
          font-style: italic;
        }

        .custom-header-text, .custom-footer-text {
          font-weight: bold;
        }

        /* Items table styling */
        .items-table, .kot-table-header {
          display: grid;
          font-weight: bold;
          color: #0f172a;
        }
        .items-table {
          grid-template-columns: 2fr 30px 55px 60px;
          gap: 4px;
        }
        .kot-table-header {
          grid-template-columns: 1fr 50px;
          gap: 8px;
        }

        .items-list, .kot-items-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .items-row {
          display: grid;
          align-items: start;
        }
        .items-list .items-row {
          grid-template-columns: 2fr 30px 55px 60px;
          gap: 4px;
        }
        .kot-items-list .items-row {
          grid-template-columns: 1fr 50px;
          gap: 8px;
        }

        .item-variant {
          display: block;
          font-size: 10.5px;
          color: #475569;
          margin-top: 1px;
        }

        .special-instructions {
          background: #f1f5f9;
          border-left: 3px solid #dc2626;
          padding: 6px 10px;
          margin: 10px 0;
          border-radius: 2px 4px 4px 2px;
        }
        .inst-label {
          font-weight: bold;
          color: #dc2626;
          margin-bottom: 2px;
        }
        .inst-content {
          color: #334155;
          font-style: italic;
        }

        .kot-table-label {
          font-weight: bold;
          margin: 6px 0;
        }

        .totals-summary {
          display: flex;
          flex-direction: column;
          gap: 4px;
          color: #334155;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
        }

        .grand-total-row {
          display: flex;
          justify-content: space-between;
          font-size: 16px;
          font-weight: bold;
          color: #000000;
        }

        .bill-footer-msg {
          color: #475569;
          margin-top: 8px;
          white-space: pre-wrap;
        }

        .powered-by {
          color: #94a3b8;
          margin-top: 12px;
          font-size: 9.5px;
          letter-spacing: 0.5px;
        }

        /* ---------------------------------
         ESC/POS Font Styling Simulations
        ---------------------------------- */
        .font-normal {
          font-size: 13px;
        }

        .font-double {
          font-size: 17px;
          font-weight: bold;
          letter-spacing: 0.5px;
        }

        .font-double-height {
          font-size: 13px;
          font-weight: bold;
          display: inline-block;
          transform: scaleY(1.4);
          transform-origin: center top;
          margin-bottom: 4px;
        }

        .font-double-width {
          font-size: 13px;
          font-weight: bold;
          display: inline-block;
          transform: scaleX(1.3);
          transform-origin: center top;
        }
      `}</style>
    </div>
  );
}
