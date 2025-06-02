import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { verifyOTP, clearRegisterEmail } from '../authSlice';
import { toast } from 'react-toastify';
import './VerifyOTP.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const email = useSelector((state) => state.auth.registerEmail);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Chỉ cho phép số
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Lấy ký tự cuối cùng
    setOtp(newOtp);

    // Chuyển focus sang ô tiếp theo nếu nhập đủ 1 ký tự
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Xử lý phím Backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, ''); // Chỉ lấy số
    if (paste.length >= 6) {
      const newOtp = paste.slice(0, 6).split('');
      setOtp(newOtp);
      inputRefs.current[5].focus();
    }
    e.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (!email) {
      toast.error('Không tìm thấy email đăng ký!');
      navigate('/register');
      return;
    }
    if (otpCode.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số OTP!');
      return;
    }
    dispatch(verifyOTP({ email, otp: otpCode })).then((result) => {
      console.log('Verify OTP result:', result);
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(clearRegisterEmail());
        navigate('/login');
      } else {
      }
    });
  };

  return (
    <div className="verify-otp-container">
      <h2>Xác Minh OTP</h2>
      <p className="instruction">Vui lòng nhập mã OTP 6 số đã được gửi đến email của bạn</p>
      <form onSubmit={handleSubmit}>
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              ref={(el) => (inputRefs.current[index] = el)}
              className="otp-input"
              required
            />
          ))}
        </div>
        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Đang xác nhận...' : 'Xác Nhận'}
        </button>
      </form>
      <div className="text-center">
        <a href="/resend-otp" className="link">
          Gửi lại OTP
        </a>
      </div>
    </div>
  );
};

export default VerifyOTP;