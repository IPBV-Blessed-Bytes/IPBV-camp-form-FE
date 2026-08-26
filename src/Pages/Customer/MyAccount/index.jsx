import { useEffect, useState } from 'react';
import { Button, Table, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import useAuth from '@/hooks/useAuth';
import Icons from '@/components/Global/Icons';
import CheckinQrModal from '@/components/Global/CheckinQrModal';
import {
  getMyRegistrations,
  getMyRegistration,
  createChangeRequest,
  getMyChangeRequests,
} from '@/services/me';

const REG_STATUS = {
  CONFIRMED: { label: 'Confirmada', bg: 'success' },
  PENDING_PAYMENT: { label: 'Aguardando pagamento', bg: 'warning' },
};

const REQ_STATUS = {
  PENDING: { label: 'Pendente', bg: 'warning' },
  APPROVED: { label: 'Aprovada', bg: 'success' },
  REJECTED: { label: 'Rejeitada', bg: 'danger' },
};

const MyAccount = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [qrTarget, setQrTarget] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regs, reqs] = await Promise.all([getMyRegistrations(), getMyChangeRequests()]);
      setRegistrations(regs);
      setChangeRequests(reqs);
    } catch (error) {
      toast.error('Não foi possível carregar seus dados.');
    } finally {
      setLoading(false);
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
      setShowEdit(true);
    } catch (error) {
      toast.error('Não foi possível carregar os dados da inscrição.');
    }
  };

  const setPersonal = (field, value) =>
    setEditData((d) => ({ ...d, personalInformation: { ...d.personalInformation, [field]: value } }));

  const setContact = (field, value) =>
    setEditData((d) => ({ ...d, contact: { ...d.contact, [field]: value } }));

  const handleSubmitChange = async () => {
    setSaving(true);
    try {
      await createChangeRequest(editData.id, editData);
      toast.success('Solicitação de alteração enviada para aprovação.');
      setShowEdit(false);
      setEditData(null);
      fetchData();
    } catch (error) {
      toast.error('Não foi possível enviar a solicitação.');
    } finally {
      setSaving(false);
    }
  };

  const personal = editData?.personalInformation || {};
  const contact = editData?.contact || {};

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
        <Button
          variant="teal-blue"
          className="my-account__btn my-account__btn--new"
          onClick={() => navigate('/')}
        >
          Nova Inscrição
        </Button>
        <Button
          variant="outline-teal-blue"
          className="my-account__btn my-account__btn--back outline-border-width-thin"
          onClick={() => navigate('/')}
        >
          Voltar ao Formulário
        </Button>
        <Button variant="outline-secondary" className="my-account__btn my-account__btn--logout" onClick={logout}>
          Sair
        </Button>
      </div>

      <div className="my-account__content">
        <div className="account-section-header">
          <h4 className="account-section-header__title">Minhas inscrições</h4>
          {!loading && <span className="account-section-header__count">{registrations.length} itens</span>}
          <div className="account-section-header__line" />
        </div>

        <div className="account-card">
          {loading ? (
            <div className="d-flex align-items-center justify-content-center gap-2 text-secondary account-empty">
              <Spinner animation="border" size="sm" /> Carregando...
            </div>
          ) : registrations.length === 0 ? (
            <div className="account-empty">
              <p className="mb-3">Você ainda não tem inscrições.</p>
              <Button variant="teal-blue" onClick={() => navigate('/')}>
                Fazer Inscrição
              </Button>
            </div>
          ) : (
            <Table striped hover responsive className="account-table">
              <thead>
                <tr>
                  <th>Nº Pedido</th>
                  <th>Campista</th>
                  <th>CPF</th>
                  <th>Hospedagem</th>
                  <th>Transporte</th>
                  <th>Alimentação</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => {
                  const status = REG_STATUS[r.status] || { label: r.status, bg: 'secondary' };
                  return (
                    <tr key={`${r.status}-${r.id}`}>
                      <td>{r.orderNumber || <span className="text-secondary">—</span>}</td>
                      <td>{r.name || <span className="text-secondary">—</span>}</td>
                      <td>{r.cpf}</td>
                      <td>{r.accomodation}</td>
                      <td>{r.transportation}</td>
                      <td>{r.food}</td>
                      <td>{r.totalPrice ? `R$ ${r.totalPrice}` : '—'}</td>
                      <td>
                        <Badge bg={status.bg}>{status.label}</Badge>
                      </td>
                      <td>
                        {r.status === 'CONFIRMED' ? (
                          <div className="d-flex flex-wrap gap-2">
                            <Button size="sm" variant="outline-success" onClick={() => handleEditClick(r.id)}>
                              Solicitar Alteração
                            </Button>
                            <Button
                              size="sm"
                              variant="teal-blue"
                              onClick={() => setQrTarget({ cpf: r.cpf, name: r.name })}
                            >
                              QR de check-in
                            </Button>
                          </div>
                        ) : r.paymentUrl ? (
                          <Button
                            size="sm"
                            variant="teal-blue"
                            href={r.paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
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
          )}
        </div>

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
                  <th>Campista</th>
                  <th>Enviada em</th>
                  <th>Status</th>
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
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </div>
      </div>

      <CheckinQrModal
        show={Boolean(qrTarget)}
        onHide={() => setQrTarget(null)}
        cpf={qrTarget?.cpf}
        name={qrTarget?.name}
      />

      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Solicitar alteração</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-secondary small">
            As alterações passam por aprovação de um administrador antes de serem aplicadas.
          </p>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">Nome</Form.Label>
              <Form.Control value={personal.name || ''} onChange={(e) => setPersonal('name', e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">RG</Form.Label>
              <Form.Control value={personal.rg || ''} onChange={(e) => setPersonal('rg', e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">Gênero</Form.Label>
              <Form.Control value={personal.gender || ''} onChange={(e) => setPersonal('gender', e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">Celular</Form.Label>
              <Form.Control value={contact.cellPhone || ''} onChange={(e) => setContact('cellPhone', e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">E-mail</Form.Label>
              <Form.Control value={contact.email || ''} onChange={(e) => setContact('email', e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">Igreja</Form.Label>
              <Form.Control value={contact.church || ''} onChange={(e) => setContact('church', e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">Alergia</Form.Label>
              <Form.Control value={contact.allergy || ''} onChange={(e) => setContact('allergy', e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Cancelar
          </Button>
          <Button variant="teal-blue" onClick={handleSubmitChange} disabled={saving}>
            {saving ? 'Enviando...' : 'Enviar solicitação'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyAccount;
