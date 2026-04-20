import { useEffect, useState } from 'react';
import { Container, Button, Card, Modal, Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import { toast } from 'react-toastify';
import { getHomeInfo } from '@/services/homeInfo';
import './style.scss';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';

const FormHome = ({ nextStep, onLgpdClose }) => {
  const location = useLocation();
  const [showLgpdModal, setShowLgpdModal] = useState(false);
  const [homepageInfo, setHomepageInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const CACHE_KEY = 'homepageInfo';
  const CACHE_TTL = 1000 * 60 * 60;

  const fetchHomepageInfo = async () => {
    const cached = sessionStorage.getItem(CACHE_KEY);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);

      const isValid = Date.now() - timestamp < CACHE_TTL;

      if (isValid) {
        setHomepageInfo(data);
        return;
      }
    }

    setLoading(true);
    try {
      const data = (await getHomeInfo()) || null;

      setHomepageInfo(data);

      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.error('[FormHome] erro ao buscar homepage-info', error);
      toast.error('Erro ao carregar informações da página');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowLgpdModal(true);
    fetchHomepageInfo();
  }, []);

  const handleCloseLgpdModal = () => {
    setShowLgpdModal(false);

    if (location.pathname === '/') {
      toast.info(
        'Favor cadastrar todas as pessoas da sua família, de todas as idades, a partir de 6 meses de vida até idosos. Não se esqueça de incluir seus filhos, mesmo que sejam bem pequenos, pois isso é essencial para o nosso controle de alimentação e para o departamento infantil!',
      );
    }

    if (onLgpdClose) {
      onLgpdClose();
    }
  };

  return (
    <>
      <Card className="form__container__general-height">
        <Card.Body>
          <Container>
            <Row className="text-center">
              <Col>
                <h4 className="mb-3">
                  <b>{homepageInfo?.top?.title}</b>
                </h4>
                <h5>
                  <b className="home-page-subtitle">{homepageInfo?.top?.subtitle}</b>
                </h5>
                <h5 className="info-home-text mb-2">
                  <span className="info-home-enphasis">
                    <span className="d-flex gap-3 mb-3 align-items-center justify-content-center">
                      <Icons className="flex-shrink-0" typeIcon="calendar" iconSize={30} fill="#007185" />
                      {homepageInfo?.top?.locationAndDate}
                    </span>
                    <span className="d-flex gap-3 mb-3 align-items-center justify-content-center">
                      <Icons className="flex-shrink-0" typeIcon="location-pin" iconSize={30} fill="#007185" />
                      {homepageInfo?.top?.place} • Preletor: {homepageInfo?.top?.speaker}
                    </span>
                  </span>
                  <span className="d-flex gap-3 align-items-center justify-content-center">
                    <Icons className="flex-shrink-0" typeIcon="simple-info" iconSize={35} fill="#007185" />
                    <span>
                      Inscrições até{' '}
                      <em>
                        <b>{homepageInfo?.top?.registrationsDeadline}</b>
                      </em>{' '}
                      ou até o esgotamento das vagas!
                    </span>
                  </span>
                </h5>
              </Col>
              <hr className="horizontal-line" />
            </Row>
            <Row className="justify-content-center">
              <Col xl={9}>
                <h4 className="mb-4 fw-bold">Informações Importantes</h4>
                <ul className="info-home-list">
                  {homepageInfo?.bottom?.map((item) => (
                    <li key={item.id} className="mb-3">
                      <h6 className="d-flex gap-3 align-items-center">
                        <Icons className="flex-shrink-0" typeIcon={item.icon} iconSize={32} fill="#007185" />
                        <span className="info-home-itens d-flex gap-2">
                          <b className="info-home-enphasis">{item.title}:</b>{' '}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(item.description),
                            }}
                          />
                        </span>
                      </h6>
                    </li>
                  ))}
                </ul>
              </Col>
            </Row>
            <Loading loading={loading} />
          </Container>
        </Card.Body>

        <div className="form__container__buttons justify-content-end">
          <Button variant="warning" onClick={nextStep} size="lg">
            Avançar
          </Button>
        </div>
      </Card>

      <Modal className="custom-modal" show={showLgpdModal} onHide={handleCloseLgpdModal}>
        <Modal.Header closeButton className="custom-modal__header--inf">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="info" iconSize={23} fill="#2E5AAC" />
            <b>Conformidade com a LGPD</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Nosso sistema está em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD)</strong>. Os dados
          fornecidos neste formulário são coletados exclusivamente para fins de organização e segurança do evento. Ao
          continuar, você concorda com a utilização das informações para esses propósitos.
          <br />
          <br />
          Consulte a legislação completa em:
          <br />
          <a
            className="lgpd-link"
            href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lei Geral de Proteção de Dados Pessoais (LGPD)
          </a>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-inf" onClick={handleCloseLgpdModal}>
            Ciente
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

FormHome.propTypes = {
  nextStep: PropTypes.func,
  onLgpdClose: PropTypes.func,
};

export default FormHome;
