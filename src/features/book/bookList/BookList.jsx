import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPriceRange,
  fetchCategories,
  fetchAuthors,
  fetchPublishers,
  fetchDistributors,
  fetchBooks,
  clearFilters,
} from '../bookSlice';
import { Range } from 'react-range';
import BookCard from '../bookCard/BookCard';
import './BookList.css';

const BookList = () => {
  const dispatch = useDispatch();
  const {
    priceRange,
    categories,
    authors,
    publishers,
    distributors,
    books,
    totalPages,
    currentPage,
    totalElements,
    loading,
  } = useSelector((state) => state.book);

  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 0,
    index: 1,
    size: 10,
    sort: '',
    bookName: '',
    authorId: '',
    publisherId: '',
    distributorId: '',
    categoryId: '',
  });

  const [categorySearch, setCategorySearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [publisherSearch, setPublisherSearch] = useState('');
  const [distributorSearch, setDistributorSearch] = useState('');

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedPublishers, setSelectedPublishers] = useState([]);
  const [selectedDistributors, setSelectedDistributors] = useState([]);

  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreAuthors, setShowMoreAuthors] = useState(false);
  const [showMorePublishers, setShowMorePublishers] = useState(false);
  const [showMoreDistributors, setShowMoreDistributors] = useState(false);

  const ITEMS_LIMIT = 5;

  // Fetch price range and set default min/max
  useEffect(() => {
    dispatch(fetchPriceRange()).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        const prices = result.payload;
        if (prices && prices.length > 0) {
          setFilters((prev) => ({
            ...prev,
            minPrice: prices[0] || 0,
            maxPrice: prices[prices.length - 1] || 0,
          }));
        }
      }
    });
  }, [dispatch]);

  // Fetch initial filter options
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAuthors());
    dispatch(fetchPublishers());
    dispatch(fetchDistributors());
  }, [dispatch]);

  // Update filters when selections change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      categoryId: selectedCategories.map((cat) => cat.categoryId).join(','),
      authorId: selectedAuthors.map((auth) => auth.authorId).join(','),
      publisherId: selectedPublishers.map((pub) => pub.publisherId).join(','),
      distributorId: selectedDistributors.map((dist) => dist.distributorId).join(','),
      index: 1,
    }));
  }, [selectedCategories, selectedAuthors, selectedPublishers, selectedDistributors]);

  // Fetch books when filters change
  useEffect(() => {
    if (filters.minPrice && filters.maxPrice) {
      dispatch(fetchBooks(filters));
    }
  }, [dispatch, filters]);

  // Search categories
  const handleCategorySearch = (e) => {
    const keyword = e.target.value;
    setCategorySearch(keyword);
    dispatch(fetchCategories(keyword));
  };

  // Search authors
  const handleAuthorSearch = (e) => {
    const keyword = e.target.value;
    setAuthorSearch(keyword);
    dispatch(fetchAuthors(keyword));
  };

  // Search publishers
  const handlePublisherSearch = (e) => {
    const keyword = e.target.value;
    setPublisherSearch(keyword);
    dispatch(fetchPublishers(keyword));
  };

  // Search distributors
  const handleDistributorSearch = (e) => {
    const keyword = e.target.value;
    setDistributorSearch(keyword);
    dispatch(fetchDistributors(keyword));
  };

  // Handle price range change with react-range
  const handlePriceRangeChange = (values) => {
    const minPrice = priceRange[values[0]];
    const maxPrice = priceRange[values[1]];
    setFilters((prev) => ({
      ...prev,
      minPrice,
      maxPrice,
      index: 1,
    }));
  };

  // Handle book name, sort, and size change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, index: 1 }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, index: page }));
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategories((prev) => [...prev, category]);
  };

  const handleCategoryRemove = (categoryId) => {
    setSelectedCategories((prev) => prev.filter((cat) => cat.categoryId !== categoryId));
  };

  // Handle author selection
  const handleAuthorSelect = (author) => {
    setSelectedAuthors((prev) => [...prev, author]);
  };

  const handleAuthorRemove = (authorId) => {
    setSelectedAuthors((prev) => prev.filter((auth) => auth.authorId !== authorId));
  };

  // Handle publisher selection
  const handlePublisherSelect = (publisher) => {
    setSelectedPublishers((prev) => [...prev, publisher]);
  };

  const handlePublisherRemove = (publisherId) => {
    setSelectedPublishers((prev) => prev.filter((pub) => pub.publisherId !== publisherId));
  };

  // Handle distributor selection
  const handleDistributorSelect = (distributor) => {
    setSelectedDistributors((prev) => [...prev, distributor]);
  };

  const handleDistributorRemove = (distributorId) => {
    setSelectedDistributors((prev) => prev.filter((dist) => dist.distributorId !== distributorId));
  };

  // Reset filters
  const handleResetFilters = () => {
    dispatch(clearFilters());
    setFilters({
      minPrice: priceRange[0] || 0,
      maxPrice: priceRange[priceRange.length - 1] || 0,
      index: 1,
      size: 10,
      sort: '',
      bookName: '',
      authorId: '',
      publisherId: '',
      distributorId: '',
      categoryId: '',
    });
    setSelectedCategories([]);
    setSelectedAuthors([]);
    setSelectedPublishers([]);
    setSelectedDistributors([]);
    setCategorySearch('');
    setAuthorSearch('');
    setPublisherSearch('');
    setDistributorSearch('');
    setShowMoreCategories(false);
    setShowMoreAuthors(false);
    setShowMorePublishers(false);
    setShowMoreDistributors(false);
    dispatch(fetchCategories());
    dispatch(fetchAuthors());
    dispatch(fetchPublishers());
    dispatch(fetchDistributors());
  };

  // Filter available options (exclude selected ones)
  const availableCategories = categories.filter(
    (cat) => !selectedCategories.some((selected) => selected.categoryId === cat.categoryId)
  );
  const availableAuthors = authors.filter(
    (auth) => !selectedAuthors.some((selected) => selected.authorId === auth.authorId)
  );
  const availablePublishers = publishers.filter(
    (pub) => !selectedPublishers.some((selected) => selected.publisherId === pub.publisherId)
  );
  const availableDistributors = distributors.filter(
    (dist) => !selectedDistributors.some((selected) => selected.distributorId === dist.distributorId)
  );

  // Tính minPriceIndex và maxPriceIndex, đảm bảo không bị -1
  let minPriceIndex = priceRange.indexOf(filters.minPrice);
  let maxPriceIndex = priceRange.indexOf(filters.maxPrice);

  if (minPriceIndex === -1) minPriceIndex = 0; // Giá trị mặc định nếu không tìm thấy
  if (maxPriceIndex === -1) maxPriceIndex = priceRange.length > 0 ? priceRange.length - 1 : 0;

  // Logic hiển thị phân trang
  const getPageNumbers = () => {
    const delta = 2; // Số trang hiển thị trước và sau trang hiện tại
    const range = [];
    const rangeWithDots = [];

    // Tính khoảng trang cần hiển thị
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    // Luôn thêm trang đầu
    range.push(1);

    // Thêm các trang từ start đến end
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Luôn thêm trang cuối nếu totalPages > 1
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Thêm dấu "..." nếu cần
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

  return (
    <div className="book-list-container">
      <div className="booklist-filter-panel">
        <h2>Bộ Lọc</h2>
        <div className="booklist-filter-group">
          <label>Tên sách</label>
          <input
            type="text"
            name="bookName"
            value={filters.bookName}
            onChange={handleFilterChange}
            placeholder="Nhập tên sách..."
          />
        </div>
        <div className="booklist-filter-group">
          <label>Khoảng giá (VNĐ)</label>
          {priceRange.length > 0 && minPriceIndex >= 0 && maxPriceIndex >= 0 ? (
            <>
              <div className="booklist-range-slider">
                <Range
                  values={[minPriceIndex, maxPriceIndex]}
                  step={1}
                  min={0}
                  max={priceRange.length - 1}
                  onChange={(values) => handlePriceRangeChange(values)}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        height: '6px',
                        width: '100%',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '3px',
                        position: 'relative',
                      }}
                    >
                      <div
                        className="booklist-range-fill"
                        style={{
                          height: '6px',
                          background: '#3b82f6',
                          borderRadius: '3px',
                          position: 'absolute',
                          left: `${(minPriceIndex / (priceRange.length - 1)) * 100}%`,
                          width: `${((maxPriceIndex - minPriceIndex) / (priceRange.length - 1)) * 100}%`,
                        }}
                      />
                      {children}
                    </div>
                  )}
                  renderThumb={({ props }) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        height: '16px',
                        width: '16px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%',
                        cursor: 'pointer',
                      }}
                    />
                  )}
                />
              </div>
              <div className="booklist-price-range-values">
                <span>{filters.minPrice.toLocaleString('vi-VN')} VNĐ</span>
                <span>{filters.maxPrice.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </>
          ) : (
            <p>Đang tải khoảng giá...</p>
          )}
        </div>
        <div className="booklist-filter-group">
          <label>Sắp xếp theo giá</label>
          <select name="sort" value={filters.sort} onChange={handleFilterChange}>
            <option value="">Mặc định</option>
            <option value="asc">Tăng dần</option>
            <option value="desc">Giảm dần</option>
          </select>
        </div>
        <div className="booklist-filter-group">
          <label>Danh mục</label>
          <input
            type="text"
            value={categorySearch}
            onChange={handleCategorySearch}
            placeholder="Tìm kiếm danh mục..."
          />
          {selectedCategories.length > 0 && (
            <div className="booklist-selected-items">
              {selectedCategories.map((category) => (
                <div key={category.categoryId} className="booklist-selected-item">
                  <span>{category.categoryName || 'Không có tên'}</span>
                  <button
                    className="booklist-remove-item"
                    onClick={() => handleCategoryRemove(category.categoryId)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="booklist-checkbox-list">
            {(showMoreCategories ? availableCategories : availableCategories.slice(0, ITEMS_LIMIT)).map(
              (category) => (
                <div key={category.categoryId} className="booklist-checkbox-item">
                  <input
                    type="checkbox"
                    id={`category-${category.categoryId}`}
                    checked={selectedCategories.some((cat) => cat.categoryId === category.categoryId)}
                    onChange={() => handleCategorySelect(category)}
                  />
                  <label htmlFor={`category-${category.categoryId}`}>
                    {category.categoryName || 'Không có tên danh mục'}
                  </label>
                </div>
              )
            )}
            {availableCategories.length > ITEMS_LIMIT && (
              <button
                className="booklist-show-more-button"
                onClick={() => setShowMoreCategories(!showMoreCategories)}
              >
                {showMoreCategories ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
        </div>
        <div className="booklist-filter-group">
          <label>Tác giả</label>
          <input
            type="text"
            value={authorSearch}
            onChange={handleAuthorSearch}
            placeholder="Tìm kiếm tác giả..."
          />
          {selectedAuthors.length > 0 && (
            <div className="booklist-selected-items">
              {selectedAuthors.map((author) => (
                <div key={author.authorId} className="booklist-selected-item">
                  <span>{author.authorName || 'Không có tên'}</span>
                  <button
                    className="booklist-remove-item"
                    onClick={() => handleAuthorRemove(author.authorId)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="booklist-checkbox-list">
            {(showMoreAuthors ? availableAuthors : availableAuthors.slice(0, ITEMS_LIMIT)).map((author) => (
              <div key={author.authorId} className="booklist-checkbox-item">
                <input
                  type="checkbox"
                  id={`author-${author.authorId}`}
                  checked={selectedAuthors.some((auth) => auth.authorId === author.authorId)}
                  onChange={() => handleAuthorSelect(author)}
                />
                <label htmlFor={`author-${author.authorId}`}>
                  {author.authorName || 'Không có tên tác giả'}
                </label>
              </div>
            ))}
            {availableAuthors.length > ITEMS_LIMIT && (
              <button
                className="booklist-show-more-button"
                onClick={() => setShowMoreAuthors(!showMoreAuthors)}
              >
                {showMoreAuthors ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
        </div>
        <div className="booklist-filter-group">
          <label>Nhà xuất bản</label>
          <input
            type="text"
            value={publisherSearch}
            onChange={handlePublisherSearch}
            placeholder="Tìm kiếm nhà xuất bản..."
          />
          {selectedPublishers.length > 0 && (
            <div className="booklist-selected-items">
              {selectedPublishers.map((publisher) => (
                <div key={publisher.publisherId} className="booklist-selected-item">
                  <span>{publisher.publisherName || 'Không có tên'}</span>
                  <button
                    className="booklist-remove-item"
                    onClick={() => handlePublisherRemove(publisher.publisherId)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="booklist-checkbox-list">
            {(showMorePublishers ? availablePublishers : availablePublishers.slice(0, ITEMS_LIMIT)).map(
              (publisher) => (
                <div key={publisher.publisherId} className="booklist-checkbox-item">
                  <input
                    type="checkbox"
                    id={`publisher-${publisher.publisherId}`}
                    checked={selectedPublishers.some((pub) => pub.publisherId === publisher.publisherId)}
                    onChange={() => handlePublisherSelect(publisher)}
                  />
                  <label htmlFor={`publisher-${publisher.publisherId}`}>
                    {publisher.publisherName || 'Không có tên nhà xuất bản'}
                  </label>
                </div>
              )
            )}
            {availablePublishers.length > ITEMS_LIMIT && (
              <button
                className="booklist-show-more-button"
                onClick={() => setShowMorePublishers(!showMorePublishers)}
              >
                {showMorePublishers ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
        </div>
        <div className="booklist-filter-group">
          <label>Nhà phát hành</label>
          <input
            type="text"
            value={distributorSearch}
            onChange={handleDistributorSearch}
            placeholder="Tìm kiếm nhà phát hành..."
          />
          {selectedDistributors.length > 0 && (
            <div className="booklist-selected-items">
              {selectedDistributors.map((distributor) => (
                <div key={distributor.distributorId} className="booklist-selected-item">
                  <span>{distributor.distributorName || 'Không có tên'}</span>
                  <button
                    className="booklist-remove-item"
                    onClick={() => handleDistributorRemove(distributor.distributorId)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="booklist-checkbox-list">
            {(showMoreDistributors ? availableDistributors : availableDistributors.slice(0, ITEMS_LIMIT)).map(
              (distributor) => (
                <div key={distributor.distributorId} className="booklist-checkbox-item">
                  <input
                    type="checkbox"
                    id={`distributor-${distributor.distributorId}`}
                    checked={selectedDistributors.some((dist) => dist.distributorId === distributor.distributorId)}
                    onChange={() => handleDistributorSelect(distributor)}
                  />
                  <label htmlFor={`distributor-${distributor.distributorId}`}>
                    {distributor.distributorName || 'Không có tên nhà phát hành'}
                  </label>
                </div>
              )
            )}
            {availableDistributors.length > ITEMS_LIMIT && (
              <button
                className="booklist-show-more-button"
                onClick={() => setShowMoreDistributors(!showMoreDistributors)}
              >
                {showMoreDistributors ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
        </div>
        <button className="booklist-reset-button" onClick={handleResetFilters}>
          Xóa Bộ Lọc
        </button>
      </div>
      <div className="booklist-book-list">
        <h2>Danh Sách Sách ({totalElements} kết quả)</h2>
        {loading ? (
          <p>Đang tải sách...</p>
        ) : books.length === 0 ? (
          <p>Không tìm thấy sách nào!</p>
        ) : (
          <>
            <div className="booklist-book-grid">
              {books.map((book) => (
                <BookCard key={book.bookId} book={book} />
              ))}
            </div>
            <div className="booklist-pagination">
              <div className="booklist-page-size">
                <label htmlFor="pageSize">Hiển thị: </label>
                <select
                  id="pageSize"
                  name="size"
                  value={filters.size}
                  onChange={handleFilterChange}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div className="booklist-page-buttons">
                {/* Nút "Qua trái" */}
                {currentPage > 1 && (
                  <button
                    className="booklist-page-button booklist-nav-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    &lt;
                  </button>
                )}
                {/* Danh sách trang */}
                {getPageNumbers().map((page, index) =>
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="booklist-ellipsis">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      className={`booklist-page-button ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
                )}
                {/* Nút "Qua phải" */}
                {currentPage < totalPages && (
                  <button
                    className="booklist-page-button booklist-nav-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    &gt;
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookList;