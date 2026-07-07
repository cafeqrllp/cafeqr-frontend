import { useState, useEffect, useMemo, useCallback } from 'react';
import { PRODUCT_PAGE_SIZE } from '../domain/counterSale.constants';
import { filterAndSearchProducts, getStandardMatches } from '../domain/products';

export default function useProductCatalog({ products, trendingProductIds, config }) {
  const [activeCat, setActiveCat] = useState('ALL');
  const [dietFilter, setDietFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [productPage, setProductPage] = useState(0);
  const [productListingOn, setProductListingOn] = useState(true);

  // Read saved toggle setting from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pos_product_listing_enabled');
      if (stored !== null) {
        setProductListingOn(JSON.parse(stored));
      } else if (config) {
        setProductListingOn(config.posProductListingEnabled !== false);
      }
    }
  }, [config]);

  const handleToggleProductListing = useCallback((enabled) => {
    setProductListingOn(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pos_product_listing_enabled', JSON.stringify(enabled));
    }
  }, []);

  // Filter visible products
  const visibleProducts = useMemo(() => {
    return filterAndSearchProducts({
      products,
      activeCat,
      dietFilter,
      search,
      trendingProductIds
    });
  }, [products, activeCat, dietFilter, search, trendingProductIds]);

  // Paginated visible products slice
  const paginatedProducts = useMemo(() => {
    const start = productPage * PRODUCT_PAGE_SIZE;
    return visibleProducts.slice(start, start + PRODUCT_PAGE_SIZE);
  }, [visibleProducts, productPage]);

  // Reset page index on filter updates
  useEffect(() => {
    setProductPage(0);
  }, [activeCat, dietFilter, search]);

  // Standard matches for autocomplete search box
  const standardMatches = useMemo(() => {
    return getStandardMatches(products, search);
  }, [products, search]);

  const addFromStandardSearch = useCallback(async (product, addToCart, searchRef) => {
    if (typeof addToCart === 'function') {
      await addToCart(product);
    }
    setSearch('');
    if (searchRef && searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  return {
    activeCat,
    setActiveCat,
    dietFilter,
    setDietFilter,
    search,
    setSearch,
    productPage,
    setProductPage,
    productListingOn,
    setProductListingOn,
    handleToggleProductListing,
    visibleProducts,
    paginatedProducts,
    standardMatches,
    addFromStandardSearch,
    PRODUCT_PAGE_SIZE
  };
}
