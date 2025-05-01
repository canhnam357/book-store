import { Link } from 'react-router-dom'; // Thêm dòng này
import './BookCard.css';

const BookCard = ({ book }) => {
  const { bookId, bookName, price, urlThumbnail, authorName, publisherName, distributorName, inStock } = book;

  return (
    <Link to={`/books/${bookId}`} className="book-card-link"> {/* Thêm Link */}
      <div className="book-card">
        <div className="book-card-image">
          {urlThumbnail ? (
            <img src={urlThumbnail} alt={bookName} />
          ) : (
            <div className="book-card-placeholder">No Image</div>
          )}
        </div>
        <div className="book-card-content">
          <h3 className="book-card-title">{bookName}</h3>
          <p className="book-card-price">{price.toLocaleString('vi-VN')} VNĐ</p>
          <p className="book-card-detail">Tác giả: {authorName || 'Không rõ'}</p>
          <p className="book-card-detail">NXB: {publisherName || 'Không rõ'}</p>
          <p className="book-card-detail">Phát hành: {distributorName || 'Không rõ'}</p>
          <p className="book-card-stock">{inStock > 0 ? `Còn hàng (${inStock})` : 'Hết hàng'}</p>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;