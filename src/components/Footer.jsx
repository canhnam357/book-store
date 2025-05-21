import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">Liên Hệ</h3>
          <ul className="footer-list">
            <li className="footer-item">
              <span className="footer-label">Số điện thoại:</span> 0702055000
            </li>
            <li className="footer-item">
              <span className="footer-label">Facebook:</span>
              <a href="https://www.facebook.com/zuck" target="_blank" rel="noopener noreferrer" className="footer-link">
                Trần Cảnh Nam
              </a>
            </li>
            <li className="footer-item">
              <span className="footer-label">Email:</span>
              <a href="mailto:canhnam357@gmail.com" className="footer-link">
                canhnam357@gmail.com
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Liên Kết Nhanh</h3>
          <ul className="footer-list">
            <li className="footer-item">
              <a href="/books" className="footer-link">Sản Phẩm</a>
            </li>
            <li className="footer-item">
              <a href="/cart" className="footer-link">Giỏ Hàng</a>
            </li>
            <li className="footer-item">
              <a href="/profile" className="footer-link">Tài Khoản</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Hỗ Trợ Khách Hàng</h3>
          <ul className="footer-list">
            <li className="footer-item">
              <a href="/policy" className="footer-link">Chính Sách Đổi Trả</a>
            </li>
            <li className="footer-item">
              <a href="/contact" className="footer-link">Liên Hệ Hỗ Trợ</a>
            </li>
            <li className="footer-item">
              <a href="/guide" classNama="footer-link">Hướng Dẫn Mua Hàng</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Về Book Store</h3>
          <ul className="footer-list">
            <li className="footer-item">Địa chỉ: 123 Đường Sách, Quận 1, TP. Hồ Chí Minh</li>
            <li className="footer-item">
              <a href="/about" className="footer-link">Giới Thiệu</a>
            </li>
            <li className="footer-item">
              <a href="/terms" className="footer-link">Điều Khoản Sử Dụng</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          © 2025 Book Store. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;