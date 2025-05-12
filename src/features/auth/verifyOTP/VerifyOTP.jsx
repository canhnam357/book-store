import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { verifyOTP, clearRegisterEmail } from '../authSlice';
import { toast } from 'react-toastify';
import './VerifyOTP.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const email = useSelector((state) => state.auth.registerEmail);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Không tìm thấy email đăng ký!');
      navigate('/register');
      return;
    }

    dispatch(verifyOTP({ email, otp })).then((result) => {
      console.log('Verify OTP result:', result);
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(clearRegisterEmail());
        navigate('/login');
      }
    });
  };

  return (
    <div className="verify-otp-container">
      <h2>Xác Nhận OTP</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nhập OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Đang xác nhận...' : 'Xác Nhận'}
        </button>
      </form>
    </div>
  );
};

export default VerifyOTP;