import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Form from './pages/Form';
import Result from './pages/Result';
import Edit from './pages/Edit';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<Form />} />
        <Route path="/result/:id" element={<Result />} />
        <Route path="/edit/:id" element={<Edit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
