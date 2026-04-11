import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { BuilderProvider } from "./context/BuilderContext";
import Home from "./pages/Home";
import TrackOrder from "./pages/TrackOrder";
import CustomerAuth from "./pages/CustomerAuth";
import NotFound from "./pages/NotFound";
import "./nona.css";

const App = () => (
  <CartProvider>
    <BuilderProvider>
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/meu-pedido" element={<TrackOrder />} />
            <Route path="/login" element={<CustomerAuth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </BuilderProvider>
  </CartProvider>
);

export default App;
