export interface PricingGroupLike {
  name?: string;
  is_featured?: boolean;
}

export interface PricingItemLike {
  product_id?: string;
  group?: string;
}

export function getInitialPricingGroup(
  items: PricingItemLike[] | undefined,
  groups: PricingGroupLike[] | undefined,
  currentProductId?: string
) {
  const currentItem = items?.find((item) => item.product_id === currentProductId);
  const featuredGroup = groups?.find((group) => group.is_featured);
  const fallbackGroup =
    groups?.length === 2 ? groups[1].name : groups?.[0]?.name;

  return currentItem?.group || featuredGroup?.name || fallbackGroup || '';
}

export function isCurrentPlanProduct(
  currentProductId: string | undefined,
  productId: string | undefined
) {
  return Boolean(currentProductId && productId && currentProductId === productId);
}