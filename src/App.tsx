import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import TermsOfUsePage from './components/TermsOfUsePage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog/:category/:magazineId" element={<Home />} />
        <Route path="/terms" element={<TermsOfUsePage />} />
      </Routes>
    </Layout>
  );
}

export default App;
