import TouristLayout from '@/components/tourist/TouristLayout';
import DestinationDetailPage from '@/components/tourist/DestinationDetailPage';
import { destinosInfo } from '@/data/mockData';
import { slugify } from '@/lib/utils';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return destinosInfo.map((dest) => ({
    id: slugify(dest.nome),
  }));
}

export default async function DestinoRoute({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
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
