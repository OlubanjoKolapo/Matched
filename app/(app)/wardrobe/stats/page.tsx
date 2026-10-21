import type { Metadata } from 'next';
import { StatsView } from '@/components/wardrobe/StatsView';

export const metadata: Metadata = { title: 'Wardrobe stats' };

export default function StatsPage() {
  return <StatsView />;
}
