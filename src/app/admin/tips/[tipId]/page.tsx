'use client';

import { use } from 'react';
import { TipDetailsClient } from '@/components/admin/TipDetails';

// This is a Server Component. Its only job is to get the `tipId` from the URL.
export default function TipDetailsPage({
  params,
}: {
  params: { tipId: string };
}) {
  return <TipDetailsClient tipId={params.tipId} />;
}
