import { LegalPage } from '../../page-components/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export default function PrivacyPage() {
  const doc = getLegalDocument('privacy');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
