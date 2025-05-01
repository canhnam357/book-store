import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sendOTPResetPassword } from '../authSlice';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(sendOTPResetPassword(email)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/reset-password');
      }
    });
  };

  return (
    <div className="forgot-password-container">
      <h2>Quên Mật Khẩu</h2>
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
        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Đang gửi OTP...' : 'Gửi OTP'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;