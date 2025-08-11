import { LegalPage } from '../../pages/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export default function Privacy() {
  const doc = getLegalDocument('privacy');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
