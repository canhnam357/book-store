import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchAddresses } from '../addresses/addressSlice';
import { createOrder } from './cartSlice';
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
    const defaultAddress = addresses.find((addr) => addr.default);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.addressId);
    } else if (addresses.length > 0) {
      setSelectedAddressId(addresses[0].addressId);
    }
  }, [addresses]);

  const selectedCartItems = cartItems.filter((item) => selectedItems.includes(item.bookId));
  const selectedTotalPrice = selectedCartItems.reduce((total, item) => total + (item.totalPrice || 0), 0);

  const handleConfirmCheckout = async () => {
    if (!selectedAddressId) {
      toast.error('Vui lòng chọn hoặc tạo một địa chỉ giao hàng!');
      navigate('/addresses');
      return;
    }
    try {
      const result = await dispatch(
        createOrder({ bookIds: selectedItems, addressId: selectedAddressId, paymentMethod })
      ).unwrap();
      if (paymentMethod === 'CARD') {
        window.location.href = result; // Redirect tới VNPAY URL
      } else {
        toast.success('Đặt hàng thành công!');
        navigate('/orders');
      }
    } catch (error) {
      if (error.includes('bị khóa hoặc chưa xác thực')) {
        navigate('/login');
      }
      toast.error(error);
    }
  };

  if (!isAuthenticated) {
    return <p>Vui lòng đăng nhập để tiếp tục!</p>;
  }

  if (loading) return <p>Đang tải...</p>;

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
            <img src={item.urlThumbnail} alt={item.bookName} className="checkout-item-image" />
            <h3 className="checkout-item-name">{item.bookName}</h3>
            <p className="checkout-item-price">{item.price.toLocaleString('vi-VN')} VNĐ</p>
            <p className="checkout-item-quantity">{item.quantity}</p>
            <p className="checkout-item-total-price">{item.totalPrice.toLocaleString('vi-VN')} VNĐ</p>
          </div>
        ))}
      </div>
      <div className="checkout-options">
        <div className="checkout-address-selection">
          <label>Địa chỉ giao hàng:</label>
          {addresses.length === 0 ? (
            <p className="checkout-no-address">
              Chưa có địa chỉ! <a href="/addresses">Tạo địa chỉ</a>
            </p>
          ) : (
            <select
              value={selectedAddressId || ''}
              onChange={(e) => setSelectedAddressId(e.target.value)}
              className="checkout-address-select"
            >
              {addresses.map((address) => (
                <option key={address.addressId} value={address.addressId}>
                  {address.fullName} - {address.phoneNumber} - {address.addressInformation}
                  {address.default && ' (Mặc định)'}
                </option>
              ))}
            </select>
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