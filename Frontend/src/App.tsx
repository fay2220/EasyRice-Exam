import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<div className="p-8 text-center text-xl font-sans mt-10">Form Page Placeholder (To Be Implemented)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
