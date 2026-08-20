import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col, Card, Button } from 'react-bootstrap';
import '../Style/ExternalLinkRow.scss';
import { useEventBranding } from '@/contexts/EventBrandingContext';

const PAGARME = 'https://id.pagar.me/signin';

const toAbsoluteUrl = (url) => {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  return /^(https?:)?\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const ExternalLinkRow = () => {
  const { oldSpreadsheetUrl } = useEventBranding();
  const spreadsheetHref = toAbsoluteUrl(oldSpreadsheetUrl);

  return (
    <Row className="mt-4 p-0">
      <Col xs={12} className="text-center ps-5-custom">
        <Card>
          <Card.Body>
            <Card.Title className="fw-bold text-teal-blue">Utilitários</Card.Title>
            <Card.Text>Clique no botão abaixo para acessar a planilha das inscrições do ano anterior e Pagar.me</Card.Text>
            <div className="btn-wrapper">
              <Button className='pagarme-btn' variant="outline-teal-blue" href={PAGARME} target="_blank" rel="noopener noreferrer">
                <strong>PAGAR.ME</strong>
              </Button>
              {spreadsheetHref && (
                <Button variant="teal-blue" href={spreadsheetHref} target="_blank" rel="noopener noreferrer">
                  <strong>PLANILHA ANTIGA</strong>
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ExternalLinkRow;
