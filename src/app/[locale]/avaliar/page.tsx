import TouristLayout from '@/components/tourist/TouristLayout';
import EvaluationPage from '@/components/tourist/EvaluationPage';

export const metadata = {
  title: 'Avaliar Destino',
};

export default function AvaliarPage() {
  return (
    <TouristLayout>
      <EvaluationPage />
    </TouristLayout>
  );
}
