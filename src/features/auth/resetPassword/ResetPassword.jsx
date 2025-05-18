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
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Mảng 6 ô OTP
  const email = useSelector((state) => state.auth.resetPasswordEmail);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) { // Chỉ cho phép số hoặc rỗng
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Chuyển focus sang ô tiếp theo nếu nhập số
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Chuyển focus về ô trước khi xóa
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) { // Kiểm tra chuỗi dán là 6 số
      const newOtp = pastedData.split('').slice(0, 6);
      setOtp(newOtp);
      document.getElementById('otp-5').focus(); // Focus ô cuối
    } else {
      toast.dismiss();
      toast.error('Vui lòng dán mã OTP gồm 6 số!');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { newPassword, confirmPassword } = formData;
    const otpString = otp.join(''); // Nối mảng OTP thành chuỗi

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

    if (newPassword.length < 8 || newPassword.length > 32) {
      toast.dismiss();
      toast.error('Mật khẩu mới phải dài từ 8 đến 32 ký tự!');
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
                onPaste={index === 0 ? handleOtpPaste : undefined} // Chỉ xử lý paste ở ô đầu
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
        </div>
        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Đang reset...' : 'Reset Mật Khẩu'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;