import type { ReactNode } from 'react';
import { hasFeature, type Feature } from '../lib/entitlements';

/**
 * Marks content that could become a paid feature. While the feature is available (today: always),
 * it renders its children unchanged, with no wrapper element, badge, lock or label.
 * See src/lib/entitlements.ts for why this is a marker and not real gating.
 */
export function PremiumSlot({ feature, children, fallback = null }: { feature: Feature; children: ReactNode; fallback?: ReactNode }) {
  return <>{hasFeature(feature) ? children : fallback}</>;
}
