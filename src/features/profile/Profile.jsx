import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../api/api';
import ProfileSidebar from './ProfileSidebar';
import './Profile.css';

const Profile = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    avatar: null,
    gender: 'OTHER',
    dateOfBirth: '',
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    fetchProfile();
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/profile');
      if (response.status === 200) {
        const data = response.data.result;
        const profileData = {
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
          email: data.email || '',
          avatar: data.avatar || null,
          gender: data.gender || 'OTHER',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        };
        setProfile(profileData);
        setOriginalProfile(profileData);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Tài khoản của bạn đang bị khóa!');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setAvatarLoading(true);
    try {
      const response = await api.post('/user/change-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: { image: file.name },
      });
      if (response.status === 200) {
        const newAvatarUrl = response.data.result;
        setProfile((prev) => ({ ...prev, avatar: newAvatarUrl }));
        setOriginalProfile((prev) => ({ ...prev, avatar: newAvatarUrl }));
        toast.success('Thay đổi avatar thành công!', {
          autoClose: 2000,
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      toast.error('Lỗi khi thay đổi avatar!');
    } finally {
      setAvatarLoading(false);
    }
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleSubmit = async () => {
    if (profile.phoneNumber && !validatePhoneNumber(profile.phoneNumber)) {
      toast.error('Số điện thoại phải gồm 10 chữ số!');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/user/change-profile', {
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber || null,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth || null,
      });
      if (response.status === 200) {
        const updatedProfile = {
          ...profile,
          ...response.data.result,
          dateOfBirth: response.data.result.dateOfBirth
            ? response.data.result.dateOfBirth.split('T')[0]
            : '',
        };
        setProfile(updatedProfile);
        setOriginalProfile(updatedProfile);
        toast.success('Cập nhật thông tin thành công!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật thông tin!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
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

  if (loading) return <p className="profile-loading">Đang tải thông tin...</p>;

  return (
    <div className="profile-container">
      <ProfileSidebar />
      <div className="profile-content">
        <h2 className="profile-title">Thông tin cá nhân</h2>
        <div className="profile-avatar-section">
          <img
            src={profile.avatar || 'https://via.placeholder.com/150'}
            alt="Avatar"
            className="profile-avatar"
          />
          <button
            className="profile-change-avatar-button"
            onClick={() => fileInputRef.current.click()}
            disabled={avatarLoading}
          >
            {avatarLoading ? 'Đang tải...' : 'Thay đổi ảnh'}
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
              value={profile.fullName}
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
              value={profile.phoneNumber}
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
              value={maskEmail(profile.email)}
              className="profile-input"
              disabled
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-label">Giới tính</label>
            <select
              name="gender"
              value={profile.gender}
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
              value={profile.dateOfBirth}
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
                  disabled={loading || avatarLoading}
                >
                  Xác nhận
                </button>
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={handleCancel}
                  disabled={loading || avatarLoading}
                >
                  Hủy
                </button>
              </>
            ) : (
              <button
                type="button"
                className="profile-edit-button"
                onClick={() => setIsEditing(true)}
                disabled={avatarLoading}
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