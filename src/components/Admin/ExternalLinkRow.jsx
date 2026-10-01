import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import '../Style/ExternalLinkRow.scss';
import { useEventBranding } from '@/contexts/EventBrandingContext';

const PAGARME = 'https://id.pagar.me/signin';

const toAbsoluteUrl = (url) => {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  return /^(https?:)?\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const ExternalLinkRow = () => {
  const { t } = useTranslation();
  const { oldSpreadsheetUrl } = useEventBranding();
  const spreadsheetHref = toAbsoluteUrl(oldSpreadsheetUrl);

  return (
    <Row className="mt-4 p-0">
      <Col xs={12} className="text-center ps-5-custom">
        <Card>
          <Card.Body>
            <Card.Title className="fw-bold text-teal-blue">{t('admin.ui.externalLinks.title')}</Card.Title>
            <Card.Text>{t('admin.ui.externalLinks.text')}</Card.Text>
            <div className="btn-wrapper">
              <Button className='pagarme-btn' variant="outline-teal-blue" href={PAGARME} target="_blank" rel="noopener noreferrer">
                <strong>{t('admin.ui.externalLinks.pagarme')}</strong>
              </Button>
              {spreadsheetHref && (
                <Button variant="teal-blue" href={spreadsheetHref} target="_blank" rel="noopener noreferrer">
                  <strong>{t('admin.ui.externalLinks.oldSpreadsheet')}</strong>
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
