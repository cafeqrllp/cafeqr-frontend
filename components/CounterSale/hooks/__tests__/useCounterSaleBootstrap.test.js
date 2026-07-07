import { renderHook, act } from '@testing-library/react';
import useCounterSaleBootstrap, { resetBootstrapCaches } from '../useCounterSaleBootstrap';
import { fetchProducts, fetchConfigurations, fetchPricelists, fetchCustomers, fetchCreditCustomers } from '../../services/counterSaleApi';

// Mock the API methods
jest.mock('../../services/counterSaleApi', () => ({
  fetchProducts: jest.fn(),
  fetchConfigurations: jest.fn(),
  fetchPricelists: jest.fn(),
  fetchCustomers: jest.fn(),
  fetchCreditCustomers: jest.fn()
}));

describe('useCounterSaleBootstrap Hook - Scalability & SWR', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetBootstrapCaches();
    
    fetchProducts.mockResolvedValue([{ id: 'p1', name: 'Product A' }]);
    fetchConfigurations.mockResolvedValue({ id: 'conf1', taxRate: 10 });
    fetchPricelists.mockResolvedValue([{ id: 'price1', name: 'Standard List', isDefault: true }]);
    fetchCustomers.mockResolvedValue([{ id: 'c1', name: 'John Doe' }]);
    fetchCreditCustomers.mockResolvedValue([{ id: 'cc1', name: 'Jane Credit' }]);
  });

  test('resolves config immediately from cache and runs SWR revalidation in background', async () => {
    // 1st Boot (populates the cache for org-1)
    const { result: firstResult, unmount: firstUnmount } = renderHook(() =>
      useCounterSaleBootstrap({ orgId: 'org-1' })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(firstResult.current.config).toEqual({ id: 'conf1', taxRate: 10 });
    firstUnmount();

    // 2nd Boot: Return different value on revalidation
    fetchConfigurations.mockResolvedValueOnce({ id: 'conf1', taxRate: 15 });

    const { result: secondResult } = renderHook(() =>
      useCounterSaleBootstrap({ orgId: 'org-1' })
    );

    // Assert cache hit is immediate (SWR)
    expect(secondResult.current.config).toEqual({ id: 'conf1', taxRate: 10 });

    // Wait for SWR background refresh to update React state
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(secondResult.current.config).toEqual({ id: 'conf1', taxRate: 15 });
  });

  test('isolates session caches by orgId (multi-tenant correctness)', async () => {
    // Populates cache for org-1
    const { result: firstResult, unmount: firstUnmount } = renderHook(() =>
      useCounterSaleBootstrap({ orgId: 'org-1' })
    );
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(firstResult.current.config).toEqual({ id: 'conf1', taxRate: 10 });
    firstUnmount();

    // Boot hook with a completely different organization (org-2)
    fetchConfigurations.mockResolvedValueOnce({ id: 'conf-org2', taxRate: 20 });
    const { result: secondResult } = renderHook(() =>
      useCounterSaleBootstrap({ orgId: 'org-2' })
    );

    // Should NOT read from org-1 cache; should start as null until resolved
    expect(secondResult.current.config).toBeNull();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(secondResult.current.config).toEqual({ id: 'conf-org2', taxRate: 20 });
  });

  test('clears previous organization state synchronously upon switching orgId', async () => {
    let resolveProductsOrg1, resolveProductsOrg2;
    const productsPromiseOrg1 = new Promise((resolve) => { resolveProductsOrg1 = resolve; });
    const productsPromiseOrg2 = new Promise((resolve) => { resolveProductsOrg2 = resolve; });

    fetchProducts
      .mockReturnValueOnce(productsPromiseOrg1)
      .mockReturnValueOnce(productsPromiseOrg2);

    const { result, rerender } = renderHook(
      ({ orgId }) => useCounterSaleBootstrap({ orgId }),
      { initialProps: { orgId: 'org-1' } }
    );

    // Resolve core load for org-1
    await act(async () => {
      resolveProductsOrg1([{ id: 'p1', name: 'Product A' }]);
      await productsPromiseOrg1;
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].name).toBe('Product A');

    // Switch orgId prop to org-2
    act(() => {
      rerender({ orgId: 'org-2' });
    });

    // Verify tenant-owned state was cleared synchronously to guarantee isolation
    expect(result.current.products).toEqual([]);
    expect(result.current.allCustomers).toEqual([]);

    // Clean up org-2 promise to avoid unhandled state updates later
    await act(async () => {
      resolveProductsOrg2([{ id: 'p2', name: 'Product B' }]);
      await productsPromiseOrg2;
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  });

  test('non-blocking metadata allows POS to render ready before customers resolve', async () => {
    let resolveCustomers;
    const customerPromise = new Promise((resolve) => {
      resolveCustomers = resolve;
    });
    fetchCustomers.mockReturnValue(customerPromise);

    const { result } = renderHook(() =>
      useCounterSaleBootstrap({ orgId: 'org-1' })
    );

    // Wait for core promises (Products, Config, Pricelists) to finish
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // POS loading state must stop immediately when core dependencies resolve
    expect(result.current.loading).toBe(false);
    expect(result.current.products).toHaveLength(1);
    
    // Customers list remains empty/unresolved initially
    expect(result.current.allCustomers).toEqual([]);

    // Resolve optional customers in the background afterwards
    await act(async () => {
      resolveCustomers([{ id: 'c-delayed', name: 'Delayed Customer' }]);
      await customerPromise;
    });

    // Customers update passively
    expect(result.current.allCustomers).toEqual([{ id: 'c-delayed', name: 'Delayed Customer' }]);
  });

  test('survives optional metadata request failures and logs warnings', async () => {
    fetchCustomers.mockRejectedValueOnce(new Error('Network error loading customers'));

    const { result } = renderHook(() => useCounterSaleBootstrap({ orgId: 'org-1' }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Core product loading succeeds
    expect(result.current.loading).toBe(false);
    expect(result.current.loadError).toBe('');
    expect(result.current.products).toHaveLength(1);

    // Optional customers fails, but hook continues and logs warning
    expect(result.current.allCustomers).toEqual([]);
    expect(result.current.metadataWarnings).toContain('Customers list could not be retrieved from the server.');
  });
});
