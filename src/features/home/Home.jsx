import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNewArrivals, fetchHighRatedBooks, fetchMostPopularBooks, fetchDiscountBooks, fetchTopCategories } from '../../features/home/homeSlice';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const dispatch = useDispatch();
  const { newArrivals, highRated, mostPopular, discountBooks, topCategories, loading } = useSelector((state) => state.home);

  useEffect(() => {
    dispatch(fetchNewArrivals());
    dispatch(fetchHighRatedBooks());
    dispatch(fetchMostPopularBooks());
    dispatch(fetchDiscountBooks());
    dispatch(fetchTopCategories());
  }, [dispatch]);

  const [currentIndex, setCurrentIndex] = useState({});

  const handleNext = (section, categoryId = null) => {
    setCurrentIndex((prev) => {
      const key = categoryId ? `category_${categoryId}` : section;
      const length = getSectionLength(section, categoryId);
      return {
        ...prev,
        [key]: ((prev[key] || 0) + 1) % length,
      };
    });
  };

  const handlePrev = (section, categoryId = null) => {
    setCurrentIndex((prev) => {
      const key = categoryId ? `category_${categoryId}` : section;
      const length = getSectionLength(section, categoryId);
      return {
        ...prev,
        [key]: ((prev[key] || 0) - 1 + length) % length,
      };
    });
  };

  const getSectionLength = (section, categoryId = null) => {
    if (categoryId) {
      const category = topCategories?.find((cat) => cat.categoryId === categoryId);
      return category?.books?.length || 0;
    }
    switch (section) {
      case 'newArrivals':
        return newArrivals?.length || 0;
      case 'highRated':
        return highRated?.length || 0;
      case 'mostPopular':
        return mostPopular?.length || 0;
      case 'discountBooks':
        return discountBooks?.length || 0;
      default:
        return 0;
    }
  };

  const getBooksForSection = (section) => {
    const books = section === 'newArrivals' ? newArrivals :
                  section === 'highRated' ? highRated :
                  section === 'mostPopular' ? mostPopular : discountBooks;
    if (!books || books.length === 0) return [];
    const index = currentIndex[section] || 0;
    const startIndex = index % books.length;
    const displayCount = Math.min(6, books.length);
    const endIndex = (startIndex + displayCount) % books.length;
    if (startIndex < endIndex) {
      return books.slice(startIndex, endIndex);
    } else {
      return [...books.slice(startIndex), ...books.slice(0, endIndex)];
    }
  };

  const getBooksForCategory = (categoryId, books) => {
    if (!books || books.length === 0) return [];
    const index = currentIndex[`category_${categoryId}`] || 0;
    const startIndex = index % books.length;
    const displayCount = Math.min(6, books.length);
    const endIndex = (startIndex + displayCount) % books.length;
    if (startIndex < endIndex) {
      return books.slice(startIndex, endIndex);
    } else {
      return [...books.slice(startIndex), ...books.slice(0, endIndex)];
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="home-container">
      <h1>Chào mừng đến với BookStore!</h1>

      <section className="home-section">
        <h2>Sách mới</h2>
        <div className="home-carousel">
          {(newArrivals?.length || 0) >= 5 && (
            <button onClick={() => handlePrev('newArrivals')} className="home-prev-btn">
              ←
            </button>
          )}
          <div className="home-book-list">
            {getBooksForSection('newArrivals').map((book) => {
              const optimizedUrl = book.urlThumbnail ? `${book.urlThumbnail}?w=120&f=auto&q=auto` : '/no-image.png';
              return (
                <div key={book.bookId} className="home-book-card">
                  <Link to={`/books/${book.bookId}`}>
                    <div className="home-book-image-wrapper">
                      <img
                        src={optimizedUrl}
                        alt={book.bookName || 'Sách'}
                        loading="lazy"
                        width="120"
                        height="160"
                      />
                      <div className="home-new-tag">Mới</div>
                    </div>
                  </Link>
                  <Link to={`/books/${book.bookId}`}>
                    <h3 className="home-book-title">{truncateText(book.bookName, 20)}</h3>
                  </Link>
                  <p className="home-book-price">
                    {(book.priceAfterSale || book.price || 0).toLocaleString('vi-VN')} VND
                  </p>
                </div>
              );
            })}
          </div>
          {(newArrivals?.length || 0) >= 5 && (
            <button onClick={() => handleNext('newArrivals')} className="home-next-btn">
              →
            </button>
          )}
        </div>
      </section>

      <section className="home-section">
        <h2>Sách khuyến mãi</h2>
        <div className="home-carousel">
          {(discountBooks?.length || 0) >= 5 && (
            <button onClick={() => handlePrev('discountBooks')} className="home-prev-btn">
              ←
            </button>
          )}
          <div className="home-book-list">
            {getBooksForSection('discountBooks').map((book) => {
              const optimizedUrl = book.urlThumbnail ? `${book.urlThumbnail}?w=120&f=auto&q=auto` : '/no-image.png';
              return (
                <div key={book.bookId} className="home-book-card">
                  <Link to={`/books/${book.bookId}`}>
                    <div className="home-book-image-wrapper">
                      <img
                        src={optimizedUrl}
                        alt={book.bookName || 'Sách'}
                        loading="lazy"
                        width="120"
                        height="160"
                      />
                      {book.priceAfterSale && <div className="home-discount-tag">Khuyến mãi</div>}
                    </div>
                  </Link>
                  <Link to={`/books/${book.bookId}`}>
                    <h3 className="home-book-title">{truncateText(book.bookName, 20)}</h3>
                  </Link>
                  <p className="home-book-price">
                    {book.priceAfterSale ? (
                      <>
                        <span className="home-book-price-original">
                          {(book.price || 0).toLocaleString('vi-VN')}
                        </span>
                        <span>{(book.priceAfterSale || 0).toLocaleString('vi-VN')} VND</span>
                      </>
                    ) : (
                      <span>{(book.price || 0).toLocaleString('vi-VN')} VND</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
          {(discountBooks?.length || 0) >= 5 && (
            <button onClick={() => handleNext('discountBooks')} className="home-next-btn">
              →
            </button>
          )}
        </div>
      </section>

      <section className="home-section">
        <h2>Sách được đánh giá cao</h2>
        <div className="home-carousel">
          {(highRated?.length || 0) >= 5 && (
            <button onClick={() => handlePrev('highRated')} className="home-prev-btn">
              ←
            </button>
          )}
          <div className="home-book-list">
            {getBooksForSection('highRated').map((book) => {
              const optimizedUrl = book.urlThumbnail ? `${book.urlThumbnail}?w=120&f=auto&q=auto` : '/no-image.png';
              return (
                <div key={book.bookId} className="home-book-card">
                  <Link to={`/books/${book.bookId}`}>
                    <div className="home-book-image-wrapper">
                      <img
                        src={optimizedUrl}
                        alt={book.bookName || 'Sách'}
                        loading="lazy"
                        width="120"
                        height="160"
                      />
                    </div>
                  </Link>
                  <Link to={`/books/${book.bookId}`}>
                    <h3 className="home-book-title">{truncateText(book.bookName, 20)}</h3>
                  </Link>
                  <p className="home-book-price">
                    {(book.priceAfterSale || book.price || 0).toLocaleString('vi-VN')} VND
                  </p>
                  <p className="home-book-rating">Rating: {book.rating || 'N/A'}</p>
                </div>
              );
            })}
          </div>
          {(highRated?.length || 0) >= 5 && (
            <button onClick={() => handleNext('highRated')} className="home-next-btn">
              →
            </button>
          )}
        </div>
      </section>

      <section className="home-section">
        <h2>Sách được mua nhiều</h2>
        <div className="home-carousel">
          {(mostPopular?.length || 0) >= 5 && (
            <button onClick={() => handlePrev('mostPopular')} className="home-prev-btn">
              ←
            </button>
          )}
          <div className="home-book-list">
            {getBooksForSection('mostPopular').map((book) => {
              const optimizedUrl = book.urlThumbnail ? `${book.urlThumbnail}?w=120&f=auto&q=auto` : '/no-image.png';
              return (
                <div key={book.bookId} className="home-book-card">
                  <Link to={`/books/${book.bookId}`}>
                    <div className="home-book-image-wrapper">
                      <img
                        src={optimizedUrl}
                        alt={book.bookName || 'Sách'}
                        loading="lazy"
                        width="120"
                        height="160"
                      />
                    </div>
                  </Link>
                  <Link to={`/books/${book.bookId}`}>
                    <h3 className="home-book-title">{truncateText(book.bookName, 20)}</h3>
                  </Link>
                  <p className="home-book-price">
                    <span>{(book.priceAfterSale || book.price || 0).toLocaleString('vi-VN')} VND</span>
                    <span className="home-book-sold">Đã bán: {(book.soldQuantity || 0).toLocaleString('vi-VN')}</span>
                  </p>
                </div>
              );
            })}
          </div>
          {(mostPopular?.length || 0) >= 5 && (
            <button onClick={() => handleNext('mostPopular')} className="home-next-btn">
              →
            </button>
          )}
        </div>
      </section>

      <section className="home-section">
        <h2>Những thể loại hay</h2>
        {(topCategories || []).map((category) => (
          <div key={category.categoryId} className="home-category-section">
            <h3>{category.categoryName || 'N/A'}</h3>
            <div className="home-carousel">
              {(category.books?.length || 0) >= 5 && (
                <button
                  onClick={() => handlePrev('category', category.categoryId)}
                  className="home-prev-btn"
                >
                  ←
                </button>
              )}
              <div className="home-book-list">
                {getBooksForCategory(category.categoryId, category.books || []).map((book) => {
                  const optimizedUrl = book.urlThumbnail ? `${book.urlThumbnail}?w=120&f=auto&q=auto` : '/no-image.png';
                  return (
                    <div key={book.bookId} className="home-book-card">
                      <Link to={`/books/${book.bookId}`}>
                        <div className="home-book-image-wrapper">
                          <img
                            src={optimizedUrl}
                            alt={book.bookName || 'Sách'}
                            loading="lazy"
                            width="120"
                            height="160"
                          />
                        </div>
                      </Link>
                      <Link to={`/books/${book.bookId}`}>
                        <h3 className="home-book-title">{truncateText(book.bookName, 20)}</h3>
                      </Link>
                      <p className="home-book-price">
                        {(book.priceAfterSale || book.price || 0).toLocaleString('vi-VN')} VND
                      </p>
                    </div>
                  );
                })}
              </div>
              {(category.books?.length || 0) >= 5 && (
                <button
                  onClick={() => handleNext('category', category.categoryId)}
                  className="home-next-btn"
                >
                  →
                </button>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;