import { LegalPage } from '../../page-components/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export default function DisclaimerPage() {
  const doc = getLegalDocument('disclaimer');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
