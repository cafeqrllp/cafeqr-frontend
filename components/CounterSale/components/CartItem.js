import React from 'react';
import { FaMinus, FaPlus, FaEdit } from 'react-icons/fa';
import * as S from '../CounterSale.styles';

export default function CartItem({
  item,
  cartKeyFor,
  sym,
  currencyDecimalPlaces,
  theme,
  updateQty,
  discountsEnabled,
  handleEditProductFromCart
}) {
  const key = cartKeyFor(item);
  return (
    <S.CsCartItemCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '11.5px', color: '#1e293b', lineHeight: '1.25', wordBreak: 'break-word', minWidth: 0, flex: 1 }}>
            {item.displayName || item.name}
          </div>
          <button 
            type="button" 
            onClick={() => handleEditProductFromCart(item)}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#64748b',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              borderRadius: '4px',
              transition: 'all 0.15s',
              flexShrink: 0
            }}
            title="Edit Product"
          >
            <FaEdit size={10} />
          </button>
        </div>
        <S.CsQtyGroup>
          <S.CsQtyBtn onClick={() => updateQty(key, -1)}><FaMinus/></S.CsQtyBtn>
          <div style={{ fontWeight: 800, minWidth: '14px', textAlign: 'center', fontSize: '10.5px', color: '#0f172a' }}>{item.qty}</div>
          <S.CsQtyBtn onClick={() => updateQty(key, 1)}><FaPlus/></S.CsQtyBtn>
        </S.CsQtyGroup>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '1px' }}>
        <div style={{ color: '#64748b', fontWeight: 600, fontSize: '10.5px' }}>
          {sym}{Number(item.price || 0).toFixed(currencyDecimalPlaces)} each
          {discountsEnabled && ((item.discount_percent > 0) || (item.discount_amount > 0)) && (
            <span style={{ color: '#dc2626', fontWeight: 700, marginLeft: '6px', fontSize: '9.5px', whiteSpace: 'nowrap' }}>
              (-{item.discount_percent > 0 ? `${item.discount_percent}%` : `${sym}${Number(item.discount_amount || 0).toFixed(currencyDecimalPlaces)}`})
            </span>
          )}
        </div>
        <div style={{ color: theme.main, fontWeight: 800, fontSize: '12px', textAlign: 'right' }}>
          {(() => {
            const gross = Number(item.price || 0) * Number(item.qty || 0);
            let disc = 0;
            if (item.discount_percent > 0) {
              disc = gross * (Number(item.discount_percent) / 100);
            } else if (item.discount_amount > 0) {
              disc = Number(item.discount_amount);
            }
            return sym + Math.max(0, gross - disc).toFixed(currencyDecimalPlaces);
          })()}
        </div>
      </div>
    </S.CsCartItemCard>
  );
}
