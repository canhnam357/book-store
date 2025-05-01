import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../features/auth/authSlice';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  console.log('cartItems trong Header:', cartItems);
  console.log('cartItemCount:', cartItemCount);

  const handleLogout = () => {
    dispatch(logoutUser()).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setIsDropdownOpen(false);
        navigate('/login');
      }
    });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-title">
            <a href="/" className="header-link">Book Store</a>
          </h1>
          <a href="/books" className="header-button product-button">
            Sản Phẩm
          </a>
        </div>
        <div className="header-actions">
          {isAuthenticated ? (
            <div className="header-user-actions">
              <a href="/cart" className="header-icon header-cart">
                <FaShoppingCart />
                {cartItemCount > 0 && (
                  <span className="header-cart-count">{cartItemCount}</span>
                )}
              </a>
              <div className={`header-user-dropdown ${isDropdownOpen ? 'open' : ''}`}>
                <button onClick={toggleDropdown} className="header-icon">
                  <FaUser />
                </button>
                {isDropdownOpen && (
                  <div className="header-dropdown-menu">
                    <a href="/profile" className="header-dropdown-item">
                      Thông tin cá nhân
                    </a>
                    <button onClick={handleLogout} className="header-dropdown-item header-logout">
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <a href="/login" className="header-button login-button">
              Đăng Nhập
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;