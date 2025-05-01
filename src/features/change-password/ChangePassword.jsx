import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../api/api';
import ProfileSidebar from '../profile/ProfileSidebar';
import './ChangePassword.css';

const ChangePassword = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    otp: '',
    password: '',
    newPassword: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const response = await api.post('/user/send-otp-reset-password');
      if (response.status === 200) {
        setOtpSent(true);
        toast.success('OTP đã được gửi đến email của bạn!');
      }
    } catch (error) {
      toast.error('Lỗi khi gửi OTP!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/user/change-password', {
        otp: formData.otp,
        password: formData.password,
        newPassword: formData.newPassword,
      });
      if (response.status === 200) {
        toast.success('Đổi mật khẩu thành công!');
        setFormData({ otp: '', password: '', newPassword: '' });
        setOtpSent(false);
      }
    } catch (error) {
      if (error.response?.status === 422) {
        toast.error('Mật khẩu mới phải có độ dài từ 8 đến 32 ký tự!');
      } else if (error.response?.status === 403) {
        toast.error('Mật khẩu hiện tại không đúng!');
      } else if (error.response?.status === 400) {
        toast.error('OTP không đúng!');
      } else if (error.response?.status === 409) {
        toast.error('Mật khẩu mới không được trùng với mật khẩu hiện tại!');
      } else {
        toast.error('Lỗi khi đổi mật khẩu!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <ProfileSidebar />
      <div className="change-password-content">
        <h2 className="change-password-title">Đổi mật khẩu</h2>
        {!otpSent ? (
          <div className="change-password-otp-section">
            <p className="change-password-info">
              Nhấn vào nút bên dưới để nhận OTP qua email.
            </p>
            <button
              className="change-password-send-otp-button"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi OTP'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="change-password-form">
            <div className="change-password-form-group">
              <label className="change-password-label">OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                className="change-password-input"
                required
              />
            </div>
            <div className="change-password-form-group">
              <label className="change-password-label">Mật khẩu hiện tại</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="change-password-input"
                required
              />
            </div>
            <div className="change-password-form-group">
              <label className="change-password-label">Mật khẩu mới</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="change-password-input"
                required
              />
            </div>
            <button
              type="submit"
              className="change-password-submit-button"
              disabled={loading}
            >
              Đổi mật khẩu
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;