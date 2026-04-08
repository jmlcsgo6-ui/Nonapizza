import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { CartProvider } from './context/CartContext';
import { BuilderProvider } from './context/BuilderContext';
import './index.css';

function App() {
  return (
    <CartProvider>
      <BuilderProvider>
        <Router>
          <div className="app-container">
            <Routes>
              <Route path="/admin/*" element={<Admin />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </div>
        </Router>
      </BuilderProvider>
    </CartProvider>
  );
}

export default App;
