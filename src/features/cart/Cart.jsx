import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCart, changeQuantity, updateQuantity, removeFromCart } from './cartSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [inputQuantities, setInputQuantities] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const initialQuantities = {};
    (cartItems || []).forEach((item) => {
      initialQuantities[item.bookId] = item.quantity;
    });
    setInputQuantities(initialQuantities);
  }, [cartItems]);

  const handleSelectItem = (bookId) => {
    setSelectedItems((prev) => {
      if (prev.includes(bookId)) {
        const newSelected = prev.filter((id) => id !== bookId);
        setSelectAll(newSelected.length === (cartItems?.length || 0));
        return newSelected;
      } else {
        const newSelected = [...prev, bookId];
        setSelectAll(newSelected.length === (cartItems?.length || 0));
        return newSelected;
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      setSelectedItems((cartItems || []).map((item) => item.bookId));
      setSelectAll(true);
    }
  };

  const handleIncreaseQuantity = async (bookId) => {
    const result = await dispatch(changeQuantity({ bookId, delta: 1 })).unwrap();
    console.log('Increase quantity result:', result);
  };

  const handleDecreaseQuantity = async (bookId) => {
    const result = await dispatch(changeQuantity({ bookId, delta: -1 })).unwrap();
    console.log('Decrease quantity result:', result);
  };

  const handleQuantityInputChange = (bookId, value) => {
    const quantity = parseInt(value);
    if (isNaN(quantity)) return;
    setInputQuantities((prev) => ({
      ...prev,
      [bookId]: quantity,
    }));
  };

  const handleQuantityInputBlurOrEnter = async (bookId, originalQuantity) => {
    const newQuantity = inputQuantities[bookId];
    if (newQuantity === originalQuantity) return;
    if (newQuantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0!');
      setInputQuantities((prev) => ({
        ...prev,
        [bookId]: originalQuantity,
      }));
      return;
    }
    const result = await dispatch(updateQuantity({ bookId, quantity: newQuantity })).unwrap();
    console.log('Update quantity result:', result);
  };

  const handleRemoveFromCart = async (bookId) => {
    const result = await dispatch(removeFromCart(bookId)).unwrap();
    console.log('Remove from cart result:', result);
    setSelectedItems((prev) => prev.filter((id) => id !== bookId));
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
      return;
    }
    navigate('/checkout', { state: { selectedItems } });
  };

  const selectedTotalPrice = (cartItems || [])
    .filter((item) => selectedItems.includes(item.bookId))
    .reduce((total, item) => total + (item.totalPrice || 0), 0);

  if (!isAuthenticated) {
    return <p>Vui lòng đăng nhập để xem giỏ hàng!</p>;
  }

  if (loading) return <p>Đang tải giỏ hàng...</p>;

  return (
    <div className="cart-container">
      <h2>Giỏ hàng</h2>
      {(cartItems?.length || 0) === 0 ? (
        <p>Giỏ hàng của bạn đang trống!</p>
      ) : (
        <>
          <div className="cart-header">
            <input
              type="checkbox"
              className="cart-select-all"
              checked={selectAll}
              onChange={handleSelectAll}
            />
            <span className="cart-header-image"></span>
            <span className="cart-header-name">Tên sách</span>
            <span className="cart-header-price">Đơn giá</span>
            <span className="cart-header-quantity">Số lượng</span>
            <span className="cart-header-total-price">Số tiền</span>
            <span className="cart-header-action">Thao tác</span>
          </div>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.bookId} className="cart-item">
                <input
                  type="checkbox"
                  className="cart-item-checkbox"
                  checked={selectedItems.includes(item.bookId)}
                  onChange={() => handleSelectItem(item.bookId)}
                />
                <img
                  src={item.urlThumbnail || '/no-image.png'}
                  alt={item.bookName || 'Sách'}
                  className="cart-item-image"
                />
                <h3 className="cart-item-name">
                  <Link to={`/books/${item.bookId}`}>{item.bookName || 'Không có tiêu đề'}</Link>
                </h3>
                <p className="cart-item-price">
                  {item.priceAfterSales !== null && (
                    <span className="original-price">
                      {(item.price || 0).toLocaleString('vi-VN')}
                    </span>
                  )}
                  <span>
                    {(item.priceAfterSales !== null ? item.priceAfterSales : item.price || 0).toLocaleString('vi-VN')} VNĐ
                  </span>
                </p>
                <div className="cart-item-quantity">
                  <button
                    className="cart-item-quantity-button"
                    onClick={() => handleDecreaseQuantity(item.bookId)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="cart-item-quantity-input"
                    value={inputQuantities[item.bookId] || item.quantity}
                    onChange={(e) => handleQuantityInputChange(item.bookId, e.target.value)}
                    onBlur={() => handleQuantityInputBlurOrEnter(item.bookId, item.quantity)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleQuantityInputBlurOrEnter(item.bookId, item.quantity);
                      }
                    }}
                    min="1"
                  />
                  <button
                    className="cart-item-quantity-button"
                    onClick={() => handleIncreaseQuantity(item.bookId)}
                  >
                    +
                  </button>
                </div>
                <p className="cart-item-total-price">
                  {(item.totalPrice || 0).toLocaleString('vi-VN')} VNĐ
                </p>
                <button
                  className="cart-item-remove"
                  onClick={() => handleRemoveFromCart(item.bookId)}
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Tổng giá trị (đã chọn): {selectedTotalPrice.toLocaleString('vi-VN')} VNĐ</h3>
            <button className="cart-checkout-button" onClick={handleCheckout} disabled={loading}>
              Thanh toán
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;