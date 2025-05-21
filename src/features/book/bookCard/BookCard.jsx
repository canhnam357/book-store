import { Link } from 'react-router-dom';
import './BookCard.css';

const BookCard = ({ book }) => {
  const { bookId, bookName, price, urlThumbnail, inStock, priceAfterSale, newArrival } = book;

  return (
    <Link to={`/books/${bookId}`} className="book-card-link">
      <div className="book-card">
        <div className="book-card-image">
          {urlThumbnail ? (
            <img src={urlThumbnail} alt={bookName || 'Sách'} />
          ) : (
            <div className="book-card-placeholder">No Image</div>
          )}
          {newArrival && <div className="bookcard-new-tag">Mới</div>}
        </div>
        <div className="book-card-content">
          <h3 className="book-card-title">{bookName || 'Không có tiêu đề'}</h3>
          <div className="book-card-price">
            {priceAfterSale ? (
              <>
                <span className="book-card-price-original">
                  {(price || 0).toLocaleString('vi-VN')}
                </span>
                <span className="book-card-price-discounted">
                  {(priceAfterSale || 0).toLocaleString('vi-VN')} VNĐ
                </span>
              </>
            ) : (
              <span className="book-card-price-regular">
                {(price || 0).toLocaleString('vi-VN')} VNĐ
              </span>
            )}
          </div>
          <p className="book-card-detail">Tác giả: {book.author?.authorName || 'Không rõ'}</p>
          <p className="book-card-detail">NXB: {book.publisher?.publisherName || 'Không rõ'}</p>
          <p className="book-card-detail">Phát hành: {book.distributor?.distributorName || 'Không rõ'}</p>
          <p className="book-card-stock">{inStock > 0 ? `Còn hàng (${inStock})` : 'Hết hàng'}</p>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;