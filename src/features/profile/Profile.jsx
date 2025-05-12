import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, changeAvatar, changeProfile } from '../../features/profile/profileSlice';
import ProfileSidebar from './ProfileSidebar';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { profile, loading } = useSelector((state) => state.profile);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    avatar: null,
    gender: 'OTHER',
    dateOfBirth: '',
  });
  const [originalFormData, setOriginalFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    dispatch(fetchProfile());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (profile) {
      const profileData = {
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        avatar: profile.avatar || null,
        gender: profile.gender || 'OTHER',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
      };
      setFormData(profileData);
      setOriginalFormData(profileData);
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await dispatch(changeAvatar(file)).unwrap();
      console.log('Change avatar result:', result);
      setFormData((prev) => ({ ...prev, avatar: result.avatar || prev.avatar }));
      toast.success('Thay đổi avatar thành công!');
    } catch (error) {
      console.error('Lỗi khi thay đổi avatar:', error);
      toast.error(error || 'Lỗi khi thay đổi avatar!');
    }
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleSubmit = async () => {
    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      toast.error('Số điện thoại phải gồm 10 chữ số!');
      return;
    }

    try {
      const result = await dispatch(
        changeProfile({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
        })
      ).unwrap();
      console.log('Change profile result:', result);
      setIsEditing(false);
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      toast.error(error || 'Lỗi khi cập nhật thông tin!');
    }
  };

  const handleCancel = () => {
    setFormData(originalFormData);
    setIsEditing(false);
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    const localStart = localPart.slice(0, 3);
    const localEnd = localPart.slice(-3);
    const maskedLocal = `${localStart}***${localEnd}`;
    const domainStart = domain.slice(0, 3);
    const domainEnd = domain.slice(-3);
    const maskedDomain = `${domainStart}***${domainEnd}`;
    return `${maskedLocal}@${maskedDomain}`;
  };

  return (
    <div className="profile-container">
      <ProfileSidebar />
      <div className="profile-content">
        <h2 className="profile-title">Thông tin cá nhân</h2>
        <div className="profile-avatar-section">
          <img
            src={formData.avatar || 'https://via.placeholder.com/150'}
            alt="Avatar"
            className="profile-avatar"
          />
          <button
            className="profile-change-avatar-button"
            onClick={() => fileInputRef.current.click()}
            disabled={loading}
          >
            {loading ? 'Đang tải...' : 'Thay đổi ảnh'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            className="profile-avatar-input"
            accept="image/*"
            hidden
          />
        </div>
        <div className="profile-form">
          <div className="profile-form-group">
            <label className="profile-label">Họ và tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="profile-input"
              disabled={!isEditing}
              required
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-label">Số điện thoại</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="profile-input"
              disabled={!isEditing}
              pattern="\d{10}"
              title="Số điện thoại phải gồm 10 chữ số"
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-label">Email</label>
            <input
              type="email"
              name="email"
              value={maskEmail(formData.email)}
              className="profile-input"
              disabled
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-label">Giới tính</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="profile-input"
              disabled={!isEditing}
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          <div className="profile-form-group">
            <label className="profile-label">Ngày sinh</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="profile-input"
              disabled={!isEditing}
            />
          </div>
          <div className="profile-form-actions">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="profile-confirm-button"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  Xác nhận
                </button>
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Hủy
                </button>
              </>
            ) : (
              <button
                type="button"
                className="profile-edit-button"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;