import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../features/auth/authSlice';
import { FaShoppingCart, FaUser, FaSearch } from 'react-icons/fa';
import api from '../api/api';
import './Header.css';
import { toast } from 'react-toastify';

const Header = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  const cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

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

  const handleSearchChange = (e) => {
    const keyword = e.target.value;
    setSearchKeyword(keyword);
    if (keyword) {
      fetchSearchResults(keyword);
    } else {
      setSearchResults([]);
    }
  };

  const fetchSearchResults = async (keyword) => {
    try {
      const response = await api.get('/books/search', {
        params: { keyword },
      });
      if (response.status === 200) {
        const results = response.data.result.slice(0, 5); // Giới hạn 5 kết quả
        setSearchResults(results);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response.data.message);
      setSearchResults([]);
    }
  };

  const handleResultClick = (bookId) => {
    navigate(`/books/${bookId}`);
    setSearchKeyword('');
    setSearchResults([]);
  };

  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setSearchResults([]);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

        <div className="header-center" ref={searchRef}>
          <form onSubmit={(e) => e.preventDefault()} className="header-search-form">
            <input
              type="text"
              value={searchKeyword}
              onChange={handleSearchChange}
              placeholder="Bạn đang tìm kiếm sách?"
              className="header-search-input"
            />
            <button type="button" className="header-search-button" onClick={() => fetchSearchResults(searchKeyword)}>
              <FaSearch />
            </button>
          </form>
          {searchResults.length > 0 && (
            <div className="header-search-dropdown">
              {searchResults.map((book) => (
                <div
                  key={book.bookId}
                  className="header-search-result"
                  onClick={() => handleResultClick(book.bookId)}
                >
                  <img src={book.urlThumbnail} alt={book.bookName} className="header-search-thumbnail" />
                  <span className="header-search-title">{book.bookName}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="header-right">
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