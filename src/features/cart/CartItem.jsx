import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const CartItem = ({
  item,
  selectedItems,
  handleSelectItem,
  handleIncreaseQuantity,
  handleDecreaseQuantity,
  handleQuantityInputChange,
  handleQuantityInputBlurOrEnter,
  handleRemoveFromCart,
  inputQuantities,
}) => {
  return (
    <div className="cart-item">
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
  );
};

export default memo(CartItem);