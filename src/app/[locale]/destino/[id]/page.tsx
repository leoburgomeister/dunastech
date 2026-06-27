'use client';

import { use } from 'react';
import TouristLayout from '@/components/tourist/TouristLayout';
import DestinationDetailPage from '@/components/tourist/DestinationDetailPage';
import { destinosInfo } from '@/data/mockData';
import { slugify } from '@/lib/utils';
import { notFound } from 'next/navigation';

export default function DestinoRoute({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const destination = destinosInfo.find(
    (d) => slugify(d.nome) === resolvedParams.id
  );

  if (!destination) {
    notFound();
  }

  return (
    <TouristLayout>
      <DestinationDetailPage destination={destination} />
    </TouristLayout>
  );
}
