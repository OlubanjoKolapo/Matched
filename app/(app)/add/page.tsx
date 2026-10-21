import type { Metadata } from 'next';
import { AddFlow } from '@/components/add/AddFlow';

export const metadata: Metadata = { title: 'Add a piece' };

export default function AddPage() {
  return <AddFlow />;
}
