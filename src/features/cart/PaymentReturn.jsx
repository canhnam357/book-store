import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './PaymentReturn.css';

const PaymentReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paymentStatus = searchParams.get('paymentStatus');
  const orderId = searchParams.get('orderId');
  const paymentTime = searchParams.get('paymentTime');
  const transactionId = searchParams.get('transactionId');
  const totalPrice = searchParams.get('totalPrice');

  useEffect(() => {
    if (paymentStatus === '1') {
      toast.success('Thanh toán thành công!');
    } else {
      toast.error('Thanh toán thất bại!');
    }
  }, [paymentStatus]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleRedirect = () => {
    navigate(paymentStatus === '1' ? '/orders' : '/cart');
  };

  return (
    <div className="payment-return-container">
      <h2>Kết quả thanh toán</h2>
      <div className={`payment-return-status ${paymentStatus === '1' ? 'success' : 'failure'}`}>
        {paymentStatus === '1' ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
      </div>
      <div className="payment-return-details">
        <p>
          <strong>Mã đơn hàng:</strong> {orderId || 'N/A'}
        </p>
        <p>
          <strong>Thời gian thanh toán:</strong> {formatDateTime(paymentTime)}
        </p>
        <p>
          <strong>Mã giao dịch:</strong> {transactionId || 'N/A'}
        </p>
        <p>
          <strong>Tổng tiền:</strong> {formatPrice(totalPrice)}
        </p>
      </div>
      <button className="payment-return-button" onClick={handleRedirect}>
        {paymentStatus === '1' ? 'Xem đơn hàng' : 'Quay lại giỏ hàng'}
      </button>
    </div>
  );
};

export default PaymentReturn;