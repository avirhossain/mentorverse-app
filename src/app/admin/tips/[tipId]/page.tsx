
import { use } from 'react';
import { TipDetailsClient } from '@/components/admin/TipDetails';

// This is a Server Component. Its only job is to get the `tipId` from the URL.
export default function TipDetailsPage({
  params,
}: {
  params: Promise<{ tipId: string }>;
}) {
  // `use` unwraps the promise and gets the resolved params on the server.
  const { tipId } = use(params);

  // Pass the simple string prop to the Client Component.
  return <TipDetailsClient tipId={tipId} />;
}
