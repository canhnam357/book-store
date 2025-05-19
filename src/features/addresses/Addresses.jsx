import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  fetchAddresses,
  createAddress,
  deleteAddress,
  updateAddress,
  setDefaultAddress,
} from './addressSlice';
import ProfileSidebar from '../profile/ProfileSidebar';
import './Addresses.css';

const Addresses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addresses, loading } = useSelector((state) => state.addresses);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phoneNumber: '',
    addressInformation: '',
    otherDetail: '',
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editAddress, setEditAddress] = useState({
    fullName: '',
    phoneNumber: '',
    addressInformation: '',
    otherDetail: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      dispatch(fetchAddresses());
    }
  }, [dispatch, isAuthenticated, navigate]);

  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const isValidPhoneNumber = (phone) => /^\d{10,11}$/.test(phone);

  const isValidStringLength = (str) => str.length <= 255;

  const isValidFullNameLength = (str) => str.length <= 50;

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (
      !newAddress.fullName ||
      !newAddress.phoneNumber ||
      !newAddress.addressInformation
    ) {
      toast.dismiss();
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (!isValidFullNameLength(newAddress.fullName)) {
      toast.dismiss();
      toast.error('Họ và tên có tối đa 50 ký tự!');
      return;
    }

    if (!isValidStringLength(newAddress.addressInformation)) {
      toast.dismiss();
      toast.error('Địa chỉ có tối đa 255 ký tự!');
      return;
    }

    if (newAddress.otherDetail && !isValidStringLength(newAddress.otherDetail)) {
      toast.dismiss();
      toast.error('Chi tiết khác có tối đa 255 ký tự!');
      return;
    }

    if (!isValidPhoneNumber(newAddress.phoneNumber)) {
      toast.dismiss();
      toast.error('Số điện thoại phải có 10-11 chữ số!');
      return;
    }
    try {
      const result = await dispatch(createAddress(newAddress)).unwrap();
      console.log('Create address result:', result);
      if (result?.result) {
        setNewAddress({
          fullName: '',
          phoneNumber: '',
          addressInformation: '',
          otherDetail: '',
        });
      }
    } catch (error) {
      console.error('Lỗi khi thêm địa chỉ:', error);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address.addressId);
    setEditAddress({
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      addressInformation: address.addressInformation,
      otherDetail: address.otherDetail || '',
    });
  };

  const handleUpdateAddress = async (addressId) => {
    if (
      !editAddress.fullName ||
      !editAddress.phoneNumber ||
      !editAddress.addressInformation
    ) {
      toast.dismiss();
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (!isValidFullNameLength(editAddress.fullName)) {
      toast.dismiss();
      toast.error('Họ và tên có tối đa 50 ký tự!');
      return;
    }

    if (!isValidStringLength(editAddress.addressInformation)) {
      toast.dismiss();
      toast.error('Địa chỉ có tối đa 255 ký tự!');
      return;
    }

    if (editAddress.otherDetail && !isValidStringLength(editAddress.otherDetail)) {
      toast.dismiss();
      toast.error('Chi tiết khác có tối đa 255 ký tự!');
      return;
    }

    if (!isValidPhoneNumber(editAddress.phoneNumber)) {
      toast.dismiss();
      toast.error('Số điện thoại phải có 10-11 chữ số!');
      return;
    }

    try {
      const result = await dispatch(
        updateAddress({ addressId, addressData: editAddress })
      ).unwrap();
      console.log('Update address result:', result);
      if (result?.result) {
        setEditingAddressId(null);
        setEditAddress({
          fullName: '',
          phoneNumber: '',
          addressInformation: '',
          otherDetail: '',
        });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật địa chỉ:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingAddressId(null);
    setEditAddress({
      fullName: '',
      phoneNumber: '',
      addressInformation: '',
      otherDetail: '',
    });
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Bạn có chắc muốn xóa địa chỉ này không?')) {
      try {
        const result = await dispatch(deleteAddress(addressId)).unwrap();
        console.log('Delete address result:', result);
      } catch (error) {
        console.error('Lỗi khi xóa địa chỉ:', error);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const result = await dispatch(setDefaultAddress(addressId)).unwrap();
      console.log('Set default address result:', result);
    } catch (error) {
      console.error('Lỗi khi đặt địa chỉ mặc định:', error);
    }
  };

  if (loading) return <p className="addresses-loading">Đang tải danh sách địa chỉ...</p>;

  return (
    <div className="addresses-container">
      <ProfileSidebar />
      <div className="addresses-content">
        <h2 className="addresses-title">Danh sách địa chỉ</h2>
        <form className="addresses-form" onSubmit={handleCreateAddress}>
          <h3>Thêm địa chỉ mới</h3>
          <div className="addresses-form-group">
            <label>Họ và tên <span className="required">*</span></label>
            <input
              type="text"
              name="fullName"
              value={newAddress.fullName}
              onChange={(e) => handleInputChange(e, setNewAddress)}
              placeholder="Nhập họ và tên"
              required
            />
          </div>
          <div className="addresses-form-group">
            <label>Số điện thoại <span className="required">*</span></label>
            <input
              type="text"
              name="phoneNumber"
              value={newAddress.phoneNumber}
              onChange={(e) => handleInputChange(e, setNewAddress)}
              placeholder="Nhập số điện thoại"
              required
            />
          </div>
          <div className="addresses-form-group">
            <label>Địa chỉ <span className="required">*</span></label>
            <input
              type="text"
              name="addressInformation"
              value={newAddress.addressInformation}
              onChange={(e) => handleInputChange(e, setNewAddress)}
              placeholder="Nhập địa chỉ"
              required
            />
          </div>
          <div className="addresses-form-group">
            <label>Chi tiết khác</label>
            <input
              type="text"
              name="otherDetail"
              value={newAddress.otherDetail}
              onChange={(e) => handleInputChange(e, setNewAddress)}
              placeholder="Ví dụ: Gần công viên, trong hẻm..."
            />
          </div>
          <button type="submit" className="addresses-submit-button" disabled={loading}>
            Thêm địa chỉ
          </button>
        </form>
        <div className="addresses-list">
          {addresses.length === 0 ? (
            <p>Chưa có địa chỉ nào!</p>
          ) : (
            addresses.map((address) => (
              <div key={address.addressId} className="addresses-item">
                {editingAddressId === address.addressId ? (
                  <>
                    <div className="addresses-form-group">
                      <label>Họ và tên <span className="required">*</span></label>
                      <input
                        type="text"
                        name="fullName"
                        value={editAddress.fullName}
                        onChange={(e) => handleInputChange(e, setEditAddress)}
                        required
                      />
                    </div>
                    <div className="addresses-form-group">
                      <label>Số điện thoại <span className="required">*</span></label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={editAddress.phoneNumber}
                        onChange={(e) => handleInputChange(e, setEditAddress)}
                        required
                      />
                    </div>
                    <div className="addresses-form-group">
                      <label>Địa chỉ <span className="required">*</span></label>
                      <input
                        type="text"
                        name="addressInformation"
                        value={editAddress.addressInformation}
                        onChange={(e) => handleInputChange(e, setEditAddress)}
                        required
                      />
                    </div>
                    <div className="addresses-form-group">
                      <label>Chi tiết khác</label>
                      <input
                        type="text"
                        name="otherDetail"
                        value={editAddress.otherDetail}
                        onChange={(e) => handleInputChange(e, setEditAddress)}
                      />
                    </div>
                    <div className="addresses-actions">
                      <button
                        className="addresses-confirm-button"
                        onClick={() => handleUpdateAddress(address.addressId)}
                        disabled={loading}
                      >
                        Xác nhận
                      </button>
                      <button
                        className="addresses-cancel-button"
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        Hủy
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="addresses-info">
                      <p>
                        <strong>Họ và tên:</strong> {address.fullName}
                        {address.default && <span className="addresses-default-label">Mặc định</span>}
                      </p>
                      <p>
                        <strong>Số điện thoại:</strong> {address.phoneNumber}
                      </p>
                      <p className="wrapped-text">
                        <strong>Địa chỉ:</strong> {address.addressInformation}
                      </p>
                      {address.otherDetail && (
                        <p className="wrapped-text">
                          <strong>Chi tiết khác:</strong> {address.otherDetail}
                        </p>
                      )}
                    </div>
                    <div className="addresses-actions">
                      {!address.default && (
                        <button
                          className="addresses-set-default-button"
                          onClick={() => handleSetDefault(address.addressId)}
                          disabled={loading}
                        >
                          Đặt làm mặc định
                        </button>
                      )}
                      <button
                        className="addresses-edit-button"
                        onClick={() => handleEditAddress(address)}
                        disabled={loading}
                      >
                        Sửa
                      </button>
                      <button
                        className="addresses-delete-button"
                        onClick={() => handleDeleteAddress(address.addressId)}
                        disabled={loading}
                      >
                        Xóa
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Addresses;