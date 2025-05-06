import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../authSlice';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    if (error === 'account_locked') {
      // Thông báo đã được hiển thị trong authSlice.js, nhưng bạn có thể thêm logic bổ sung nếu cần
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/');
      }
    });
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/api/auth/oauth2/authorization/google';
  };

  return (
    <div className="login-container">
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
        </button>
      </form>
      <button onClick={handleGoogleLogin} className="google-button">
        Đăng Nhập bằng Google
      </button>
      <div className="text-center">
        <a href="/forgot-password" className="link">
          Quên mật khẩu?
        </a>
      </div>
      <div className="text-center">
        <a href="/register" className="link">
          Chưa có tài khoản? Đăng ký
        </a>
      </div>
    </div>
  );
};

export default Login;