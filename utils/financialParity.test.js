import { calculateOrderTotals } from './orderCalculations';
import scenarios from './financial_parity_scenarios.json';

describe('Financial Engine — Cross-Language Parity Test Suite (JavaScript Runner)', () => {
  scenarios.forEach((tc) => {
    test(`${tc.id}: ${tc.description}`, () => {
      if (tc.expectsError) {
        expect(() => {
          calculateOrderTotals(tc.items, tc.orderDiscount, tc.profile);
        }).toThrow();
      } else {
        const res = calculateOrderTotals(tc.items, tc.orderDiscount, tc.profile);

        // Global asserts
        expect(res.gross_amount).toBeCloseTo(tc.expected.gross_amount, 2);
        expect(res.taxable_amount).toBeCloseTo(tc.expected.taxable_amount, 2);
        expect(res.total_tax).toBeCloseTo(tc.expected.total_tax, 2);
        expect(res.grand_total).toBeCloseTo(tc.expected.grand_total, 2);
        expect(res.round_off_amount).toBeCloseTo(tc.expected.round_off_amount, 2);
        if (tc.expected.order_discount_percent !== undefined) {
          expect(res.order_discount_percent).toBeCloseTo(tc.expected.order_discount_percent, 4);
        }

        // Line item asserts
        tc.expected.items.forEach((expectedLine, idx) => {
          const actualLine = res.processed_items[idx];
          expect(actualLine).toBeDefined();
          expect(actualLine.line_total).toBeCloseTo(expectedLine.line_total, 2);
          expect(actualLine.taxable_amount).toBeCloseTo(expectedLine.taxable_amount, 2);
          expect(actualLine.tax_amount).toBeCloseTo(expectedLine.tax_amount, 2);
        });
      }
    });
  });
});
