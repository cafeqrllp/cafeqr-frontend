import React from 'react';

export default function CreditCustomerToolbar({ search, onSearchChange, onSearchClear }) {
  return (
    <div className="toolbar">
      <div className="search-wrapper">
        <input 
          className="search-input"
          value={search} 
          onChange={(event) => onSearchChange(event.target.value)} 
          placeholder="Search by name or phone..." 
        />
        {search && (
          <button className="search-clear" onClick={onSearchClear}>&times;</button>
        )}
      </div>
    </div>
  );
}
