import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  fetchOrders,
  fetchOrderDetails,
  changeOrderStatus,
} from './orderSlice';
import ProfileSidebar from '../profile/ProfileSidebar';
import './Orders.css';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, orderDetails, pagination, loading } = useSelector((state) => state.orders);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const orderStatuses = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'PENDING', label: 'Chờ duyệt' },
    { value: 'REJECTED', label: 'Bị từ chối' },
    { value: 'IN_PREPARATION', label: 'Đang chuẩn bị hàng' },
    { value: 'CANCELLATION_REQUESTED', label: 'Đã gửi yêu cầu hủy đơn' },
    { value: 'READY_TO_SHIP', label: 'Chuẩn bị giao' },
    { value: 'DELIVERING', label: 'Đang giao' },
    { value: 'DELIVERED', label: 'Đã giao' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];

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
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
      if (!orderDetails[orderId]) {
        try {
          await dispatch(fetchOrderDetails(orderId)).unwrap();
        } catch (error) {
          toast.error(error);
        }
      }
    }
  };

  const handleChangeOrderStatus = async (orderId, fromStatus, toStatus) => {
    try {
      await dispatch(changeOrderStatus({ orderId, fromStatus, toStatus })).unwrap();
      toast.success(
        toStatus === 'CANCELLED'
          ? 'Hủy đơn thành công!'
          : 'Gửi yêu cầu hủy đơn thành công!'
      );
    } catch (error) {
      toast.error(error);
    }
  };

  const getStatusLabel = (status) => {
    const statusObj = orderStatuses.find((s) => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) return <p className="orders-loading">Đang tải danh sách đơn hàng...</p>;

  return (
    <div className="orders-container">
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
          {orders.length === 0 ? (
            <p>Chưa có đơn hàng nào!</p>
          ) : (
            orders.map((order) => (
              <div key={order.orderId} className="orders-item">
                <div className="orders-summary">
                  <p>
                    <strong>Mã đơn hàng:</strong> {order.orderId}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{' '}
                    <span className={`orders-status orders-status-${order.orderStatus}`}>
                      {getStatusLabel(order.orderStatus)}
                    </span>
                  </p>
                  <p>
                    <strong>Phương thức thanh toán:</strong> {order.paymentMethod}
                  </p>
                  <p>
                    <strong>Trạng thái thanh toán:</strong> {order.paymentStatus}
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong> {order.address}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {order.phoneNumber}
                  </p>
                  <p>
                    <strong>Ngày đặt hàng:</strong> {formatDate(order.orderAt)}
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
                    {order.orderStatus === 'PENDING' && (
                      <button
                        className="orders-cancel-button"
                        onClick={() =>
                          handleChangeOrderStatus(order.orderId, 'PENDING', 'CANCELLED')
                        }
                        disabled={loading}
                      >
                        Hủy đơn
                      </button>
                    )}
                    {order.orderStatus === 'IN_PREPARATION' && (
                      <button
                        className="orders-cancel-request-button"
                        onClick={() =>
                          handleChangeOrderStatus(
                            order.orderId,
                            'IN_PREPARATION',
                            'CANCELLATION_REQUESTED'
                          )
                        }
                        disabled={loading}
                      >
                        Gửi yêu cầu hủy đơn
                      </button>
                    )}
                  </div>
                </div>
                {expandedOrderId === order.orderId && orderDetails[order.orderId] && (
                  <div className="orders-details">
                    <h4>Chi tiết đơn hàng</h4>
                    {orderDetails[order.orderId].length === 0 ? (
                      <p>Không có sản phẩm nào trong đơn hàng này!</p>
                    ) : (
                      <table className="orders-details-table">
                        <thead>
                          <tr>
                            <th>Hình ảnh</th>
                            <th>Tên sách</th>
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
                                    alt={detail.bookName}
                                    className="orders-book-thumbnail"
                                  />
                                ) : (
                                  'Không có ảnh'
                                )}
                              </td>
                              <td>{detail.bookName}</td>
                              <td>{detail.quantity}</td>
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
        {orders.length > 0 && (
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
    </div>
  );
};

export default Orders;