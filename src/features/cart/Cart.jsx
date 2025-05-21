import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, changeQuantity, updateQuantity, removeFromCart } from './cartSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem';
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
    try {
    const result = await dispatch(changeQuantity({ bookId, delta: 1 })).unwrap();
    console.log('Increase quantity result:', result);
    } catch(error) {
      
    }
  };

  const handleDecreaseQuantity = async (bookId) => {
    try {
    const result = await dispatch(changeQuantity({ bookId, delta: -1 })).unwrap();
    console.log('Decrease quantity result:', result);
    } catch(error) {

    }
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

  const selectedTotalPrice = useMemo(() => {
    return (cartItems || [])
      .filter((item) => selectedItems.includes(item.bookId))
      .reduce((total, item) => total + (item.totalPrice || 0), 0);
  }, [cartItems, selectedItems]);

  if (!isAuthenticated) {
    return <p>Vui lòng đăng nhập để xem giỏ hàng!</p>;
  }

  return (
    <div className="cart-container">
      {loading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
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
              <CartItem
                key={item.bookId}
                item={item}
                selectedItems={selectedItems}
                handleSelectItem={handleSelectItem}
                handleIncreaseQuantity={handleIncreaseQuantity}
                handleDecreaseQuantity={handleDecreaseQuantity}
                handleQuantityInputChange={handleQuantityInputChange}
                handleQuantityInputBlurOrEnter={handleQuantityInputBlurOrEnter}
                handleRemoveFromCart={handleRemoveFromCart}
                inputQuantities={inputQuantities}
              />
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