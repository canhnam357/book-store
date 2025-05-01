import { Link, useLocation } from 'react-router-dom';
import './ProfileSidebar.css';

const ProfileSidebar = () => {
  const location = useLocation();

  return (
    <div className="profile-sidebar">
      <h2 className="profile-sidebar-title">Tài khoản</h2>
      <ul className="profile-sidebar-menu">
        <li>
          <Link
            to="/profile"
            className={`profile-sidebar-link ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            Thông tin cá nhân
          </Link>
        </li>
        <li>
          <Link
            to="/change-password"
            className={`profile-sidebar-link ${location.pathname === '/change-password' ? 'active' : ''}`}
          >
            Đổi mật khẩu
          </Link>
        </li>
        <li>
          <Link
            to="/addresses"
            className={`profile-sidebar-link ${location.pathname === '/addresses' ? 'active' : ''}`}
          >
            Địa chỉ
          </Link>
        </li>
        <li>
          <Link
            to="/orders"
            className={`profile-sidebar-link ${location.pathname === '/orders' ? 'active' : ''}`}
          >
            Đơn mua
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default ProfileSidebar;