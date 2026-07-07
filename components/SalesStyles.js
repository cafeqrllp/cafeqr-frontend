import styled, { keyframes } from 'styled-components';

export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const TopHeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  width: 100%;
  margin-bottom: 16px;
`;

export const TopSearchInput = styled.div`
  position: relative;
  width: 100%;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 13px;
    pointer-events: none;
  }

  input {
    width: 100%;
    height: 38px;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    padding-left: 34px !important;
    color: #1e293b;
    font-size: 13px;
    font-weight: 600;
    background: white;
    outline: none;
    box-shadow: 0 2px 6px rgba(0,0,0,0.02);
    transition: all 0.25s ease;

    &:hover {
      border-color: #f97316;
    }

    &:focus {
      border-color: #ea580c;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08), 0 2px 6px rgba(0,0,0,0.02);
    }
  }
`;

export const TopNewOrderBtn = styled.button`
  height: 38px;
  padding: 0 20px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
  transition: all 0.25s;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(234, 88, 12, 0.35);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const HistoryToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-top: 3px solid #f97316;
  border-radius: 12px;
  padding: 6px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

  @media (max-width: 720px) {
    align-items: stretch;
    flex-direction: column;
    padding: 10px;
  }
`;

export const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  width: 100%;

  /* Dates sub-container */
  .hist-dates {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;

    .premium-dt-picker {
      width: 220px !important;
    }
  }

  .h-filter-sep {
    font-size: 11px;
    font-weight: 800;
    color: #cbd5e1;
    margin: 0 2px;
  }

  /* Style triggers inside dates and nice-selects */
  .dt-trigger,
  .nice-select-trigger {
    border: 1.5px solid #e2e8f0 !important;
    border-radius: 12px !important;
    background: #f8fafc !important;
    transition: all 0.15s ease !important;
    height: 30px !important;
    line-height: 28px !important;
    font-size: 11px !important;
    padding: 0 10px !important;
    box-sizing: border-box !important;
    display: flex !important;
    align-items: center !important;
  }

  .nice-select-trigger span {
    font-size: 11px !important;
    font-weight: 700 !important;
    line-height: 28px !important;
    color: #1e293b !important;
  }

  .dt-trigger:hover,
  .nice-select-trigger:hover {
    border-color: #f97316 !important;
    background: #fff7ed !important;
  }

  .dt-trigger.active,
  .dt-trigger:focus,
  .nice-select-trigger.open,
  .nice-select-trigger:focus {
    border-color: #ea580c !important;
    background: white !important;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08) !important;
  }

  /* Force nice select specific constraints */
  .nice-select,
  .nice-select-wrapper {
    flex-shrink: 0;
    min-width: 115px !important;
    max-width: 135px !important;
  }

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;

    .hist-dates {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      gap: 4px;

      .premium-dt-picker {
        width: 100% !important;
      }
    }

    .h-filter-sep {
      text-align: center;
      margin: 2px 0;
      font-size: 10px;
    }

    .nice-select,
    .nice-select-wrapper {
      width: 100% !important;
      max-width: none !important;
    }
  }
`;

export const HistoryShell = styled.section`
  padding: 0 24px 96px;
  animation: ${fadeIn} 0.25s ease-out;

  @media (max-width: 720px) {
    padding: 0 16px 96px;
  }
`;

export const HistoryTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    color: #0f172a;
    font-size: 16px;
    font-weight: 900;
  }

  span {
    color: #64748b;
    font-size: 11px;
    font-weight: 700;
  }
`;

export const RefreshButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    border-color: #f97316;
    background: #fff7ed;
    color: #f97316;
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

export const HistoryControls = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 720px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

export const HistoryField = styled.label`
  display: grid;
  gap: 4px;
  flex: ${props => props.$wide ? '1 1 240px' : '0 0 auto'};
  min-width: ${props => props.$wide ? '200px' : '0'};
  color: #64748b;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  input {
    width: 100%;
    height: 30px;
    min-height: 30px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    padding: 0 10px;
    color: #1e293b;
    font-size: 11px;
    font-weight: 700;
    background: #f8fafc;
    transition: all 0.15s ease;

    &:hover {
      border-color: #f97316;
      background: #fff7ed;
    }

    &:focus {
      outline: none;
      border-color: #ea580c;
      background: white;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08);
    }
  }

  .premium-dt-picker {
    width: 220px !important;
  }

  .premium-dt-picker .dt-trigger {
    border: 1.5px solid #e2e8f0 !important;
    border-radius: 12px !important;
    background: #f8fafc !important;
    transition: all 0.15s ease !important;
    height: 30px !important;
    line-height: 28px !important;
    font-size: 11px !important;
    padding: 0 10px !important;
    box-sizing: border-box !important;
    display: flex !important;
    align-items: center !important;
    width: 100%;
  }

  .premium-dt-picker .dt-trigger:hover {
    border-color: #f97316 !important;
    background: #fff7ed !important;
  }

  .premium-dt-picker .dt-trigger.active,
  .premium-dt-picker .dt-trigger:focus-within {
    border-color: #ea580c !important;
    background: #fff !important;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08) !important;
  }

  .premium-dt-picker .dt-input {
    font-size: 11px !important;
    font-weight: 700 !important;
    color: #1e293b !important;
  }

  @media (max-width: 520px) {
    width: 100%;
  }
`;

export const HistorySearchInput = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 11px;
    pointer-events: none;
  }

  input {
    padding-left: 28px !important;
  }
`;

export const HistoryActionButton = styled.button`
  height: 30px;
  min-height: 30px;
  border-radius: 12px;
  border: none;
  background: ${props => props.$primary ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : '#f1f5f9'};
  color: ${props => props.$primary ? 'white' : '#475569'};
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  padding: 0 16px;
  transition: all 0.25s;
  box-shadow: ${props => props.$primary ? '0 4px 10px rgba(234, 88, 12, 0.2)' : 'none'};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.$primary ? '0 6px 14px rgba(234, 88, 12, 0.3)' : 'none'};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
    transform: none;
  }
`;

export const HistoryPager = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 18px;
  color: #475569;
  font-size: 12px;
  font-weight: 900;
`;

export const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const HistTableWrap = styled.div`
  width: 100%;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  overflow-x: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  margin-top: 8px;
  margin-bottom: 24px;
`;

export const HistTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1060px;
  text-align: left;
  font-family: inherit;

  thead {
    background: #ffffff;
  }

  th {
    padding: 10px 14px;
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #ea580c;
    white-space: nowrap;
  }

  td {
    padding: 10px 14px;
    border-bottom: 1px solid #f1f5f9;
    color: #475569;
    font-size: 13px;
    vertical-align: middle;
    white-space: nowrap;
  }
`;

export const HistRow = styled.tr`
  transition: all 0.15s ease; border-left: 3px solid transparent;
  &:hover { border-left-color: #f97316; td { background: #fffbf5; } }
`;

export const OrderNoLink = styled.code`
  font-family: monospace;
  font-size: 12px;
  font-weight: 800;
  color: #FF7A00;
  text-decoration: underline;
  cursor: pointer;
  white-space: nowrap;
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  border-radius: 0 !important;
`;

export const RowDate = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const RdD = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #1e293b;
`;

export const RdT = styled.span`
  font-size: 9px;
  font-weight: 500;
  color: #94a3b8;
`;

export const ItemsPill = styled.span`
  background: #f1f5f9;
  color: #64748b;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  border: 1px solid;
`;

export const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const OrderCard = styled.article`
  background: white;
  border: 1px solid #e2e8f0;
  border-left: 4px solid ${props => props.$tone};
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`;

export const OrderTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 420px) {
    flex-direction: column;
  }
`;

export const OrderNo = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  font-weight: 900;
  color: #0f172a;
  overflow-wrap: anywhere;
`;

export const OrderSub = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  margin-top: 3px;
`;

export const OrderAmount = styled.div`
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
  text-align: right;

  @media (max-width: 420px) {
    text-align: left;
  }
`;

export const OrderBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const OrderBadge = styled.span`
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 900;
  color: ${props => props.$tone === 'red' ? '#b91c1c' : props.$tone === 'blue' ? '#0369a1' : '#c2410c'};
  background: ${props => props.$tone === 'red' ? '#fee2e2' : props.$tone === 'blue' ? '#e0f2fe' : '#ffedd5'};
`;

export const OrderInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

export const InfoPill = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 10px;

  span {
    display: block;
    color: #94a3b8;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  strong {
    color: #334155;
    font-size: 12px;
    font-weight: 800;
    overflow-wrap: anywhere;
  }
`;

export const OrderActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

export const OrderItemsList = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  max-height: 180px;
  overflow-y: auto;
`;

export const OrderItemsTitle = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.06em;
  padding: 8px 10px;
  text-transform: uppercase;
`;

export const OrderItemRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  align-items: center;
  padding: 9px 10px;
  border-top: 1px solid #f1f5f9;
  font-size: 11px;
  font-weight: 800;
  color: #334155;

  span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  strong {
    color: #0f172a;
    font-size: 11px;
    white-space: nowrap;
  }
`;

export const OrderItemsEmpty = styled.div`
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
  padding: 12px;
  text-align: center;
`;

export const ActionButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: ${props => props.$tone === 'green' ? '#15803d' : props.$tone === 'blue' ? '#0369a1' : '#ea580c'};
  background: ${props => props.$tone === 'green' ? '#f0fdf4' : props.$tone === 'blue' ? '#f0f9ff' : '#fff7ed'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$tone === 'green' ? '#dcfce7' : props.$tone === 'blue' ? '#e0f2fe' : '#ffedd5'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const EmptyState = styled.div`
  background: white;
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #64748b;
  gap: 10px;

  svg {
    color: #cbd5e1;
    font-size: 36px;
  }

  strong {
    color: #334155;
    font-size: 16px;
  }
`;

export const Toast = styled.div`
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 99999;
  background: ${props => props.$type === 'error' ? '#ef4444' : '#0f172a'};
  color: white;
  padding: 12px 18px;
  border-radius: 16px;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.25);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 800;

  @media (max-width: 520px) {
    width: calc(100% - 32px);
    justify-content: center;
    text-align: center;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: max(16px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) max(16px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));

  @media (max-width: 600px) {
    align-items: flex-end;
    padding: 0;
  }
`;

export const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #0f172a;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
  }

  p {
    color: #334155;
  }

  textarea {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-family: inherit;
    font-size: 13px;
    resize: none;
    box-sizing: border-box;
    color: #0f172a;
    background-color: #ffffff;

    &:focus {
      outline: none;
      border-color: #3b82f6;
    }
  }
`;

export const ActionBtn = styled.button`
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 800;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-family: 'Outfit', sans-serif;
  border: none;
  outline: none;

  background: ${props => {
    if (props.$variant === 'success') return 'linear-gradient(135deg, #10b981, #059669)';
    if (props.$variant === 'danger') return 'linear-gradient(135deg, #ef4444, #dc2626)';
    if (props.$variant === 'warning') return 'linear-gradient(135deg, #f59e0b, #d97706)';
    if (props.$variant === 'info') return 'linear-gradient(135deg, #06b6d4, #0891b2)';
    return '#ffffff';
  }};

  color: ${props => {
    if (props.$variant && props.$variant !== 'secondary') return '#ffffff';
    return '#334155';
  }};

  border: ${props => {
    if (props.$variant && props.$variant !== 'secondary') return 'none';
    return '1px solid #e2e8f0';
  }};

  box-shadow: ${props => {
    if (props.$variant === 'success') return '0 2px 8px rgba(16, 185, 129, 0.15)';
    if (props.$variant === 'danger') return '0 2px 8px rgba(239, 68, 68, 0.15)';
    if (props.$variant === 'warning') return '0 2px 8px rgba(245, 158, 11, 0.15)';
    if (props.$variant === 'info') return '0 2px 8px rgba(6, 182, 212, 0.15)';
    return '0 1px 3px rgba(15, 23, 42, 0.02)';
  }};

  &:hover {
    transform: translateY(-1.5px);
    background: ${props => {
      if (props.$variant === 'success') return 'linear-gradient(135deg, #059669, #047857)';
      if (props.$variant === 'danger') return 'linear-gradient(135deg, #dc2626, #b91c1c)';
      if (props.$variant === 'warning') return 'linear-gradient(135deg, #d97706, #b45309)';
      if (props.$variant === 'info') return 'linear-gradient(135deg, #0891b2, #0369a1)';
      return '#f8fafc';
    }};
    border-color: ${props => {
      if (props.$variant && props.$variant !== 'secondary') return 'none';
      return '#cbd5e1';
    }};
    box-shadow: ${props => {
      if (props.$variant === 'success') return '0 4px 12px rgba(16, 185, 129, 0.25)';
      if (props.$variant === 'danger') return '0 4px 12px rgba(239, 68, 68, 0.25)';
      if (props.$variant === 'warning') return '0 4px 12px rgba(245, 158, 11, 0.25)';
      if (props.$variant === 'info') return '0 4px 12px rgba(6, 182, 212, 0.25)';
      return '0 2px 6px rgba(15, 23, 42, 0.05)';
    }};
  }

  &:active {
    transform: scale(0.96) translateY(0);
    box-shadow: ${props => {
      if (props.$variant === 'success') return '0 2px 8px rgba(16, 185, 129, 0.2)';
      if (props.$variant === 'danger') return '0 2px 8px rgba(239, 68, 68, 0.2)';
      if (props.$variant === 'warning') return '0 2px 8px rgba(245, 158, 11, 0.2)';
      if (props.$variant === 'info') return '0 2px 8px rgba(6, 182, 212, 0.2)';
      return '0 1px 3px rgba(15, 23, 42, 0.05)';
    }};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;
