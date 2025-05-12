import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { resetPassword, clearResetPasswordEmail } from '../authSlice';
import { toast } from 'react-toastify';
import './ResetPassword.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const email = useSelector((state) => state.auth.resetPasswordEmail);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { otp, newPassword, confirmPassword } = formData;

    if (!email) {
      toast.error('Không tìm thấy email!');
      navigate('/forgot-password');
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 32) {
      toast.error('Mật khẩu mới phải dài từ 8 đến 32 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    dispatch(resetPassword({ otp, email, newPassword, confirmPassword })).then((result) => {
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
          <input
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            required
          />
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