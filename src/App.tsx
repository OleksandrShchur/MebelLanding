import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import TermsOfUsePage from './components/TermsOfUsePage';

const homeElement = <Home />;

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={homeElement} />
        <Route path="/catalog/:category/:magazineId" element={homeElement} />
        <Route path="/terms" element={<TermsOfUsePage />} />
      </Routes>
    </Layout>
  );
}

export default App;
