import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col, Card, Button } from 'react-bootstrap';

const OLD_SPREADSHEET_URL = 'https://drive.google.com/file/d/1y1mUKZzotMVwnjn16_JkDu-fJCzSEnKW/view?usp=drive_link';
const PAGARME = 'https://id.pagar.me/signin';

const ExternalLinkRow = () => {
  return (
    <Row className="mt-4 p-0">
      <Col xs={12} className="text-center" style={{ padding: '0 0 0 1.25rem' }}>
        <Card>
          <Card.Body>
            <Card.Title className="fw-bold text-success">Utilitários</Card.Title>
            <Card.Text>Clique no botão abaixo para acessar a planilha das inscrições de 2025 e Pagar.me</Card.Text>
            <div className="btn-wrapper">
              <Button variant="teal-blue" href={PAGARME} target="_blank" rel="noopener noreferrer">
                <strong>PAGAR.ME</strong>
              </Button>
              <Button variant="warning" href={OLD_SPREADSHEET_URL} target="_blank" rel="noopener noreferrer">
                <strong>PLANILHA ANTIGA</strong>
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ExternalLinkRow;
