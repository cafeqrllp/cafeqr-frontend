import React, { useState, useRef } from 'react';
import { FaMinus, FaPlus, FaEdit, FaStickyNote, FaTimes } from 'react-icons/fa';
import * as S from '../CounterSale.styles';

const NOTE_PRESETS = [
  'No Spicy',
  'Medium Spicy',
  'Spicy',
  'No Onion',
  'No Garlic',
  'Sugar Free',
  'No Ice',
  'Parcel'
];

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
  const [customNote, setCustomNote] = useState('');
  const inputRef = useRef(null);

  const currentNotesStr = item.description || '';
  const hasNote = Boolean(currentNotesStr.trim());

  // Clean split of current notes
  const getNoteParts = () => {
    return currentNotesStr.split(',').map(p => p.trim()).filter(Boolean);
  };

  const handleNoteToggle = (e) => {
    e.stopPropagation();
    if (!noteOpen) {
      // Open option tool
      // Extract custom note (anything not in presets)
      const parts = getNoteParts();
      const presetsLower = NOTE_PRESETS.map(p => p.toLowerCase());
      const customParts = parts.filter(p => !presetsLower.includes(p.toLowerCase()));
      setCustomNote(customParts.join(', '));
      setNoteOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setNoteOpen(false);
    }
  };

  const togglePreset = (preset) => {
    const parts = getNoteParts();
    const index = parts.findIndex(p => p.toLowerCase() === preset.toLowerCase());
    
    let newParts;
    if (index > -1) {
      newParts = parts.filter((_, i) => i !== index);
    } else {
      newParts = [...parts, preset];
    }
    
    const newNote = newParts.join(', ');
    setItemDescription?.(key, newNote || null);
  };

  const handleCustomNoteChange = (e) => {
    const val = e.target.value;
    setCustomNote(val);
    
    // Merge current preset active items with the new custom value
    const parts = getNoteParts();
    const presetsLower = NOTE_PRESETS.map(p => p.toLowerCase());
    // Keep only preset parts in the active list
    const activePresets = parts.filter(p => presetsLower.includes(p.toLowerCase()));
    
    // Add custom note if present
    const newParts = [...activePresets];
    if (val.trim()) {
      newParts.push(val.trim());
    }
    
    setItemDescription?.(key, newParts.join(', ') || null);
  };

  const handleNoteClear = (e) => {
    e.stopPropagation();
    setCustomNote('');
    setItemDescription?.(key, null);
    setNoteOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setNoteOpen(false);
    }
    if (e.key === 'Escape') {
      setNoteOpen(false);
    }
    e.stopPropagation();
  };

  const isPresetActive = (preset) => {
    return getNoteParts().some(p => p.toLowerCase() === preset.toLowerCase());
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
            title={hasNote ? `Note: ${currentNotesStr}` : 'Add kitchen note'}
          >
            <FaStickyNote size={8} />
            {noteOpen ? 'Done' : 'Note'}
          </S.CsLineNoteBtn>
          {/* Clear note button when there's a note */}
          {hasNote && (
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

      {/* Row 3: Note preview (closed) */}
      {hasNote && !noteOpen && (
        <div style={{
          marginTop: '4px',
          padding: '4px 8px',
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: '6px',
          fontSize: '10px',
          color: '#c2410c',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          lineHeight: '1.3'
        }}>
          <FaStickyNote size={8} style={{ color: '#ea580c', flexShrink: 0 }} />
          <span style={{ wordBreak: 'break-word' }}>{currentNotesStr}</span>
        </div>
      )}

      {/* Row 4: Note Option Tool (open) */}
      {noteOpen && (
        <div 
          onClick={e => e.stopPropagation()}
          style={{
            marginTop: '6px',
            padding: '8px',
            background: '#fffaf5',
            border: '1px solid #fed7aa',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {/* Note Option Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {NOTE_PRESETS.map((preset) => {
              const active = isPresetActive(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => togglePreset(preset)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '999px',
                    fontSize: '9px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    border: '1px solid',
                    borderColor: active ? theme.main : '#cbd5e1',
                    background: active ? theme.main : 'white',
                    color: active ? 'white' : '#475569'
                  }}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          {/* Custom Note input */}
          <input
            ref={inputRef}
            type="text"
            value={customNote}
            onChange={handleCustomNoteChange}
            onKeyDown={handleKeyDown}
            placeholder="Other custom note..."
            maxLength={100}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '5px 8px',
              border: '1px solid #cbd5e1',
              borderRadius: '5px',
              fontSize: '10px',
              fontWeight: 600,
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>
      )}
    </S.CsCartItemCard>
  );
}
