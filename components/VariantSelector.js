import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FaCheckCircle, FaTimes, FaUtensils } from 'react-icons/fa';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(10px);
`;

const Card = styled.div`
  width: min(620px, 100%);
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;

  h2 {
    margin: 0;
    color: #0f172a;
    font-size: 24px;
    font-weight: 900;
  }

  span {
    display: inline-flex;
    margin-top: 8px;
    padding: 6px 10px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #64748b;
    font-size: 12px;
    font-weight: 900;
  }
`;

const CloseButton = styled.button`
  border: 0;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 20px;
`;

const OptionList = styled.div`
  padding: 22px 28px;
  overflow-y: auto;
  display: grid;
  gap: 12px;
`;

const OptionButton = styled.button`
  border: 2px solid ${props => props.$active ? '#f97316' : '#e2e8f0'};
  background: ${props => props.$active ? '#fff7ed' : 'white'};
  border-radius: 18px;
  padding: 18px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  cursor: pointer;
  text-align: left;

  strong {
    color: #0f172a;
    font-size: 17px;
    font-weight: 900;
  }

  span {
    display: block;
    margin-top: 6px;
    color: #334155;
    font-size: 14px;
    font-weight: 800;
  }
`;

const Footer = styled.div`
  padding: 18px 28px 24px;
  border-top: 1px solid #e2e8f0;
`;

const AddButton = styled.button`
  width: 100%;
  border: 0;
  border-radius: 18px;
  background: #f97316;
  color: white;
  min-height: 56px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 900;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const Empty = styled.div`
  padding: 40px;
  text-align: center;
  color: #64748b;
  font-weight: 800;
`;

function buildVariantOptions(product) {
  const basePrice = Number(product?.price || 0);
  const pricings = Array.isArray(product?.variantPricings) ? product.variantPricings : [];
  if (pricings.length) {
    return pricings
      .filter((pricing) => pricing?.isAvailable !== false && pricing?.variantOption)
      .map((pricing) => {
        const option = pricing.variantOption;
        const price = pricing.overridePrice != null
          ? Number(pricing.overridePrice)
          : basePrice + Number(option.additionalPrice || 0);
        return {
          id: option.id,
          label: option.name,
          price,
          groupId: option.groupId,
        };
      });
  }

  const mappings = Array.isArray(product?.variantMappings) ? product.variantMappings : [];
  return mappings.flatMap((mapping) => {
    const options = mapping?.variantGroup?.options || [];
    return options.map((option) => ({
      id: option.id,
      label: option.name,
      price: basePrice + Number(option.additionalPrice || 0),
      groupId: option.groupId,
    }));
  });
}

export default function VariantSelector({ product, onClose, onSelect }) {
  const [selectedId, setSelectedId] = useState('');
  const options = useMemo(() => buildVariantOptions(product), [product]);
  const selected = options.find((option) => String(option.id) === String(selectedId));

  if (!product) return null;

  return (
    <Overlay onMouseDown={onClose}>
      <Card onMouseDown={(event) => event.stopPropagation()}>
        <Header>
          <div>
            <h2><FaUtensils /> {product.name}</h2>
            <span>{product.category?.name || product.categoryName || 'Menu Item'}</span>
          </div>
          <CloseButton type="button" onClick={onClose} aria-label="Close variant selector">
            <FaTimes />
          </CloseButton>
        </Header>

        {options.length ? (
          <OptionList>
            {options.map((option) => (
              <OptionButton
                key={option.id}
                type="button"
                $active={String(selectedId) === String(option.id)}
                onClick={() => setSelectedId(option.id)}
              >
                <div>
                  <strong>{option.label}</strong>
                  <span>₹{Number(option.price || 0).toFixed(2)}</span>
                </div>
                {String(selectedId) === String(option.id) && <FaCheckCircle color="#f97316" />}
              </OptionButton>
            ))}
          </OptionList>
        ) : (
          <Empty>No options are configured for this item.</Empty>
        )}

        <Footer>
          <AddButton
            type="button"
            disabled={!selected}
            onClick={() => selected && onSelect?.(selected)}
          >
            Add To Cart
          </AddButton>
        </Footer>
      </Card>
    </Overlay>
  );
}
