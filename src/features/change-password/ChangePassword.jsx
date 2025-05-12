import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtpResetPassword, changePassword, resetOtpSent } from '../../features/change-password/changePasswordSlice'; // Fixed path
import ProfileSidebar from '../profile/ProfileSidebar';
import './ChangePassword.css';

const ChangePassword = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { otpSent, loading } = useSelector((state) => state.changePassword);
  const [formData, setFormData] = useState({
    otp: '',
    password: '',
    newPassword: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
    return () => {
      dispatch(resetOtpSent());
    };
  }, [isAuthenticated, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async () => {
    const result = await dispatch(sendOtpResetPassword()).unwrap();
    console.log('Send OTP result:', result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      changePassword({
        otp: formData.otp,
        password: formData.password,
        newPassword: formData.newPassword,
      })
    ).unwrap();
    console.log('Change password result:', result);
    setFormData({ otp: '', password: '', newPassword: '' });
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