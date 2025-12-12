'use client';

import { use } from 'react';
import { EditTipClient } from '@/components/admin/EditTipClient';

// This is a Server Component. Its only job is to get the `tipId` from the URL.
export default function EditTipPage({
  params,
}: {
  params: { tipId: string };
}) {
  return <EditTipClient tipId={params.tipId} />;
}
