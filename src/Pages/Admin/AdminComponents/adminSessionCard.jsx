import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Card } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Icons from '@/components/Icons';

const AdminSessionCard = ({ permission, onClick, cardType, title, typeIcon, iconSize, iconFill }) => (
  <>
    {permission && (
      <Col xs={12} md={6} lg={4} className="mb-3">
        <Card className="h-100" onClick={onClick}>
          <Card.Body className={`navigation-header__${cardType}`}>
            <Card.Title className="text-center mb-0">
              <div className={`navigation-header__${cardType}__content-wrapper`}>
                <em>
                  <b>{title}</b>
                </em>
                <Icons typeIcon={typeIcon} iconSize={iconSize} fill={iconFill ? iconFill : '#204691'} />
              </div>
            </Card.Title>
          </Card.Body>
        </Card>
      </Col>
    )}
  </>
);

AdminSessionCard.propTypes = {
  permission: PropTypes.bool,
  onClick: PropTypes.func,
  cardType: PropTypes.string,
  title: PropTypes.string,
  typeIcon: PropTypes.string,
  iconSize: PropTypes.string,
  iconFill: PropTypes.string,
};

export default AdminSessionCard;
