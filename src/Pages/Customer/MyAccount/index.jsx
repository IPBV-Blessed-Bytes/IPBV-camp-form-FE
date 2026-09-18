import { useEffect, useState } from 'react';
import { Button, Table, Badge, Spinner, Row, Col, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import { useFormState } from '@/contexts/FormStateContext';
import useAuth from '@/hooks/useAuth';
import useContactPhone from '@/hooks/useContactPhone';
import Icons from '@/components/Global/Icons';
import CheckinQrModal from '@/components/Global/CheckinQrModal';
import CustomModal from '@/components/Global/CustomModal';
import DatePicker from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import { InputMask, format } from '@react-input/mask';
import { rgShipper, issuingState } from '@/utils/constants';
import { CPF_MASK, PHONE_MASK } from '@/utils/masks';
import { parseDate, formatDate, extractNumbers } from '@/Pages/PersonalData/utils/fieldHelpers';
import MaskedDateInput from '@/components/Global/MaskedDateInput';
import {
  getMyRegistrations,
  getMyRegistration,
  createChangeRequest,
  getMyChangeRequests,
  cancelPendingRegistration,
} from '@/services/me';
import { getBoletosByOrder } from '@/services/boletos';
import BoletoList from '@/components/Global/BoletoList';
import WhatsAppGroupButton from '@/components/Global/WhatsAppGroupButton';
import WhatsAppGroupQr from '@/components/Global/WhatsAppGroupQr';
import useWhatsAppGroupLink from '@/hooks/useWhatsAppGroupLink';
import { printReceipt } from '@/utils/receipt';
import SpinnerButton from '@/components/Global/SpinnerButton';
import Loading from '@/components/Global/Loading';

const REG_STATUS = {
  CONFIRMED: { label: 'Confirmada', bg: 'success' },
  PENDING_PAYMENT: { label: 'Aguardando pagamento', bg: 'warning' },
};

const PAYMENT_METHOD_LABELS = {
  creditCard: 'Cartão de Crédito',
  pix: 'PIX',
  ticket: 'Boleto Bancário',
  boleto: 'Boleto Bancário',
};

const paymentMethodLabel = (value) => PAYMENT_METHOD_LABELS[value] || 'Não Pagante';

const waLink = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}`;
};

const REQ_STATUS = {
  PENDING: { label: 'Pendente', bg: 'warning' },
  APPROVED: { label: 'Aprovada', bg: 'success' },
  REJECTED: { label: 'Rejeitada', bg: 'danger' },
};

const MyAccount = () => {
  const navigate = useNavigate();
  const { initialStep } = useFormState();
  const { isLoggedIn, user, logout } = useAuth();

  const goToForm = () => {
    initialStep();
    navigate('/inscricao');
  };
  const contactPhone = useContactPhone();
  const whatsappLink = useWhatsAppGroupLink();
  const [registrations, setRegistrations] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [boletosByOrder, setBoletosByOrder] = useState({});
  const [loading, setLoading] = useState(true);

  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [justification, setJustification] = useState('');
  const [justificationError, setJustificationError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qrTarget, setQrTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [canceling, setCanceling] = useState(false);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [regs, reqs] = await Promise.all([getMyRegistrations(), getMyChangeRequests()]);
      setRegistrations(regs);
      setChangeRequests(reqs);

      const orderNumbers = [...new Set(regs.map((r) => r.orderNumber).filter(Boolean))];
      const boletoResults = await Promise.all(
        orderNumbers.map((orderNumber) =>
          getBoletosByOrder(orderNumber)
            .then((list) => [orderNumber, list])
            .catch(() => [orderNumber, []]),
        ),
      );
      setBoletosByOrder(Object.fromEntries(boletoResults.filter(([, list]) => list.length > 0)));
    } catch (error) {
      toast.error('Não foi possível carregar seus dados.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/entrar');
      return;
    }
    fetchData();
  }, [isLoggedIn, navigate]);

  const handleEditClick = async (registrationId) => {
    try {
      const data = await getMyRegistration(registrationId);
      setEditData(data);
      setJustification('');
      setJustificationError(false);
      setShowEdit(true);
    } catch (error) {
      toast.error('Não foi possível carregar os dados da inscrição.');
    }
  };

  const onBirthdayChange = (date) => setPersonal('birthday', date ? formatDate(date) : '');

  const setPersonal = (field, value) =>
    setEditData((d) => ({ ...d, personalInformation: { ...d.personalInformation, [field]: value } }));

  const setContact = (field, value) => setEditData((d) => ({ ...d, contact: { ...d.contact, [field]: value } }));

  const handleSubmitChange = async () => {
    if (!justification.trim()) {
      setJustificationError(true);
      toast.error('Informe a justificativa da alteração.');
      return;
    }
    setSaving(true);

    try {
      await createChangeRequest(editData.id, editData, justification.trim());
      toast.success('Solicitação de alteração enviada para aprovação.');
      setShowEdit(false);
      setEditData(null);
      setJustification('');
      setJustificationError(false);
      await fetchData(true);
    } catch (error) {
      toast.error('Não foi possível enviar a solicitação.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    const pendingId = cancelTarget.pendingId;
    setCanceling(true);

    try {
      await cancelPendingRegistration(pendingId);
      toast.success('Inscrição pendente cancelada.');
      setCancelTarget(null);
      await fetchData(true);
    } catch (error) {
      toast.error('Não foi possível cancelar a inscrição.');
    } finally {
      setCanceling(false);
    }
  };

  const personal = editData?.personalInformation || {};
  const contact = editData?.contact || {};

  const groupMap = new Map();
  registrations.forEach((r) => {
    const key = r.orderNumber || `no-order-${r.id}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        key,
        orderNumber: r.orderNumber || '',
        registrations: [],
        confirmedCount: 0,
        pendingCount: 0,
        pendingId: null,
      });
    }
    const group = groupMap.get(key);
    group.registrations.push(r);
    if (r.status === 'CONFIRMED') group.confirmedCount += 1;
    if (r.status === 'PENDING_PAYMENT') {
      group.pendingCount += 1;
      if (group.pendingId === null) group.pendingId = r.id;
    }
  });
  const registrationGroups = Array.from(groupMap.values());

  return (
    <div className="my-account">
      <div className="my-account__hero">
        <div className="my-account__hero-main">
          <span className="my-account__hero-icon">
            <Icons typeIcon="person" iconSize={32} fill="#fff" />
          </span>
          <div className="my-account__hero-text">
            <h1 className="my-account__title">Minha conta</h1>
            <p className="my-account__subtitle">{user}</p>
          </div>
        </div>
        <Button variant="teal-blue" className="my-account__btn my-account__btn--new" onClick={goToForm}>
          <Icons typeIcon="plus" iconSize={18} fill="#fff" />
          Nova Inscrição
        </Button>
        <Button
          variant="outline-teal-blue"
          className="my-account__btn my-account__btn--back outline-border-width-thin"
          onClick={goToForm}
        >
          ← Voltar ao Formulário
        </Button>
        <WhatsAppGroupButton
          className="my-account__btn my-account__btn--whatsapp"
          size={null}
          label="Grupo do WhatsApp"
        />
        <Button variant="outline-secondary" className="my-account__btn my-account__btn--logout" onClick={logout}>
          <Icons typeIcon="exit" iconSize={22} fill="none" stroke="currentColor" />
          Desconectar
        </Button>
      </div>

      <div className="my-account__content">
        <div className="account-section-header">
          <h4 className="account-section-header__title">Minhas inscrições</h4>
          {!loading && <span className="account-section-header__count">{registrations.length} itens</span>}
          <div className="account-section-header__line" />
        </div>

        {loading ? (
          <div className="account-card">
            <div className="d-flex align-items-center justify-content-center gap-2 text-secondary account-empty">
              <Spinner animation="border" size="sm" /> Carregando...
            </div>
          </div>
        ) : registrations.length === 0 ? (
          <div className="account-card">
            <div className="account-empty">
              <p className="mb-3">Você ainda não tem inscrições.</p>
              <Button variant="teal-blue" onClick={goToForm}>
                Fazer Inscrição
              </Button>
            </div>
          </div>
        ) : (
          registrationGroups.map((group) => (
            <div className="account-card mb-4" key={group.key}>
              <div className="account-order-header">
                <div className="account-order-header__title">
                  <Icons typeIcon="cart" iconSize={20} fill="#007185" />
                  <span>{group.orderNumber ? `Pedido nº ${group.orderNumber}` : 'Inscrição avulsa'}</span>
                </div>
                {group.confirmedCount > 1 && (
                  <Button
                    variant="teal-blue"
                    onClick={() => setQrTarget({ orderNumber: group.orderNumber, count: group.confirmedCount })}
                  >
                    <Icons typeIcon="camera" iconSize={18} fill="#fff" /> &nbsp;QR de check-in da família
                  </Button>
                )}
                {group.confirmedCount > 0 && (
                  <Button variant="outline-teal-blue" onClick={() => printReceipt(group, user)}>
                    <Icons typeIcon="download" iconSize={18} fill="#007185" /> &nbsp;Recibo
                  </Button>
                )}
                {group.confirmedCount === 0 && group.pendingCount > 0 && (
                  <Button
                    variant="outline-danger"
                    onClick={() =>
                      setCancelTarget({
                        pendingId: group.pendingId,
                        orderNumber: group.orderNumber,
                        count: group.pendingCount,
                      })
                    }
                  >
                    Cancelar Inscrição
                  </Button>
                )}
              </div>
              <Table striped hover responsive className="account-table">
                <thead>
                  <tr>
                    <th>Campista:</th>
                    <th>CPF:</th>
                    <th>Hospedagem:</th>
                    <th>Transporte:</th>
                    <th>Valor:</th>
                    <th>Status do Pagamento:</th>
                    <th>Tipo de Pagamento:</th>
                    <th>Status do Check-in:</th>
                    <th>Ações:</th>
                  </tr>
                </thead>
                <tbody>
                  {group.registrations.map((r) => {
                    const status = REG_STATUS[r.status] || { label: r.status, bg: 'secondary' };
                    return (
                      <tr key={`${r.status}-${r.id}`}>
                        <td>
                          {r.name || <span className="text-secondary">—</span>}
                          {r.rideMatches?.length > 0 &&
                            r.rideMatches.map((m, i) => (
                              <div key={i} className="small text-secondary mt-1">
                                🚗 {m.role === 'caronista' ? 'Motorista' : 'Passageiro'}: {m.name}
                                {m.cellPhone && (
                                  <>
                                    {' — '}
                                    <a href={waLink(m.cellPhone)} target="_blank" rel="noopener noreferrer">
                                      {m.cellPhone}
                                    </a>
                                  </>
                                )}
                              </div>
                            ))}
                        </td>
                        <td>{r.cpf}</td>
                        <td>{r.accomodation}</td>
                        <td>{r.transportation}</td>
                        <td>{r.totalPrice ? `R$ ${r.totalPrice}` : '—'}</td>
                        <td>
                          <Badge bg={status.bg}>{status.label}</Badge>
                        </td>
                        <td>{paymentMethodLabel(r.paymentMethod)}</td>
                        <td>
                          {r.checkin ? (
                            <Badge bg="success">Check-in feito</Badge>
                          ) : (
                            <Badge bg="secondary">Sem check-in</Badge>
                          )}
                        </td>
                        <td>
                          {r.status === 'CONFIRMED' ? (
                            <div className="d-flex flex-wrap gap-2">
                              <Button variant="outline-teal-blue" onClick={() => handleEditClick(r.id)}>
                                Solicitar Alteração
                              </Button>
                              <Button variant="teal-blue" onClick={() => setQrTarget({ cpf: r.cpf, name: r.name })}>
                                QR de check-in
                              </Button>
                            </div>
                          ) : r.paymentUrl ? (
                            <Button variant="warning" href={r.paymentUrl} target="_blank" rel="noopener noreferrer">
                              Pagar
                            </Button>
                          ) : (
                            <span className="text-secondary small">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              {boletosByOrder[group.orderNumber] && (
                <div className="account-boletos">
                  <div className="account-boletos__title">
                    <Icons typeIcon="barcode" iconSize={18} fill="#007185" />
                    <span>Boletos deste pedido</span>
                  </div>
                  <BoletoList boletos={boletosByOrder[group.orderNumber]} showProgress />
                </div>
              )}
            </div>
          ))
        )}

        <div className="account-section-header">
          <h4 className="account-section-header__title">Solicitações de alteração</h4>
          <span className="account-section-header__count">{changeRequests.length} itens</span>
          <div className="account-section-header__line" />
        </div>

        <div className="account-card">
          {changeRequests.length === 0 ? (
            <p className="account-empty mb-0">Nenhuma solicitação enviada.</p>
          ) : (
            <Table striped hover responsive className="account-table">
              <thead>
                <tr>
                  <th>Campista:</th>
                  <th>Enviada em:</th>
                  <th>Status:</th>
                  <th>Resposta da equipe:</th>
                </tr>
              </thead>
              <tbody>
                {changeRequests.map((cr) => {
                  const status = REQ_STATUS[cr.status] || { label: cr.status, bg: 'secondary' };
                  return (
                    <tr key={cr.id}>
                      <td>{cr.camperName || `#${cr.camperId}`}</td>
                      <td>{cr.createdAt ? new Date(cr.createdAt).toLocaleString('pt-BR') : '—'}</td>
                      <td>
                        <Badge bg={status.bg}>{status.label}</Badge>
                      </td>
                      <td className="small">
                        {cr.reviewNote ? cr.reviewNote : <span className="text-secondary">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </div>

        {whatsappLink && (
          <>
            <div className="account-section-header">
              <h4 className="account-section-header__title">Grupo do WhatsApp</h4>
              <div className="account-section-header__line" />
            </div>

            <div className="account-card whatsapp-group-card">
              <div className="whatsapp-group-card__info">
                <h4 className="whatsapp-group-card__title">Grupo do WhatsApp do evento</h4>
                <p className="whatsapp-group-card__text">
                  Entre no grupo para receber todas as novidades. Escaneie o QR code com a câmera do celular ou use o
                  botão &quot;Grupo do WhatsApp&quot; acima. O grupo permanecerá com mensagens bloqueadas até a semana
                  antes do evento. Até lá apenas administradores poderão mensagens informativas.
                </p>
              </div>
              <div className="whatsapp-group-card__qr">
                <WhatsAppGroupQr size={200} />
              </div>
            </div>
          </>
        )}
      </div>

      <CheckinQrModal
        show={Boolean(qrTarget)}
        onHide={() => setQrTarget(null)}
        cpf={qrTarget?.cpf}
        name={qrTarget?.name}
        orderNumber={qrTarget?.orderNumber}
        count={qrTarget?.count}
      />

      <CustomModal
        show={Boolean(cancelTarget)}
        onHide={() => (canceling ? null : setCancelTarget(null))}
        variant="cancel"
        icon="error"
        title="Cancelar Inscrição"
        iconFill="#dc3545"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelTarget(null)} disabled={canceling}>
              Voltar
            </Button>
            <SpinnerButton variant="danger" onClick={handleConfirmCancel} loading={canceling}>
              Sim, cancelar
            </SpinnerButton>
          </>
        }
      >
        <p>
          Tem certeza que deseja cancelar
          {cancelTarget?.count > 1
            ? ` as ${cancelTarget.count} inscrições pendentes deste pedido`
            : ' esta inscrição pendente'}
          ?
        </p>
        <Alert variant="warning" className="py-2 small mb-0">
          Esta ação não pode ser desfeita. O pedido será removido da sua conta e os boletos gerados serão cancelados.
          {cancelTarget?.count > 1 && (
            <>
              {' '}
              Como o pagamento deste pedido é único, <b>todos os acampantes pendentes deste pedido</b> serão cancelados
              juntos.
            </>
          )}{' '}
          Se quiser participar depois, será necessário fazer uma nova inscrição.
        </Alert>
      </CustomModal>

      <CustomModal
        show={showEdit}
        onHide={() => setShowEdit(false)}
        variant="info"
        icon="edit"
        title="Solicitar Alteração"
        iconFill="none"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>
              Cancelar
            </Button>
            <SpinnerButton variant="teal-blue" onClick={handleSubmitChange} loading={saving}>
              Enviar solicitação
            </SpinnerButton>
          </>
        }
      >
        <p className="text-secondary small">
          Altere os campos que quiser. As alterações passam por aprovação de um administrador antes de serem aplicadas.
        </p>
        <Alert variant="warning" className="py-2 small mb-3">
          Não é possível alterar o <b>pacote</b> (hospedagem, transporte e alimentação) pelo sistema. Para isso, entre
          em contato com a secretaria
          {contactPhone ? ` pelo contato ${contactPhone} (WhatsApp).` : '.'}
        </Alert>
        <Form>
          <h6 className="account-edit__section">Dados pessoais</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Nome</Form.Label>
                <Form.Control value={personal.name || ''} onChange={(e) => setPersonal('name', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Data de Nascimento</Form.Label>
                <div className="custom-datepicker-wrapper">
                  <Form.Control
                    as={DatePicker}
                    selected={parseDate(personal.birthday)}
                    onChange={onBirthdayChange}
                    locale={ptBR}
                    autoComplete="off"
                    dateFormat="dd/MM/yyyy"
                    dropdownMode="select"
                    maxDate={new Date()}
                    placeholderText="dd/mm/aaaa"
                    showMonthDropdown
                    showYearDropdown
                    customInput={<MaskedDateInput />}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">CPF</Form.Label>
                <InputMask
                  component={Form.Control}
                  {...CPF_MASK}
                  value={format(extractNumbers(personal.cpf || ''), CPF_MASK)}
                  onChange={(e) => setPersonal('cpf', extractNumbers(e.target.value))}
                  placeholder="000.000.000-00"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">RG</Form.Label>
                <Form.Control
                  type="number"
                  value={personal.rg || ''}
                  onChange={(e) => setPersonal('rg', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Órgão Expedidor RG</Form.Label>
                <Form.Select
                  value={personal.rgShipper || ''}
                  onChange={(e) => setPersonal('rgShipper', e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {rgShipper.map((org) => (
                    <option key={org.value} value={org.value}>
                      {org.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Estado de emissão</Form.Label>
                <Form.Select
                  value={personal.rgShipperState || ''}
                  onChange={(e) => setPersonal('rgShipperState', e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {issuingState.map((uf) => (
                    <option key={uf.value} value={uf.value}>
                      {uf.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Categoria</Form.Label>
                <Form.Select value={personal.gender || ''} onChange={(e) => setPersonal('gender', e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="Crianca">Criança (até 10 anos)</option>
                  <option value="Homem">Adulto Masculino</option>
                  <option value="Mulher">Adulto Feminino</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <h6 className="account-edit__section">Responsável legal</h6>
          <p className="text-secondary small">Aplicavel apenas se acampante for menor de idade.</p>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Nome do responsável</Form.Label>
                <Form.Control
                  value={personal.legalGuardianName || ''}
                  onChange={(e) => setPersonal('legalGuardianName', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">CPF do responsável</Form.Label>
                <InputMask
                  component={Form.Control}
                  {...CPF_MASK}
                  value={format(extractNumbers(personal.legalGuardianCpf || ''), CPF_MASK)}
                  onChange={(e) => setPersonal('legalGuardianCpf', extractNumbers(e.target.value))}
                  placeholder="000.000.000-00"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Celular do responsável</Form.Label>
                <InputMask
                  component={Form.Control}
                  {...PHONE_MASK}
                  value={format(extractNumbers(personal.legalGuardianCellPhone || ''), PHONE_MASK)}
                  onChange={(e) => setPersonal('legalGuardianCellPhone', extractNumbers(e.target.value))}
                  placeholder="(00) 00000-0000"
                />
              </Form.Group>
            </Col>
          </Row>

          <h6 className="account-edit__section">Contato</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Celular</Form.Label>
                <InputMask
                  component={Form.Control}
                  {...PHONE_MASK}
                  value={format(extractNumbers(contact.cellPhone || ''), PHONE_MASK)}
                  onChange={(e) => setContact('cellPhone', extractNumbers(e.target.value))}
                  placeholder="(00) 00000-0000"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">E-mail</Form.Label>
                <Form.Control
                  type="email"
                  value={contact.email || ''}
                  onChange={(e) => setContact('email', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Igreja</Form.Label>
                <Form.Control value={contact.church || ''} onChange={(e) => setContact('church', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Agregados</Form.Label>
                <Form.Control
                  value={contact.aggregate || ''}
                  onChange={(e) => setContact('aggregate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Alergias</Form.Label>
                <Form.Control value={contact.allergy || ''} onChange={(e) => setContact('allergy', e.target.value)} />
              </Form.Group>
            </Col>
          </Row>

          <h6 className="account-edit__section">Caronas</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Tem vagas de carona a oferecer?</Form.Label>
                <Form.Select value={contact.car ?? ''} onChange={(e) => setContact('car', e.target.value === 'true')}>
                  <option value="">Selecione...</option>
                  <option value={false}>Não</option>
                  <option value={true}>Sim</option>
                </Form.Select>
              </Form.Group>
            </Col>
            {contact.car === true && (
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="small fw-bold">Quantas vagas?</Form.Label>
                  <Form.Select
                    value={contact.numberVacancies ?? ''}
                    onChange={(e) => setContact('numberVacancies', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            {contact.car === false && (
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="small fw-bold">Precisa de carona?</Form.Label>
                  <Form.Select
                    value={contact.needRide ?? ''}
                    onChange={(e) => setContact('needRide', e.target.value === 'true')}
                  >
                    <option value="">Selecione...</option>
                    <option value={false}>Não</option>
                    <option value={true}>Sim</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            {(contact.car === true || contact.needRide === true) && (
              <Col md={12}>
                <Form.Group className="mb-2">
                  <Form.Label className="small fw-bold">Observação sobre a carona</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={contact.rideObservation || ''}
                    onChange={(e) => setContact('rideObservation', e.target.value)}
                  />
                </Form.Group>
              </Col>
            )}
          </Row>

          <h6 className="account-edit__section">Justificativa</h6>
          <Form.Group className="mb-2">
            <Form.Control
              as="textarea"
              rows={3}
              value={justification}
              isInvalid={justificationError}
              onChange={(e) => {
                setJustification(e.target.value);
                if (e.target.value.trim()) setJustificationError(false);
              }}
              placeholder="Informe o motivo desta alteração (ex.: corrigir CPF digitado errado, atualizar o celular de contato). Isso ajuda a equipe a avaliar e aprovar sua solicitação."
            />
            <Form.Control.Feedback type="invalid">Informe a justificativa da alteração.</Form.Control.Feedback>
          </Form.Group>
        </Form>

      </CustomModal>
        <Loading loading={loading} />
    </div>
  );
};

export default MyAccount;
