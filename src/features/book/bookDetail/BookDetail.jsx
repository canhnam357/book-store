import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBookDetail,
  fetchReviews,
  createReview,
  updateReview,
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
  const { loading: cartLoading } = useSelector((state) => state.cart);

  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [reviewFilters, setReviewFilters] = useState({
    index: 1,
    size: 10,
    rating: 0,
  });

  // Hàm cắt nội dung thành các dòng 140 ký tự
  const splitIntoLines = (text) => {
    if (!text) return ['Không có nội dung'];
    const maxLineLength = 140;
    const lines = [];
    for (let i = 0; i < text.length; i += maxLineLength) {
      lines.push(text.slice(i, i + maxLineLength));
    }
    return lines.length > 0 ? lines : ['Không có nội dung'];
  };

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get('/user/user-id');
          console.log('Fetch user ID response:', response.data);
          if (response.data.result) {
            setCurrentUserId(response.data.result);
          }
        } catch (error) {
          console.error('Lỗi khi lấy userId:', error.response?.data || error);
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
      setMainImage(bookDetail.urlThumbnail || '');
    }
  }, [bookDetail]);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Không rõ';
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    if (dateRegex.test(dateString)) {
      return dateString;
    }
    try {
      const [day, month, year] = dateString.split('-');
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    } catch {
      return 'Không rõ';
    }
  };

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
    if (quantity < (bookDetail?.inStock || 1)) {
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
    if (isAdding) return;
    setIsAdding(true);
    try {
      const result = await dispatch(addToCart({ bookId, quantity })).unwrap();
      console.log('Add to cart result:', result);
      toast.dismiss();
      toast.success(`Đã thêm ${quantity} cuốn "${bookDetail?.bookName || 'sách'}" vào giỏ hàng!`);
      await dispatch(fetchCart());
    } catch (error) {
      // toast.error đã được xử lý trong cartSlice
    } finally {
      setIsAdding(false);
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
    const result = await dispatch(createReview({ bookId, content: reviewContent, rating: reviewRating }));
    console.log('Create review result:', result);
    if (result.meta.requestStatus === 'fulfilled') {
      setReviewContent('');
      setReviewRating(0);
    }
    setSubmitting(false);
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.reviewId);
    setEditContent(review.content || '');
    setEditRating(review.rating ?? 0);
  };

  const handleConfirmEdit = async (reviewId) => {
    if (!editContent || editRating === 0) {
      toast.error('Vui lòng nhập nội dung và chọn đánh giá!');
      return;
    }

    const result = await dispatch(updateReview({ reviewId, content: editContent, rating: editRating }));
    console.log('Update review result:', result);
    if (result.meta.requestStatus === 'fulfilled') {
      setEditingReviewId(null);
      setEditContent('');
      setEditRating(0);
    }
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditContent('');
    setEditRating(0);
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

  const handleAuthorClick = (authorId, authorName) => {
    navigate(`/books?authorId=${authorId}`);
  };

  const handleCategoryClick = (categoryId, categoryName) => {
    navigate(`/books?categoryId=${categoryId}`);
  };

  const handlePublisherClick = (publisherId, publisherName) => {
    navigate(`/books?publisherId=${publisherId}`);
  };

  const handleDistributorClick = (distributorId, distributorName) => {
    navigate(`/books?distributorId=${distributorId}`);
  };

  const formatCreatedAt = (dateString) => {
    if (!dateString) return 'N/A';
    const dateRegex = /^(\d{2}):(\d{2}):(\d{2}) (\d{2})-(\d{2})-(\d{4})$/;
    if (dateRegex.test(dateString)) {
      return dateString;
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
    } catch {
      return 'N/A';
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (!bookDetail) return <p>Sách không tìm thấy!</p>;

  return (
    <div className="bookdetail-container">
      <div className="bookdetail-main">
        <div className="bookdetail-images">
          <div className="bookdetail-image-wrapper">
            <img src={mainImage || '/no-image.png'} alt={bookDetail.bookName || 'Sách'} className="bookdetail-main-image" />
          </div>
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
          <h1 className="bookdetail-title">
            {bookDetail.bookName || 'Không có tiêu đề'}
            {bookDetail.newArrival && <span className="bookdetail-new-tag">Mới</span>}
          </h1>
          <div className="bookdetail-rating">
            {renderStars(bookDetail.rating)}
            <span>({bookDetail.rating?.toFixed(1) || 'Chưa có đánh giá'})</span>
          </div>
          <div className="bookdetail-price-container">
            {bookDetail.priceAfterSale ? (
              <>
                <span className="bookdetail-price-original">
                  {(bookDetail.price || 0).toLocaleString('vi-VN')}
                </span>
                <span className="bookdetail-price-discounted">
                  {(bookDetail.priceAfterSale || 0).toLocaleString('vi-VN')} VNĐ
                </span>
              </>
            ) : (
              <span className="bookdetail-price-regular">
                {(bookDetail.price || 0).toLocaleString('vi-VN')} VNĐ
              </span>
            )}
          </div>
          <p className="bookdetail-sold"><strong>Đã bán:</strong> {(bookDetail.soldQuantity || 0).toLocaleString('vi-VN')}</p>
          <p className="bookdetail-stock"><strong>Còn hàng:</strong> {bookDetail.inStock || 0}</p>
          <p className="bookdetail-detail">
            <strong>Số trang:</strong> {bookDetail.numberOfPage || 'Không rõ'}
          </p>
          <p className="bookdetail-detail">
            <strong>Ngày xuất bản:</strong> {formatDisplayDate(bookDetail.publishedDate)}
          </p>
          <p className="bookdetail-detail">
            <strong>Trọng lượng:</strong> {bookDetail.weight || 0}g
          </p>
          <p className="bookdetail-detail">
            <strong>Tác giả:</strong>{' '}
            <span
              onClick={() => handleAuthorClick(bookDetail.author?.authorId, bookDetail.author?.authorName)}
              style={{ cursor: 'pointer', color: '#3b82f6' }}
            >
              {bookDetail.author?.authorName || 'Không rõ'}
            </span>
          </p>
          <p className="bookdetail-detail">
            <strong>Danh mục:</strong>{' '}
            {bookDetail.categories?.length > 0
              ? bookDetail.categories.map((cat) => (
                  <span
                    key={cat.categoryId}
                    onClick={() => handleCategoryClick(cat.categoryId, cat.categoryName)}
                    style={{ cursor: 'pointer', color: '#3b82f6', marginRight: '5px' }}
                  >
                    {cat.categoryName}
                  </span>
                ))
              : 'Không có danh mục'}
          </p>
          <p className="bookdetail-detail">
            <strong>Nhà xuất bản:</strong>{' '}
            <span
              onClick={() => handlePublisherClick(bookDetail.publisher?.publisherId, bookDetail.publisher?.publisherName)}
              style={{ cursor: 'pointer', color: '#3b82f6' }}
            >
              {bookDetail.publisher?.publisherName || 'Không rõ'}
            </span>
          </p>
          <p className="bookdetail-detail">
            <strong>Nhà phát hành:</strong>{' '}
            <span
              onClick={() => handleDistributorClick(bookDetail.distributor?.distributorId, bookDetail.distributor?.distributorName)}
              style={{ cursor: 'pointer', color: '#3b82f6' }}
            >
              {bookDetail.distributor?.distributorName || 'Không rõ'}
            </span>
          </p>
          <p className="bookdetail-detail">
            <strong>Loại bìa:</strong> {bookDetail.bookType?.bookTypeName || 'Không rõ'}
          </p>
          <div className="bookdetail-cart">
            <div className="bookdetail-quantity">
              <button onClick={handleDecreaseQuantity} disabled={quantity <= 1}>
                -
              </button>
              <input type="number" value={quantity} onChange={handleQuantityChange} min="1" max={bookDetail.inStock || 1} />
              <button onClick={handleIncreaseQuantity} disabled={quantity >= (bookDetail.inStock || 1)}>
                +
              </button>
            </div>
            <button
              className="bookdetail-add-to-cart"
              onClick={handleAddToCart}
              disabled={isAdding || cartLoading}
            >
              {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
            </button>
          </div>
        </div>
      </div>
      <div className="bookdetail-description">
        <h2>Mô tả sách</h2>
        <p style={{ whiteSpace: 'pre-wrap' }}>{bookDetail.description || 'Không có mô tả'}</p>
      </div>
      <div className="bookdetail-reviews">
        <h2>Đánh giá ({totalReviews || 0})</h2>
        {isAuthenticated && (
          <form className="bookdetail-review-form" onSubmit={handleReviewSubmit}>
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="Nhập đánh giá của bạn..."
              required
              maxLength="2000"
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
                    <span className="bookdetail-review-user">{review.userReviewed || 'Ẩn danh'}</span>
                    <span className="bookdetail-review-date">
                      {formatCreatedAt(review.createdAt)}
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
                        maxLength="2000"
                      />
                    </>
                  ) : (
                    <>
                      <div className="bookdetail-review-rating">{renderStars(review.rating)}</div>
                      <div className="bookdetail-review-content">
                        {splitIntoLines(review.content).map((line, index) => (
                          <p key={`line-${index}`} style={{ margin: '0 0 4px 0' }}>
                            {line}
                          </p>
                        ))}
                      </div>
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