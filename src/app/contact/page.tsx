import { LegalPage } from '../../page-components/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export default function ContactPage() {
  const doc = getLegalDocument('contact');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
