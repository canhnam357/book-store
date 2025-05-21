import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../authSlice';
import { toast } from 'react-toastify';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    letter: false,
    number: false,
  });
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

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

    if (name === 'password') {
      validatePassword(value);
    }
    if (name === 'confirmPassword' || name === 'password') {
      setConfirmPasswordError(
        formData.password !== value && name === 'confirmPassword'
          ? 'Mật khẩu và xác nhận mật khẩu không khớp!'
          : ''
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { fullName, email, phoneNumber, password, confirmPassword } = formData;

    if (!validatePassword(password)) {
      toast.error('Mật khẩu phải dài từ 8 đến 32 ký tự, có ít nhất một chữ cái và một chữ số!');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Mật khẩu và xác nhận mật khẩu không khớp!');
      return;
    }

    dispatch(registerUser({ fullName, email, phoneNumber, password, confirmPassword })).then((result) => {
      console.log('Register result:', result);
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/verify-otp');
      }
    });
  };

  return (
    <div className="register-container">
      <h2>Đăng Ký</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Họ và Tên</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {formData.password && (
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
          {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
        </button>
      </form>
      <div className="text-center">
        <a href="/login" className="link">
          Đã có tài khoản? Đăng nhập
        </a>
      </div>
    </div>
  );
};

export default Register;