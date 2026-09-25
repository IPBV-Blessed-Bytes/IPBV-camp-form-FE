import { useEffect, useMemo, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import { getRecipientStatus, onboardRecipient } from '@/services/recipientOnboarding';
import { registerLog } from '@/services/logs';
import { getApiErrorMessage } from '@/fetchers/helpers';
import { getEventSlug } from '@/config/eventScope';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';
import SpinnerButton from '@/components/Global/SpinnerButton';

const EMPTY = {
  name: '',
  document: '',
  email: '',
  motherName: '',
  birthdate: '',
  monthlyIncome: '',
  professionalOccupation: '',
  street: '',
  streetNumber: '',
  complementary: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
  referencePoint: '',
  phoneDdd: '',
  phoneNumber: '',
  bankCode: '',
  branchNumber: '',
  branchCheckDigit: '',
  accountNumber: '',
  accountCheckDigit: '',
  accountType: 'checking',
};

const AdminRecebimento = ({ loggedUsername }) => {
  const slug = useMemo(() => getEventSlug(), []);
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    getRecipientStatus()
      .then(setOnboarded)
      .catch(() => setOnboarded(false))
      .finally(() => setLoading(false));
  }, []);

  const set = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onboardRecipient({
        ...form,
        monthlyIncome: form.monthlyIncome ? Math.round(Number(form.monthlyIncome)) : 0,
      });
      registerLog('Configurou o recebimento (recebedor PagarMe)', loggedUsername);
      toast.success('Recebimento configurado com sucesso.');
      setOnboarded(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Não foi possível configurar o recebimento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-subpage recebimento">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Recebimento"
        subtitle={`Conta que recebe as inscrições pagas — evento: ${slug}`}
        typeIcon="money"
      />

      <div className="recebimento__content">
        {loading ? (
          <Loading loading />
        ) : onboarded ? (
          <div className="recebimento__done">
            <Icons typeIcon="checked" iconSize={44} fill="#057c05" />
            <h3>Recebimento configurado</h3>
            <p>
              Sua conta já está pronta para receber os pagamentos das inscrições. Os valores caem direto na conta
              cadastrada; a taxa da plataforma é descontada automaticamente.
            </p>
          </div>
        ) : (
          <>
            <p className="recebimento__intro">
              Cadastre a conta que vai <strong>receber os pagamentos das inscrições</strong>. Usamos os dados do
              responsável (pessoa física) para criar o recebedor no provedor de pagamento (PagarMe).
            </p>
            <Form onSubmit={handleSubmit} className="recebimento__form">
              <h5 className="recebimento__section">Responsável</h5>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Nome completo</Form.Label>
                    <Form.Control value={form.name} onChange={set('name')} required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">CPF</Form.Label>
                    <Form.Control value={form.document} onChange={set('document')} placeholder="000.000.000-00" required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">E-mail</Form.Label>
                    <Form.Control type="email" value={form.email} onChange={set('email')} required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Nome da mãe</Form.Label>
                    <Form.Control value={form.motherName} onChange={set('motherName')} required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Nascimento</Form.Label>
                    <Form.Control value={form.birthdate} onChange={set('birthdate')} placeholder="dd/mm/aaaa" required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Renda mensal (R$)</Form.Label>
                    <Form.Control type="number" min={0} value={form.monthlyIncome} onChange={set('monthlyIncome')} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Profissão</Form.Label>
                    <Form.Control value={form.professionalOccupation} onChange={set('professionalOccupation')} />
                  </Form.Group>
                </Col>
              </Row>

              <h5 className="recebimento__section">Endereço</h5>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Rua</Form.Label>
                    <Form.Control value={form.street} onChange={set('street')} required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Número</Form.Label>
                    <Form.Control value={form.streetNumber} onChange={set('streetNumber')} />
                  </Form.Group>
                </Col>
                <Col xs={6} md={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Complemento</Form.Label>
                    <Form.Control value={form.complementary} onChange={set('complementary')} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={5}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Bairro</Form.Label>
                    <Form.Control value={form.neighborhood} onChange={set('neighborhood')} required />
                  </Form.Group>
                </Col>
                <Col xs={8} md={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Cidade</Form.Label>
                    <Form.Control value={form.city} onChange={set('city')} required />
                  </Form.Group>
                </Col>
                <Col xs={4} md={1}>
                  <Form.Group>
                    <Form.Label className="fw-bold">UF</Form.Label>
                    <Form.Control value={form.state} onChange={set('state')} maxLength={2} placeholder="PE" required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Group>
                    <Form.Label className="fw-bold">CEP</Form.Label>
                    <Form.Control value={form.zipCode} onChange={set('zipCode')} placeholder="00000-000" required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Ponto de referência</Form.Label>
                    <Form.Control value={form.referencePoint} onChange={set('referencePoint')} />
                  </Form.Group>
                </Col>
                <Col xs={4} md={2}>
                  <Form.Group>
                    <Form.Label className="fw-bold">DDD</Form.Label>
                    <Form.Control value={form.phoneDdd} onChange={set('phoneDdd')} placeholder="81" required />
                  </Form.Group>
                </Col>
                <Col xs={8} md={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Celular</Form.Label>
                    <Form.Control value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="99999-9999" required />
                  </Form.Group>
                </Col>
              </Row>

              <h5 className="recebimento__section">Conta bancária</h5>
              <Row className="g-3">
                <Col xs={6} md={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Banco (código)</Form.Label>
                    <Form.Control value={form.bankCode} onChange={set('bankCode')} placeholder="341" required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Agência</Form.Label>
                    <Form.Control value={form.branchNumber} onChange={set('branchNumber')} placeholder="0001" required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Díg. agência</Form.Label>
                    <Form.Control value={form.branchCheckDigit} onChange={set('branchCheckDigit')} />
                  </Form.Group>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Conta</Form.Label>
                    <Form.Control value={form.accountNumber} onChange={set('accountNumber')} required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Díg. conta</Form.Label>
                    <Form.Control value={form.accountCheckDigit} onChange={set('accountCheckDigit')} required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Tipo</Form.Label>
                    <Form.Select value={form.accountType} onChange={set('accountType')}>
                      <option value="checking">Corrente</option>
                      <option value="savings">Poupança</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div className="recebimento__actions">
                <SpinnerButton type="submit" variant="teal-blue" className="fw-bold" loading={saving}>
                  Configurar recebimento
                </SpinnerButton>
              </div>
            </Form>
          </>
        )}
      </div>
    </div>
  );
};

AdminRecebimento.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminRecebimento;
