import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtpResetPassword, changePassword, resetOtpSent } from '../../features/change-password/changePasswordSlice';
import ProfileSidebar from '../profile/ProfileSidebar';
import './ChangePassword.css';
import { toast } from 'react-toastify';

const ChangePassword = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { otpSent, loading } = useSelector((state) => state.changePassword);
  const [formData, setFormData] = useState({
    otp: '',
    password: '',
    newPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    letter: false,
    number: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
    return () => {
      dispatch(resetOtpSent());
    };
  }, [isAuthenticated, dispatch]);

  const validatePassword = (password) => {
    const lengthValid = password.length >= 8 && password.length <= 32;
    const letterValid = /[a-zA-Z]/.test(password);
    const numberValid = /[0-9]/.test(password);
    setPasswordErrors({
      length: lengthValid,
      letter: letterValid,
      number: numberValid,
    });
    return lengthValid && letterValid && numberValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'newPassword') {
      validatePassword(value);
    }
  };

  const handleSendOtp = async () => {
    const result = await dispatch(sendOtpResetPassword()).unwrap();
    console.log('Send OTP result:', result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword(formData.newPassword)) {
      toast.dismiss();
      toast.error('Mật khẩu mới phải dài từ 8 đến 32 ký tự, có ít nhất một chữ cái và một chữ số!');
      return;
    }
    const result = await dispatch(
      changePassword({
        otp: formData.otp,
        password: formData.password,
        newPassword: formData.newPassword,
      })
    ).unwrap();
    console.log('Change password result:', result);
    setFormData({ otp: '', password: '', newPassword: '' });
    setPasswordErrors({ length: false, letter: false, number: false });
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
              {formData.newPassword && (
                <div className="password-feedback show">
                  <p className={passwordErrors.length ? 'valid' : 'invalid'}>
                    • Độ dài 8 - 32
                  </p>
                  <p className={passwordErrors.letter ? 'valid' : 'invalid'}>
                    • Có ít nhất một chữ cái
                  </p>
                  <p className={passwordErrors.number ? 'valid' : 'invalid'}>
                    • Có ít nhất một chữ số
                  </p>
                </div>
              )}
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