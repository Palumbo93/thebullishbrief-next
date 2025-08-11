import { LegalPage } from '../../pages/LegalPage';
import { Layout } from '../../components/Layout';
import { getLegalDocument } from '../../data/legal';

export default function Disclaimer() {
  const doc = getLegalDocument('disclaimer');
  
  return (
    <Layout>
      <LegalPage doc={doc} />
    </Layout>
  );
}
