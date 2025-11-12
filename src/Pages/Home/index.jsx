import { useEffect, useState } from 'react';
import { Container, Button, Card, Modal, Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import './style.scss';
import Icons from '@/components/Global/Icons';

const FormHome = ({ nextStep, onLgpdClose }) => {
  const location = useLocation();
  const [showLgpdModal, setShowLgpdModal] = useState(false);

  useEffect(() => {
    setShowLgpdModal(true);
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
                  <b>Acampamento no Período de Carnaval 2026</b>
                </h4>
                <h5 className="info-home-text mb-2">
                  <span className="info-home-enphasis">
                    <span className="d-flex gap-3 mb-3 align-items-center justify-content-center">
                      <Icons className="flex-shrink-0" typeIcon="calendar" iconSize={30} fill={'#007185'} />
                      IP de Boa Viagem • 14 a 18 de fevereiro • Garanhuns
                    </span>
                    <span className="d-flex gap-3 mb-3 align-items-center justify-content-center">
                      <Icons className="flex-shrink-0" typeIcon="location-pin" iconSize={30} fill={'#007185'} />
                      Colégio XV de Novembro • Preletor: Rev. Tarcizio Carvalho
                    </span>
                  </span>
                  <span className="d-flex gap-3 align-items-center justify-content-center">
                    <Icons className="flex-shrink-0" typeIcon="simple-info" iconSize={35} fill={'#007185'} />
                    <span>
                      Inscrições até{' '}
                      <em>
                        <b>06 de Fevereiro</b>
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
                <h4 className="mb-4 fw-bold">Instruções Importantes</h4>
                <ul className="info-home-list">
                  <li className="mb-3">
                    <h6 className="d-flex gap-3 align-items-center">
                      <Icons className="flex-shrink-0" typeIcon="simple-pin" iconSize={37} fill={'#007185'} />
                      <span>
                        <b className="info-home-enphasis">Inscrição Individual:</b> Todas as pessoas devem ser
                        cadastradas, inclusive crianças, de qualquer faixa etária. Preencha todos os campos
                        corretamente. Qualquer dúvida, acesse a seção de perguntas e respostas{' '}
                        <a
                          className="info-home-link"
                          href="https://inscricaoipbv.com.br/perguntas"
                          target="_self"
                          rel="noopener noreferrer"
                        >
                          aqui
                        </a>
                        .
                      </span>
                    </h6>
                  </li>

                  <li className="mb-3">
                    <h6 className="d-flex gap-3 align-items-center">
                      <Icons className="flex-shrink-0" typeIcon="credit-card" iconSize={32} fill={'#007185'} />
                      <span>
                        <b className="info-home-enphasis">Pagamento:</b> Apenas online! Não é necessário enviar
                        comprovante.
                      </span>
                    </h6>
                  </li>

                  <li className="mb-3">
                    <h6 className="d-flex gap-3 align-items-center">
                      <Icons className="flex-shrink-0" typeIcon="family" iconSize={35} fill={'#007185'} />
                      <span>
                        <b className="info-home-enphasis">Compartilhamento de Quarto:</b> Informe no campo{' '}
                        <em>acompanhantes</em> quem irá dividir o quarto com você (pais, filhos, cônjuge, etc.).
                      </span>
                    </h6>
                  </li>

                  <li>
                    <h6 className="d-flex gap-3 align-items-center">
                      <Icons
                        className="flex-shrink-0"
                        typeIcon="phone"
                        iconSize={30}
                        fill={'none'}
                        stroke={'#007185'}
                      />
                      <span>
                        <b className="info-home-enphasis">Em caso de erro ou dificuldade:</b> Contate a organização do
                        evento pelo telefone <em>(81) 99999-7767</em> ou pelo <em>(81) 99839-0194</em> (WhatsApp). Para mais informações gerais, acesse o
                        site informativo do acampamento{' '}
                        <a
                          className="info-home-link"
                          href="https://acampamento-ipbv-2026-79d0177f.base44.app/Home"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          aqui
                        </a>
                        .
                      </span>
                    </h6>
                  </li>
                </ul>
              </Col>
            </Row>
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
            <Icons typeIcon="info" iconSize={23} fill={'#2E5AAC'} />
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
