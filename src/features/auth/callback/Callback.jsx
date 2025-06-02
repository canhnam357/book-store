import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleGoogleCallback } from '../authSlice';
import './Callback.css';

const Callback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    const error = params.get('error');

    dispatch(handleGoogleCallback({ accessToken, error })).then((result) => {
      console.log('Google callback result:', result);
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/');
      } else {
        navigate('/login');
      }
    });
  }, [dispatch, navigate, location]);

  return <div className="callback-container">Đang xử lý đăng nhập...</div>;
};

export default Callback;