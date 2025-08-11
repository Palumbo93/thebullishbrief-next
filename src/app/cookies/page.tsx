import { LegalPage } from '../../pages/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export default function Cookies() {
  const doc = getLegalDocument('cookies');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
