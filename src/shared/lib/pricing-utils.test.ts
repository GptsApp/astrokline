import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getInitialPricingGroup,
  isCurrentPlanProduct,
} from '@/themes/default/blocks/pricing-utils';

test('getInitialPricingGroup prefers the subscribed product group', () => {
  assert.equal(
    getInitialPricingGroup(
      [
        { product_id: 'standard-monthly', group: 'monthly' },
        { product_id: 'standard-yearly', group: 'yearly' },
      ],
      [
        { name: 'monthly' },
        { name: 'yearly', is_featured: true },
      ],
      'standard-monthly'
    ),
    'monthly'
  );
});

test('isCurrentPlanProduct matches the active subscription product id', () => {
  assert.equal(isCurrentPlanProduct('premium-monthly', 'premium-monthly'), true);
  assert.equal(isCurrentPlanProduct('premium-monthly', 'premium-yearly'), false);
});