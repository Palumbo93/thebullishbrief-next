import { LegalPage } from '../../pages/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export default function Terms() {
  const doc = getLegalDocument('terms');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
