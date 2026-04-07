import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import TermsOfUsePage from './components/TermsOfUsePage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home key="home" />} />
        <Route path="/catalog/:category/:magazineId" element={<Home key="modal" />} />
        <Route path="/terms" element={<TermsOfUsePage />} />
      </Routes>
    </Layout>
  );
}

export default App;
