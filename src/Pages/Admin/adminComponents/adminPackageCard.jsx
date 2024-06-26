import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Card } from 'react-bootstrap';

const AdminPackageCard = ({ title, remainingVacancies, filledVacancies, background, titleColor }) => (
  <Col className="mb-4" xs={12} md={6} lg={4}>
    <Card className={`h-100 ${background}`}>
      <Card.Body>
        <Card.Title className={`fw-bold ${titleColor}`}>{title}</Card.Title>
        <Card.Text>
          Vagas Restantes:{' '}
          <em>
            <b>{remainingVacancies} </b>
          </em>
          <br />
          Vagas Preenchidas:{' '}
          <em>
            <b>{filledVacancies || '0'}</b>
          </em>
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
);

export default AdminPackageCard;
