import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './PaymentReturn.css';

const PaymentReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paymentStatus = searchParams.get('paymentStatus') || '0';
  const orderId = searchParams.get('orderId') || 'N/A';
  const paymentTime = searchParams.get('paymentTime') || '';
  const transactionId = searchParams.get('transactionId') || 'N/A';
  const totalPrice = searchParams.get('totalPrice') || '0';

  useEffect(() => {
    console.log('Payment return params:', { paymentStatus, orderId, paymentTime, transactionId, totalPrice });
    if (paymentStatus === '1') {
      toast.success('Thanh toán thành công!');
    } else {
      toast.error('Thanh toán thất bại!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString || dateTimeString.length !== 14) return 'N/A';
    const year = parseInt(dateTimeString.substring(0, 4), 10);
    const month = parseInt(dateTimeString.substring(4, 6), 10) - 1; // Tháng trong JS là 0-based
    const day = parseInt(dateTimeString.substring(6, 8), 10);
    const hour = parseInt(dateTimeString.substring(8, 10), 10);
    const minute = parseInt(dateTimeString.substring(10, 12), 10);
    const second = parseInt(dateTimeString.substring(12, 14), 10);

    const date = new Date(year, month, day, hour, minute, second);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  };

  const formatPrice = (price) => {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNum);
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
          <strong>Mã đơn hàng:</strong> {orderId}
        </p>
        <p>
          <strong>Thời gian thanh toán:</strong> {formatDateTime(paymentTime)}
        </p>
        <p>
          <strong>Mã giao dịch:</strong> {transactionId}
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