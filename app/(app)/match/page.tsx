import type { Metadata } from 'next';
import { MatchView } from '@/components/match/MatchView';

export const metadata: Metadata = { title: 'Match' };

export default function MatchPage() {
  return <MatchView />;
}
