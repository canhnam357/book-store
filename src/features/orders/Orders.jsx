import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchOrders, fetchOrderDetails, changeOrderStatus, fetchPaymentDetail } from '../../features/orders/orderSlice';
import ProfileSidebar from '../profile/ProfileSidebar';
import { toast } from 'react-toastify';
import './Orders.css';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, orderDetails, pagination, loading, paymentDetail, paymentDetailLoading } = useSelector((state) => state.orders);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [cancelOrderData, setCancelOrderData] = useState({ orderId: null, fromStatus: '', cause: '' });
  const [isFetchingDetails, setIsFetchingDetails] = useState(false); // State để theo dõi tải chi tiết

  const orderStatuses = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'PENDING', label: 'Chờ duyệt' },
    { value: 'REJECTED', label: 'Bị từ chối' },
    { value: 'IN_PREPARATION', label: 'Đang chuẩn bị hàng' },
    { value: 'READY_TO_SHIP', label: 'Chuẩn bị giao' },
    { value: 'DELIVERING', label: 'Đang giao' },
    { value: 'DELIVERED', label: 'Đã giao' },
    { value: 'CANCELLED', label: 'Đã huỷ' },
    { value: 'FAILED_DELIVERY', label: 'Giao thất bại' },
    { value: 'RETURNED', label: 'Đã hoàn hàng' },
  ];

  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    dispatch(fetchOrders({ index: currentPage, size: 10, orderStatus: selectedStatus }));
  }, [dispatch, isAuthenticated, currentPage, selectedStatus]);

  const handleStatusFilterChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const toggleOrderDetails = async (orderId) => {
    scrollPositionRef.current = window.scrollY;

    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
      if (!orderDetails[orderId]) {
        setIsFetchingDetails(true); // Bật spinner khi tải chi tiết
        try {
          const result = await dispatch(fetchOrderDetails(orderId)).unwrap();
          console.log('Fetch order details result:', result);
        } catch (error) {
          toast.error(error || 'Lỗi khi lấy chi tiết đơn hàng!');
        } finally {
          setIsFetchingDetails(false); // Tắt spinner sau khi tải xong
        }
      }
    }

    setTimeout(() => {
      window.scrollTo(0, scrollPositionRef.current);
    }, 0);
  };

  const handleOpenCancelModal = (orderId, fromStatus) => {
    setCancelOrderData({ orderId, fromStatus, cause: '' });
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setCancelOrderData({ orderId: null, fromStatus: '', cause: '' });
  };

  const handleChangeOrderStatus = async () => {
    const { orderId, fromStatus, cause } = cancelOrderData;
    if (!cause.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn!');
      return;
    }
    try {
      const result = await dispatch(
        changeOrderStatus({ orderId, fromStatus, toStatus: 'CANCELLED', cause })
      ).unwrap();
      console.log('Change order status result:', result);
      handleCloseCancelModal();
    } catch (error) {
      toast.error(error || 'Lỗi khi hủy đơn hàng!');
    }
  };

  const handlePaymentRedirect = (paymentUrl) => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    } else {
      toast.error('Không tìm thấy liên kết thanh toán!');
    }
  };

  const handleOpenPaymentDetailModal = async (orderId) => {
    try {
      const result = await dispatch(fetchPaymentDetail(orderId)).unwrap();
      console.log('Fetch payment detail result:', result);
      setShowPaymentDetailModal(true);
    } catch (error) {
      toast.dismiss();
      toast.error(error || 'Lỗi khi lấy chi tiết thanh toán!');
    }
  };

  const handleClosePaymentDetailModal = () => {
    setShowPaymentDetailModal(false);
  };

  const getStatusLabel = (status) => {
    const statusObj = orderStatuses.find((s) => s.value === status);
    return statusObj ? statusObj.label : status || 'N/A';
  };

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="payment-status-pending">Đang thanh toán</span>;
      case 'SUCCESS':
        return <span className="payment-status-success">Thanh toán thành công</span>;
      case 'FAILED':
        return <span className="payment-status-failed">Thanh toán thất bại</span>;
      default:
        return status || 'N/A';
    }
  };

  const formatOrderDate = (dateString) => {
    if (!dateString) return 'N/A';
    const dateRegex = /^(\d{2}):(\d{2}):(\d{2}) (\d{2})-(\d{2})-(\d{4})$/;
    if (dateRegex.test(dateString)) {
      return dateString;
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
    } catch {
      return 'N/A';
    }
  };

  const formatPayDate = (payDate) => {
    if (!payDate || !/^\d{14}$/.test(payDate)) return 'N/A';
    try {
      const year = payDate.slice(0, 4);
      const month = payDate.slice(4, 6);
      const day = payDate.slice(6, 8);
      const hours = payDate.slice(8, 10);
      const minutes = payDate.slice(10, 12);
      const seconds = payDate.slice(12, 14);
      return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
    } catch {
      return 'N/A';
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="orders-container">
      {(loading || isFetchingDetails) && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <ProfileSidebar />
      <div className="orders-content">
        <h2 className="orders-title">Danh sách đơn hàng</h2>
        <div className="orders-filter">
          <label>Lọc theo trạng thái:</label>
          <select
            value={selectedStatus}
            onChange={handleStatusFilterChange}
            className="orders-status-select"
          >
            {orderStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
        <div className="orders-list">
          {(orders?.length || 0) === 0 ? (
            <p>Chưa có đơn hàng nào!</p>
          ) : (
            orders.map((order) => (
              <div key={order.orderId} className="orders-item">
                <div className="orders-summary">
                  <p>
                    <strong>Mã đơn hàng:</strong> {order.orderId || 'N/A'}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{' '}
                    <span className={`orders-status orders-status-${order.orderStatus}`}>
                      {getStatusLabel(order.orderStatus)}
                    </span>
                  </p>
                  <p>
                    <strong>Phương thức thanh toán:</strong>{' '}
                    {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thẻ tín dụng'}
                  </p>
                  {order.paymentMethod !== 'COD' && (
                    <p>
                      <strong>Trạng thái thanh toán:</strong>{' '}
                      {getPaymentStatusLabel(order.paymentStatus)}
                      {order.paymentMethod === 'CARD' && order.paymentStatus === 'PENDING' && order.paymentUrl && (
                        <button
                          className="orders-payment-button"
                          onClick={() => handlePaymentRedirect(order.paymentUrl)}
                        >
                          Thanh toán
                        </button>
                      )}
                      {order.paymentMethod === 'CARD' && order.paymentStatus === 'SUCCESS' && (
                        <button
                          className="orders-payment-detail-button"
                          onClick={() => handleOpenPaymentDetailModal(order.orderId)}
                          disabled={paymentDetailLoading}
                        >
                          Xem chi tiết thanh toán
                        </button>
                      )}
                    </p>
                  )}
                  {(order.refundStatus === 'REFUNDED' || 
                    (order.refundStatus !== 'REFUNDED' && order.refundTimesRemain === 0)) && (
                    <p>
                      <strong>Trạng thái hoàn tiền:</strong>{' '}
                      {order.refundStatus === 'REFUNDED' ? (
                        <span className="orders-refund-status orders-refund-status-REFUNDED">
                          Hoàn tiền thành công, vui lòng kiểm tra email để xem thông tin chi tiết
                        </span>
                      ) : (
                        <span className="orders-refund-status orders-refund-status-FAILED_REFUND">
                          Hoàn tiền thất bại, vui lòng liên hệ quản trị viên để hoàn tiền
                        </span>
                      )}
                    </p>
                  )}
                  {order.refundStatus === 'REFUNDED' && order.refundAt && (
                    <p>
                      <strong>Thời gian hoàn tiền:</strong> {formatOrderDate(order.refundAt)}
                    </p>
                  )}
                  <p className="wrapped-text">
                    <strong>Địa chỉ:</strong> {order.address || 'N/A'}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {order.phoneNumber || 'N/A'}
                  </p>
                  <p>
                    <strong>Ngày đặt hàng:</strong> {formatOrderDate(order.orderAt)}
                  </p>
                  <p>
                    <strong>Tổng tiền:</strong> {formatPrice(order.totalPrice)}
                  </p>
                  <div className="orders-actions">
                    <button
                      className="orders-details-button"
                      onClick={() => toggleOrderDetails(order.orderId)}
                    >
                      {expandedOrderId === order.orderId ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                    </button>
                    {(order.orderStatus === 'PENDING' || order.orderStatus === 'IN_PREPARATION') && (
                      <button
                        className="orders-cancel-button"
                        onClick={() => handleOpenCancelModal(order.orderId, order.orderStatus)}
                        disabled={loading}
                      >
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </div>
                {expandedOrderId === order.orderId && orderDetails[order.orderId] && (
                  <div className="orders-details">
                    <h4>Chi tiết đơn hàng</h4>
                    {(orderDetails[order.orderId]?.length || 0) === 0 ? (
                      <p>Không có sản phẩm nào trong đơn hàng này!</p>
                    ) : (
                      <table className="orders-details-table">
                        <thead>
                          <tr>
                            <th>Hình ảnh</th>
                            <th>Tên sách</th>
                            <th>Đơn giá</th>
                            <th>Số lượng</th>
                            <th>Tổng tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderDetails[order.orderId].map((detail) => (
                            <tr key={detail.orderDetailId}>
                              <td>
                                {detail.urlThumbnail ? (
                                  <img
                                    src={detail.urlThumbnail}
                                    alt={detail.bookName || 'Sách'}
                                    className="orders-book-thumbnail"
                                  />
                                ) : (
                                  'Không có ảnh'
                                )}
                              </td>
                              <td>
                                <Link to={`/books/${detail.bookId}`}>
                                  {detail.bookName || 'N/A'}
                                </Link>
                              </td>
                              <td>
                                {detail.priceAfterSales !== null ? (
                                  <>
                                    <span
                                      style={{
                                        textDecoration: 'line-through',
                                        color: '#4a5568',
                                        marginRight: '8px',
                                      }}
                                    >
                                      {formatPrice(detail.price)}
                                    </span>
                                    <span style={{ color: '#ef4444' }}>
                                      {formatPrice(detail.priceAfterSales)}
                                    </span>
                                  </>
                                ) : (
                                  <span style={{ color: '#ef4444' }}>
                                    {formatPrice(detail.price)}
                                  </span>
                                )}
                              </td>
                              <td>{detail.quantity || 0}</td>
                              <td>{formatPrice(detail.totalPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {(orders?.length || 0) > 0 && (
          <div className="orders-pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={pagination.first}
              className="orders-pagination-button"
            >
              Trang trước
            </button>
            <span>
              Trang {currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={pagination.last}
              className="orders-pagination-button"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

      {showCancelModal && (
        <div className="orders-modal">
          <div className="orders-modal-content">
            <h3>Lý do hủy đơn hàng</h3>
            <textarea
              className="orders-cancel-reason"
              value={cancelOrderData.cause}
              onChange={(e) =>
                setCancelOrderData({ ...cancelOrderData, cause: e.target.value })
              }
              placeholder="Nhập lý do hủy đơn hàng..."
              rows="4"
            />
            <div className="orders-modal-actions">
              <button
                className="orders-modal-button orders-modal-cancel"
                onClick={handleCloseCancelModal}
              >
                Hủy
              </button>
              <button
                className="orders-modal-button orders-modal-confirm"
                onClick={handleChangeOrderStatus}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentDetailModal && paymentDetail && (
        <div className="orders-payment-detail-modal">
          <div className="orders-payment-detail-modal-content">
            <h3>Chi tiết thanh toán</h3>
            <p>
              <strong>Số tiền:</strong> {formatPrice(paymentDetail.amount)}
            </p>
            <p>
              <strong>Ngày thanh toán:</strong> {formatPayDate(paymentDetail.payDate)}
            </p>
            <p>
              <strong>Mã ngân hàng:</strong> {paymentDetail.bankCode || 'N/A'}
            </p>
            <div className="orders-modal-actions">
              <button
                className="orders-modal-button orders-modal-cancel"
                onClick={handleClosePaymentDetailModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;