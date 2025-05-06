import { useNavigate } from 'react-router-dom';
import homeImage from '../assets/home_image.jpg';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate('/books');
  };

  return (
    <div className="home">
      <div className="home-hero">
        <img src={homeImage} alt="Book Store Hero" className="home-image" />
        <button onClick={handleShopNow} className="home-shop-button">
          Mua Ngay
        </button>
      </div>
    </div>
  );
};

export default Home;