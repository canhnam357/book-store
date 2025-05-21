import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { resetPassword, clearResetPasswordEmail } from '../authSlice';
import { toast } from 'react-toastify';
import './ResetPassword.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    letter: false,
    number: false,
  });
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const email = useSelector((state) => state.auth.resetPasswordEmail);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'newPassword') {
      validatePassword(value);
    }
    if (name === 'confirmPassword' || name === 'newPassword') {
      setConfirmPasswordError(
        formData.newPassword !== value && name === 'confirmPassword'
          ? 'Mật khẩu mới và xác nhận mật khẩu không khớp!'
          : ''
      );
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('').slice(0, 6);
      setOtp(newOtp);
      document.getElementById('otp-5').focus();
    } else {
      toast.dismiss();
      toast.error('Vui lòng dán mã OTP gồm 6 số!');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { newPassword, confirmPassword } = formData;
    const otpString = otp.join('');

    if (!email) {
      toast.dismiss();
      toast.error('Không tìm thấy email!');
      navigate('/forgot-password');
      return;
    }

    if (otpString.length !== 6 || !/^\d{6}$/.test(otpString)) {
      toast.dismiss();
      toast.error('Vui lòng nhập mã OTP gồm 6 số!');
      return;
    }

    if (!validatePassword(newPassword)) {
      toast.dismiss();
      toast.error('Mật khẩu mới phải dài từ 8 đến 32 ký tự, có ít nhất một chữ cái và một chữ số!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.dismiss();
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    dispatch(resetPassword({ otp: otpString, email, newPassword, confirmPassword })).then((result) => {
      console.log('Reset password result:', result);
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(clearResetPasswordEmail());
        navigate('/login');
      }
    });
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Mật Khẩu</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>OTP</label>
          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                className="otp-input"
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                onPaste={index === 0 ? handleOtpPaste : undefined}
                maxLength="1"
                pattern="[0-9]"
                required
              />
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Mật khẩu mới</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
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
        <div className="form-group">
          <label>Xác nhận mật khẩu</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {confirmPasswordError && (
            <p className="error-message">{confirmPasswordError}</p>
          )}
        </div>
        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Đang reset...' : 'Reset Mật Khẩu'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;