import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBookDetail,
  fetchReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../bookSlice';
import { addToCart, fetchCart } from '../../cart/cartSlice';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../api/api';
import './BookDetail.css';

const BookDetail = () => {
  const { bookId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookDetail, reviews, totalReviewPages, currentReviewPage, totalReviews, loading } = useSelector(
    (state) => state.book
  );
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reviewFilters, setReviewFilters] = useState({
    index: 1,
    size: 10,
    rating: 0,
  });

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get('/user/user-id');
          if (response.data.success) {
            setCurrentUserId(response.data.result);
          }
        } catch (error) {
          console.error('Lỗi khi lấy userId:', error);
          setCurrentUserId(null);
        }
      } else {
        setCurrentUserId(null);
      }
    };

    fetchCurrentUserId();
  }, [isAuthenticated]);

  useEffect(() => {
    dispatch(fetchBookDetail(bookId));
    dispatch(fetchReviews({ bookId, index: reviewFilters.index, size: reviewFilters.size, rating: reviewFilters.rating }));
  }, [dispatch, bookId, reviewFilters]);

  useEffect(() => {
    if (bookDetail) {
      setMainImage(bookDetail.urlThumbnail);
    }
  }, [bookDetail]);

  const handleImageClick = (image) => {
    setMainImage(image);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= (bookDetail?.inStock || 1)) {
      setQuantity(value);
    }
  };

  const handleIncreaseQuantity = () => {
    if (quantity < bookDetail?.inStock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await dispatch(addToCart({ bookId, quantity })).unwrap();
      toast.success(`Đã thêm ${quantity} cuốn "${bookDetail?.bookName}" vào giỏ hàng!`);
      // Làm mới dữ liệu giỏ hàng từ server
      const fetchCartResult = await dispatch(fetchCart()).unwrap();
      console.log('Dữ liệu giỏ hàng sau khi thêm:', fetchCartResult);
    } catch (error) {
      toast.error(error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!reviewContent || reviewRating === 0) {
      toast.error('Vui lòng nhập nội dung và chọn đánh giá!');
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      await dispatch(createReview({ bookId, content: reviewContent, rating: reviewRating })).unwrap();
      toast.success('Tạo đánh giá thành công!');
      setReviewContent('');
      setReviewRating(0);
    } catch (error) {
      toast.error(`Tạo đánh giá thất bại: ${error}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.reviewId);
    setEditContent(review.content);
    setEditRating(review.rating ?? 0);
  };

  const handleConfirmEdit = async (reviewId) => {
    if (!editContent || editRating === 0) {
      toast.error('Vui lòng nhập nội dung và chọn đánh giá!');
      return;
    }

    try {
      await dispatch(updateReview({ reviewId, content: editContent, rating: editRating })).unwrap();
      toast.success('Cập nhật đánh giá thành công!');
      setEditingReviewId(null);
      setEditContent('');
      setEditRating(0);
    } catch (error) {
      toast.error(`Cập nhật đánh giá thất bại: ${error}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditContent('');
    setEditRating(0);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await dispatch(deleteReview(reviewId)).unwrap();
      toast.success('Xóa đánh giá thành công!');
    } catch (error) {
      toast.error(`Xóa đánh giá thất bại: ${error}`);
    }
  };

  const handlePageChange = (page) => {
    setReviewFilters((prev) => ({ ...prev, index: page }));
  };

  const renderStars = (rating) => {
    const safeRating = rating ?? 0;
    const fullStars = Math.floor(safeRating);
    const halfStar = safeRating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="bookdetail-star bookdetail-star-full" />
        ))}
        {halfStar === 1 && <FaStarHalfAlt key="half" className="bookdetail-star bookdetail-star-half" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="bookdetail-star bookdetail-star-empty" />
        ))}
      </>
    );
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    const start = Math.max(2, currentReviewPage - delta);
    const end = Math.min(totalReviewPages - 1, currentReviewPage + delta);

    range.push(1);
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    if (totalReviewPages > 1) {
      range.push(totalReviewPages);
    }

    let prevPage = null;
    for (const page of range) {
      if (prevPage && page - prevPage > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(page);
      prevPage = page;
    }

    return rangeWithDots;
  };

  if (loading) return <p>Đang tải...</p>;
  if (!bookDetail) return <p>Sách không tìm thấy!</p>;

  return (
    <div className="bookdetail-container">
      <div className="bookdetail-main">
        <div className="bookdetail-images">
          <img src={mainImage} alt={bookDetail.bookName} className="bookdetail-main-image" />
          {Array.isArray(bookDetail.images) && bookDetail.images.length > 1 && (
            <div className="bookdetail-image-list">
              {bookDetail.images.map((image, index) => (
                <div key={index} className="bookdetail-image-item">
                  <img
                    src={image}
                    alt={`Thumbnail ${index}`}
                    onClick={() => handleImageClick(image)}
                    className={mainImage === image ? 'bookdetail-image-selected' : ''}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bookdetail-info">
          <h1 className="bookdetail-title">{bookDetail.bookName}</h1>
          <div className="bookdetail-rating">
            {renderStars(bookDetail.rating)}
            <span>({bookDetail.rating.toFixed(1)})</span>
          </div>
          <p className="bookdetail-price">{bookDetail.price.toLocaleString('vi-VN')} VNĐ</p>
          <p className="bookdetail-stock">Còn hàng: {bookDetail.inStock}</p>
          <p className="bookdetail-detail">
            <strong>Số trang:</strong> {bookDetail.numberOfPage}
          </p>
          <p className="bookdetail-detail">
            <strong>Ngày xuất bản:</strong>{' '}
            {new Date(bookDetail.publishedDate).toLocaleDateString('vi-VN')}
          </p>
          <p className="bookdetail-detail">
            <strong>Trọng lượng:</strong> {bookDetail.weight}g
          </p>
          <p className="bookdetail-detail">
            <strong>Tác giả:</strong> {bookDetail.authorName || 'Không có thông tin'}
          </p>
          <p className="bookdetail-detail">
            <strong>Danh mục:</strong>{' '}
            {bookDetail.categories.length > 0
              ? bookDetail.categories.map((cat) => cat.categoryName).join(', ')
              : 'Không có danh mục'}
          </p>
          <p className="bookdetail-detail">
            <strong>Nhà xuất bản:</strong> {bookDetail.publisherName}
          </p>
          <p className="bookdetail-detail">
            <strong>Nhà phát hành:</strong> {bookDetail.distributorName}
          </p>
          <p className="bookdetail-detail">
            <strong>Loại bìa:</strong> {bookDetail.bookType}
          </p>
          <div className="bookdetail-cart">
            <div className="bookdetail-quantity">
              <button onClick={handleDecreaseQuantity} disabled={quantity <= 1}>
                -
              </button>
              <input type="number" value={quantity} onChange={handleQuantityChange} min="1" max={bookDetail.inStock} />
              <button onClick={handleIncreaseQuantity} disabled={quantity >= bookDetail.inStock}>
                +
              </button>
            </div>
            <button className="bookdetail-add-to-cart" onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
      <div className="bookdetail-description">
        <h2>Mô tả sách</h2>
        <p>{bookDetail.description}</p>
      </div>
      <div className="bookdetail-reviews">
        <h2>Đánh giá ({totalReviews})</h2>
        {isAuthenticated && (
          <form className="bookdetail-review-form" onSubmit={handleReviewSubmit}>
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="Nhập đánh giá của bạn..."
              required
            />
            <div className="bookdetail-rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={star <= reviewRating ? 'bookdetail-star bookdetail-star-full' : 'bookdetail-star'}
                >
                  <FaStar />
                </span>
              ))}
            </div>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        )}
        {reviews.length === 0 ? (
          <p>Chưa có đánh giá nào!</p>
        ) : (
          <>
            <div className="bookdetail-review-list">
              {reviews.map((review) => (
                <div key={review.reviewId} className="bookdetail-review-item">
                  <div className="bookdetail-review-header">
                    <span className="bookdetail-review-user">{review.userReviewed}</span>
                    <span className="bookdetail-review-date">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  {editingReviewId === review.reviewId ? (
                    <>
                      <div className="bookdetail-review-rating">
                        <div className="bookdetail-rating-input">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              onClick={() => setEditRating(star)}
                              className={star <= editRating ? 'bookdetail-star bookdetail-star-full' : 'bookdetail-star'}
                            >
                              <FaStar />
                            </span>
                          ))}
                        </div>
                      </div>
                      <textarea
                        className="bookdetail-review-content-editable"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <div className="bookdetail-review-rating">{renderStars(review.rating)}</div>
                      <p className="bookdetail-review-content">{review.content}</p>
                    </>
                  )}
                  {currentUserId && currentUserId === review.userId && (
                    <div className="bookdetail-review-actions">
                      {editingReviewId === review.reviewId ? (
                        <>
                          <button
                            className="bookdetail-review-button bookdetail-confirm-button"
                            onClick={() => handleConfirmEdit(review.reviewId)}
                          >
                            Xác nhận
                          </button>
                          <button
                            className="bookdetail-review-button bookdetail-cancel-button"
                            onClick={handleCancelEdit}
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="bookdetail-review-button bookdetail-edit-button"
                            onClick={() => handleEditReview(review)}
                          >
                            Sửa
                          </button>
                          <button
                            className="bookdetail-review-button bookdetail-delete-button"
                            onClick={() => handleDeleteReview(review.reviewId)}
                          >
                            Xóa
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="bookdetail-pagination">
              {currentReviewPage > 1 && (
                <button
                  className="bookdetail-page-button bookdetail-nav-button"
                  onClick={() => handlePageChange(currentReviewPage - 1)}
                >
                  {'<'}
                </button>
              )}
              {getPageNumbers().map((page, index) =>
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="bookdetail-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`bookdetail-page-button ${currentReviewPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              )}
              {currentReviewPage < totalReviewPages && (
                <button
                  className="bookdetail-page-button bookdetail-nav-button"
                  onClick={() => handlePageChange(currentReviewPage + 1)}
                >
                  {'>'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookDetail;