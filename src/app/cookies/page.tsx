import { LegalPage } from '../../page-components/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export default function CookiesPage() {
  const doc = getLegalDocument('cookies');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
