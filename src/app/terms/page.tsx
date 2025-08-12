import { LegalPage } from '../../page-components/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export default function TermsPage() {
  const doc = getLegalDocument('terms');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
