import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const OLD_SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/1Fxb0cYp42SNixTJC8VshUpN1IuZkiDADxO9hWHQ9exw/edit?usp=sharing';
const PAGARME = 'https://id.pagar.me/signin';

const AdminExternalLinkRow = () => {
  const navigate = useNavigate();

  return (
    <Row className="mt-4 p-0">
      <Col xs={12} className="text-center" style={{ padding: '0 0 0 1.25rem' }}>
        <Card>
          <Card.Body>
            <Card.Title className="fw-bold text-success">Link da Planilha</Card.Title>
            <Card.Text>Clique no botão abaixo para acessar a planilha das inscrições de 2024 e Pagar.me</Card.Text>
            <div className="btn-wrapper">
              <Button variant="info" href={PAGARME} target="_blank">
                <strong>PAGAR.ME</strong>
              </Button>
              <Button variant="warning" href={OLD_SPREADSHEET_URL} target="_blank">
                <strong>PLANILHA ANTIGA</strong>
              </Button>
              <Button variant="success" onClick={() => navigate('/admin/logs')}>
                <strong>LOGS DE USUÁRIOS</strong>
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AdminExternalLinkRow;
