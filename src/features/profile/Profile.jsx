import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, changeAvatar, changeProfile } from '../../features/profile/profileSlice';
import ProfileSidebar from './ProfileSidebar';
import { toast } from 'react-toastify';
import './Profile.css';

const DateInputCustom = ({ value, onChange, disabled }) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Chuyển yyyy-MM-dd sang các giá trị ngày, tháng, năm, định dạng đúng
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-');
      setDay(d.padStart(2, '0')); // Định dạng ngày: "9" → "09"
      setMonth(m.replace(/^0+/, '')); // Loại bỏ số 0 thừa, "03" → "3"
      setYear(y.padStart(4, '0')); // Định dạng năm: "1" → "0001"
    } else {
      setDay('');
      setMonth('');
      setYear('');
    }
  }, [value]);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Tháng ${i + 1}`,
  }));

  const handleDayChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '').replace(/^0+/, ''); // Loại bỏ ký tự không phải số và số 0 đầu
    setDay(val);
    updateDate(val, month, year);
  };

  const handleMonthChange = (e) => {
    const val = e.target.value;
    setMonth(val);
    updateDate(day, val, year);
  };

  const handleYearChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '').replace(/^0+/, ''); // Loại bỏ ký tự không phải số và số 0 đầu
    setYear(val);
    updateDate(day, month, val);
  };

  const updateDate = (d, m, y) => {
    if (!d && !m && !y) {
      onChange('');
      return;
    }
    if (d && m && y && !isNaN(d) && !isNaN(m) && !isNaN(y)) {
      const dateStr = `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      onChange(dateStr);
    } else {
      onChange(''); // Reset nếu không hợp lệ
    }
  };

  return (
    <div className="date-input-custom">
      <input
        type="text"
        placeholder="Ngày"
        value={day}
        onChange={handleDayChange}
        disabled={disabled}
        className="profile-input date-input-custom-day"
      />
      <select
        value={month}
        onChange={handleMonthChange}
        disabled={disabled}
        className="profile-input date-input-custom-month"
      >
        <option value="" disabled>
          Tháng
        </option>
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Năm"
        value={year}
        onChange={handleYearChange}
        disabled={disabled}
        className="profile-input date-input-custom-year"
      />
    </div>
  );
};

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
    dateOfBirth: '', // Lưu giá trị y-M-d
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

  // Hàm chuyển đổi từ dd-MM-yyyy sang y-M-d (khi nhận từ API)
  const convertToInputFormat = (dateStr) => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`; // y-M-d
  };

  // Hàm chuyển đổi từ y-M-d sang dd-MM-yyyy (khi gửi API)
  const convertToApiFormat = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year.padStart(4, '0')}`; // dd-MM-yyyy
  };

  useEffect(() => {
    if (profile) {
      const profileData = {
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        avatar: profile.avatar || null,
        gender: profile.gender || 'OTHER',
        dateOfBirth: convertToInputFormat(profile.dateOfBirth) || '', // Chuyển dd-MM-yyyy sang y-M-d
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
      setFormData((prev) => ({ ...prev, avatar: result.avatar || prev.avatar }));
    } catch (error) {
      console.error('Lỗi khi thay đổi avatar:', error);
    }
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
  };

  const isLeapYear = (year) => {
    const y = parseInt(year);
    return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  };

  const validateDateOfBirth = (dateStr) => {
    if (!dateStr) {
      toast.dismiss();
      toast.error('Vui lòng nhập đầy đủ ngày sinh!');
      return false;
    }

    const [year, month, day] = dateStr.split('-');
    // Kiểm tra rỗng trước
    if (day === '' || month === '' || year === '') {
      toast.dismiss();
      toast.error('Vui lòng nhập đầy đủ ngày sinh!');
      return false;
    }

    // Convert thành số
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Kiểm tra NaN sau khi parse
    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
      toast.dismiss();
      toast.error('Vui lòng nhập đầy đủ ngày sinh!');
      return false;
    }

    const maxDays = [31, isLeapYear(yearNum) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][monthNum - 1];

    if (monthNum < 1 || monthNum > 12) {
      toast.dismiss();
      toast.error('Tháng phải từ 1 đến 12!');
      return false;
    }

    if (yearNum < 1 || yearNum > 2025) {
      toast.dismiss();
      toast.error('Năm phải từ 1 đến 2025!');
      return false;
    }

    if (dayNum < 1 || dayNum > maxDays) {
      if (monthNum === 2 && dayNum === 29) {
        toast.dismiss();
        toast.error(`Năm ${yearNum} không phải năm nhuận, tháng 2 chỉ có 28 ngày!`);
      } else {
        toast.dismiss();
        toast.error(`Tháng ${monthNum} chỉ có ${maxDays} ngày!`);
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (formData.fullName && formData.fullName.length > 50) {
      toast.dismiss();
      toast.error('Họ và tên có độ dài tối đa 50 ký tự!');
      return;
    }

    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      toast.dismiss();
      toast.error('Số điện thoại phải gồm 10 chữ số!');
      return;
    }

    if (!formData.dateOfBirth || !validateDateOfBirth(formData.dateOfBirth)) {
      return; // Lỗi đã hiển thị trong validateDateOfBirth
    }

    try {
      const updatedProfile = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        dateOfBirth: convertToApiFormat(formData.dateOfBirth), // Chuyển y-M-d sang dd-MM-yyyy
      };
      await dispatch(changeProfile(updatedProfile)).unwrap();
      setOriginalFormData({ ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
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
            <DateInputCustom
              value={formData.dateOfBirth}
              onChange={(newDate) => setFormData((prev) => ({ ...prev, dateOfBirth: newDate }))}
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