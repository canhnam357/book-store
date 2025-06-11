import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchCart } from './features/cart/cartSlice';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './features/home/Home';
import Login from './features/auth/login/Login';
import Register from './features/auth/register/Register';
import VerifyOTP from './features/auth/verifyOTP/VerifyOTP';
import ForgotPassword from './features/auth/forgotPassword/ForgotPassword';
import ResetPassword from './features/auth/resetPassword/ResetPassword';
import Callback from './features/auth/callback/Callback';
import BookList from './features/book/bookList/BookList';
import BookDetail from './features/book/bookDetail/BookDetail';
import Cart from './features/cart/Cart';
import Checkout from './features/cart/Checkout';
import PaymentReturn from './features/cart/PaymentReturn';
import Profile from './features/profile/Profile';
import ChangePassword from './features/change-password/ChangePassword';
import Addresses from './features/addresses/Addresses';
import Orders from './features/orders/Orders';
import './App.css';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Router>
      <div className="app">
        <Header />
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/books" element={<BookList />} />
            <Route path="/books/:bookId" element={<BookDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-return" element={<PaymentReturn />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/addresses" element={<Addresses />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
        <Footer />
        <ToastContainer />
        <SpeedInsights />
      </div>
    </Router>
  );
}

export default App;