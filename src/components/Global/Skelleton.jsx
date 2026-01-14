import { useContext } from 'react';
import { Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';
import Header from './Header';
import Footer from './Footer';

const Skelleton = () => {
  const navigate = useNavigate();
  const { formContext } = useContext(AuthContext);

  return (
    <div className="form">
      <div className="components-container">
        <Header />
        <div className="form__container">
          <Card className="form__container__general-height">
            <Card.Body className="skelleton-card-body"></Card.Body>
          </Card>
        </div>

        <Footer
          handleAdminClick={formContext === 'maintenance' ? () => navigate('/dev') : () => navigate('/admin')}
        />
      </div>
    </div>
  );
};

export default Skelleton;
