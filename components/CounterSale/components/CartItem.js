import React, { useState, useRef } from 'react';
import { FaMinus, FaPlus, FaEdit, FaStickyNote, FaTimes } from 'react-icons/fa';
import * as S from '../CounterSale.styles';

export default function CartItem({
  item,
  cartKeyFor,
  sym,
  currencyDecimalPlaces,
  theme,
  updateQty,
  discountsEnabled,
  handleEditProductFromCart,
  setItemDescription
}) {
  const key = cartKeyFor(item);
  const [noteOpen, setNoteOpen] = useState(false);
  const [localNote, setLocalNote] = useState(item.description || '');
  const textareaRef = useRef(null);

  const hasNote = Boolean(item.description && item.description.trim());

  const handleNoteToggle = (e) => {
    e.stopPropagation();
    if (!noteOpen) {
      setLocalNote(item.description || '');
      setNoteOpen(true);
      setTimeout(() => textareaRef.current?.focus(), 50);
    } else {
      // commit on close
      const trimmed = localNote.trim();
      setItemDescription?.(key, trimmed || null);
      setNoteOpen(false);
    }
  };

  const handleNoteSave = () => {
    const trimmed = localNote.trim();
    setItemDescription?.(key, trimmed || null);
    setNoteOpen(false);
  };

  const handleNoteClear = (e) => {
    e.stopPropagation();
    setLocalNote('');
    setItemDescription?.(key, null);
    setNoteOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNoteSave();
    }
    if (e.key === 'Escape') {
      setNoteOpen(false);
    }
    e.stopPropagation();
  };

  return (
    <S.CsCartItemCard>
      {/* Row 1: Name + edit + qty controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '11.5px', color: '#1e293b', lineHeight: '1.25', wordBreak: 'break-word', minWidth: 0, flex: 1 }}>
            {item.displayName || item.name}
          </div>
          {/* Edit product button */}
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

      {/* Row 2: Price + total + note button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '1px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
          <div style={{ color: '#64748b', fontWeight: 600, fontSize: '10.5px' }}>
            {sym}{Number(item.price || 0).toFixed(currencyDecimalPlaces)} each
            {discountsEnabled && ((item.discount_percent > 0) || (item.discount_amount > 0)) && (
              <span style={{ color: '#dc2626', fontWeight: 700, marginLeft: '6px', fontSize: '9.5px', whiteSpace: 'nowrap' }}>
                (-{item.discount_percent > 0 ? `${item.discount_percent}%` : `${sym}${Number(item.discount_amount || 0).toFixed(currencyDecimalPlaces)}`})
              </span>
            )}
          </div>
          {/* Kitchen note toggle button */}
          <S.CsLineNoteBtn
            type="button"
            $hasNote={hasNote}
            onClick={handleNoteToggle}
            title={hasNote ? `Note: ${item.description}` : 'Add kitchen note'}
          >
            <FaStickyNote size={8} />
            {hasNote && !noteOpen ? 'Note' : noteOpen ? 'Save' : 'Note'}
          </S.CsLineNoteBtn>
          {/* Clear note button when there's a note */}
          {hasNote && !noteOpen && (
            <button
              type="button"
              onClick={handleNoteClear}
              style={{
                border: 'none', background: 'transparent', color: '#94a3b8',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
                padding: '1px', borderRadius: '3px', fontSize: '8px', flexShrink: 0
              }}
              title="Remove note"
            >
              <FaTimes size={7} />
            </button>
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

      {/* Row 3: Existing note preview (when closed) */}
      {hasNote && !noteOpen && (
        <div style={{
          marginTop: '4px',
          padding: '3px 7px',
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: '5px',
          fontSize: '9.5px',
          color: '#9a3412',
          fontWeight: 600,
          lineHeight: '1.35',
          wordBreak: 'break-word'
        }}>
          🗒 {item.description}
        </div>
      )}

      {/* Row 4: Inline note textarea (when open) */}
      {noteOpen && (
        <S.CsLineNoteInput
          ref={textareaRef}
          $themeColor={theme.main}
          value={localNote}
          onChange={e => setLocalNote(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleNoteSave}
          placeholder="e.g. Less spicy, no onions…"
          maxLength={200}
          rows={2}
          onClick={e => e.stopPropagation()}
        />
      )}
    </S.CsCartItemCard>
  );
}
