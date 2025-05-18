import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchAddresses } from '../addresses/addressSlice';
import { createOrder } from './cartSlice';
import { fetchCart } from './cartSlice';
import './Checkout.css';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, loading } = useSelector((state) => state.cart);
  const { addresses } = useSelector((state) => state.addresses);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const addressDropdownRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchAddresses());
    const items = location.state?.selectedItems || [];
    setSelectedItems(items);
  }, [dispatch, isAuthenticated, location, navigate]);

  useEffect(() => {
    const defaultAddress = (addresses || []).find((addr) => addr.default);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.addressId);
    } else if ((addresses || []).length > 0) {
      setSelectedAddressId(addresses[0].addressId);
    }
  }, [addresses]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(e.target)) {
        setIsAddressDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'Không có';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const selectedCartItems = (cartItems || []).filter((item) => selectedItems.includes(item.bookId));
  const selectedTotalPrice = selectedCartItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
  const selectedAddress = addresses.find((addr) => addr.addressId === selectedAddressId);

  const handleConfirmCheckout = async () => {
    if (!selectedAddressId) {
      toast.error('Vui lòng chọn hoặc tạo một địa chỉ giao hàng!');
      navigate('/addresses');
      return;
    }

    try {
      if (paymentMethod === 'CARD') {
        setIsRedirecting(true);
      }
      const result = await dispatch(
        createOrder({ bookIds: selectedItems, addressId: selectedAddressId, paymentMethod })
      ).unwrap();
      console.log('Create order result:', result);
      if (paymentMethod === 'CARD') {
        window.location.href = result;
      } else {
        navigate('/orders');
      }
      dispatch(fetchCart());
    } catch (error) {
      console.error('Lỗi khi tạo đơn hàng:', error);
      setIsRedirecting(false);
    }
  };

  const toggleAddressDropdown = () => {
    setIsAddressDropdownOpen(!isAddressDropdownOpen);
  };

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
    setIsAddressDropdownOpen(false);
  };

  if (!isAuthenticated) {
    return <p>Vui lòng đăng nhập để tiếp tục!</p>;
  }

  if (loading) return <p>Đang tải...</p>;

  if (isRedirecting) {
    return (
      <div className="checkout-container redirecting-container">
        <div className="loading-spinner"></div>
        <p className="redirecting-text">Đang chuyển hướng tới VNPAY...</p>
      </div>
    );
  }

  if (selectedCartItems.length === 0) {
    return (
      <div className="checkout-container">
        <h2>Xác nhận đơn hàng</h2>
        <p>Không có sản phẩm nào được chọn! Vui lòng quay lại giỏ hàng.</p>
        <button className="checkout-back-button" onClick={() => navigate('/cart')}>
          Quay lại giỏ hàng
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Xác nhận đơn hàng</h2>
      <div className="checkout-items">
        <div className="checkout-header">
          <span className="checkout-header-image"></span>
          <span className="checkout-header-name">Tên sách</span>
          <span className="checkout-header-price">Đơn giá</span>
          <span className="checkout-header-quantity">Số lượng</span>
          <span className="checkout-header-total-price">Số tiền</span>
        </div>
        {selectedCartItems.map((item) => (
          <div key={item.bookId} className="checkout-item">
            <img
              src={item.urlThumbnail || '/no-image.png'}
              alt={item.bookName || 'Sách'}
              className="checkout-item-image"
            />
            <h3 className="checkout-item-name">{item.bookName || 'Không có tiêu đề'}</h3>
            <p className="checkout-item-price">
              {item.priceAfterSales !== null && (
                <span className="original-price">
                  {(item.price || 0).toLocaleString('vi-VN')} VNĐ
                </span>
              )}
              <span>
                {(item.priceAfterSales !== null ? item.priceAfterSales : item.price || 0).toLocaleString('vi-VN')} VNĐ
              </span>
            </p>
            <p className="checkout-item-quantity">{item.quantity || 0}</p>
            <p className="checkout-item-total-price">
              {(item.totalPrice || 0).toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
        ))}
      </div>
      <div className="checkout-options">
        <div className="checkout-address-selection">
          <label>Địa chỉ giao hàng:</label>
          {(addresses?.length || 0) === 0 ? (
            <p className="checkout-no-address">
              Chưa có địa chỉ! <a href="/addresses">Tạo địa chỉ</a>
            </p>
          ) : (
            <div className="checkout-address-dropdown" ref={addressDropdownRef}>
              <div className="checkout-address-selected" onClick={toggleAddressDropdown}>
                <div className="checkout-address-table">
                  <div className="checkout-address-row">
                    <span className="checkout-address-label">Họ và tên:</span>
                    <span className="checkout-address-value">
                      {selectedAddress ? (selectedAddress.fullName || 'Không có tên') : 'Chọn địa chỉ'}
                    </span>
                  </div>
                  <div className="checkout-address-row">
                    <span className="checkout-address-label">Số điện thoại:</span>
                    <span className="checkout-address-value">
                      {selectedAddress ? (selectedAddress.phoneNumber || 'Không có số điện thoại') : '-'}
                    </span>
                  </div>
                  <div className="checkout-address-row">
                    <span className="checkout-address-label">Địa chỉ:</span>
                    <span className="checkout-address-value">
                      {selectedAddress
                        ? truncateText(selectedAddress.addressInformation || 'Không có địa chỉ')
                        : '-'}
                    </span>
                  </div>
                  <div className="checkout-address-row">
                    <span className="checkout-address-label">Chi tiết khác:</span>
                    <span className="checkout-address-value">
                      {selectedAddress ? truncateText(selectedAddress.otherDetail || 'Không có') : '-'}
                    </span>
                  </div>
                </div>
                {selectedAddress?.default && <span className="checkout-address-default"> (Mặc định)</span>}
              </div>
              {isAddressDropdownOpen && (
                <div className="checkout-address-dropdown-menu">
                  {addresses
                    .filter((address) => address.addressId !== selectedAddressId)
                    .map((address) => (
                      <div
                        key={address.addressId}
                        className="checkout-address-option"
                        onClick={() => handleSelectAddress(address.addressId)}
                      >
                        <div className="checkout-address-table">
                          <div className="checkout-address-row">
                            <span className="checkout-address-label">Họ và tên:</span>
                            <span className="checkout-address-value">
                              {address.fullName || 'Không có tên'}
                            </span>
                          </div>
                          <div className="checkout-address-row">
                            <span className="checkout-address-label">Số điện thoại:</span>
                            <span className="checkout-address-value">
                              {address.phoneNumber || 'Không có số điện thoại'}
                            </span>
                          </div>
                          <div className="checkout-address-row">
                            <span className="checkout-address-label">Địa chỉ:</span>
                            <span className="checkout-address-value">
                              {truncateText(address.addressInformation || 'Không có địa chỉ')}
                            </span>
                          </div>
                          <div className="checkout-address-row">
                            <span className="checkout-address-label">Chi tiết khác:</span>
                            <span className="checkout-address-value">
                              {truncateText(address.otherDetail || 'Không có')}
                            </span>
                          </div>
                        </div>
                        {address.default && <span className="checkout-address-default"> (Mặc định)</span>}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="checkout-payment-method">
          <label>Phương thức thanh toán:</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="checkout-payment-select"
          >
            <option value="COD">Thanh toán khi nhận hàng (COD)</option>
            <option value="CARD">Thanh toán qua thẻ (VNPAY)</option>
          </select>
        </div>
      </div>
      <div className="checkout-summary">
        <h3>Tổng giá trị: {selectedTotalPrice.toLocaleString('vi-VN')} VNĐ</h3>
        <div className="checkout-actions">
          <button className="checkout-back-button" onClick={() => navigate('/cart')}>
            Quay lại giỏ hàng
          </button>
          <button className="checkout-confirm-button" onClick={handleConfirmCheckout} disabled={loading}>
            Xác nhận thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;