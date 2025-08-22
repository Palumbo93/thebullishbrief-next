import { LegalPage } from '../../page-components/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export default function AboutPage() {
  const doc = getLegalDocument('about');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
