import { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import { getRecipientStatus, onboardRecipient } from '@/services/recipientOnboarding';
import { registerLog } from '@/services/logs';
import { getApiErrorMessage } from '@/fetchers/helpers';
import useEventName from '@/hooks/useEventName';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import FormSection from '@/components/Admin/FormSection';
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
  const eventName = useEventName();
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
        subtitle={`Conta que recebe as inscrições pagas — evento: ${eventName}`}
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
            <div className="recebimento__intro">
              <span className="recebimento__intro-icon">
                <Icons typeIcon="money" iconSize={22} fill="#007185" />
              </span>
              <p>
                Cadastre a conta que vai <strong>receber os pagamentos das inscrições</strong>. Usamos os dados do
                responsável (pessoa física) para criar o recebedor no provedor de pagamento (PagarMe).
              </p>
            </div>
            <Form onSubmit={handleSubmit} className="recebimento__form">
              <FormSection title="Responsável">
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Nome completo</Form.Label>
                    <Form.Control value={form.name} onChange={set('name')} required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>CPF</Form.Label>
                    <Form.Control value={form.document} onChange={set('document')} placeholder="000.000.000-00" required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control type="email" value={form.email} onChange={set('email')} required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Nome da mãe</Form.Label>
                    <Form.Control value={form.motherName} onChange={set('motherName')} required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={3}>
                  <Form.Group>
                    <Form.Label>Nascimento</Form.Label>
                    <Form.Control value={form.birthdate} onChange={set('birthdate')} placeholder="dd/mm/aaaa" required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={3}>
                  <Form.Group>
                    <Form.Label>Renda mensal (R$)</Form.Label>
                    <Form.Control type="number" min={0} value={form.monthlyIncome} onChange={set('monthlyIncome')} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Profissão</Form.Label>
                    <Form.Control value={form.professionalOccupation} onChange={set('professionalOccupation')} />
                  </Form.Group>
                </Col>
              </Row>
              </FormSection>

              <FormSection title="Endereço">
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Rua</Form.Label>
                    <Form.Control value={form.street} onChange={set('street')} required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Group>
                    <Form.Label>Número</Form.Label>
                    <Form.Control value={form.streetNumber} onChange={set('streetNumber')} />
                  </Form.Group>
                </Col>
                <Col xs={6} md={4}>
                  <Form.Group>
                    <Form.Label>Complemento</Form.Label>
                    <Form.Control value={form.complementary} onChange={set('complementary')} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={5}>
                  <Form.Group>
                    <Form.Label>Bairro</Form.Label>
                    <Form.Control value={form.neighborhood} onChange={set('neighborhood')} required />
                  </Form.Group>
                </Col>
                <Col xs={8} md={4}>
                  <Form.Group>
                    <Form.Label>Cidade</Form.Label>
                    <Form.Control value={form.city} onChange={set('city')} required />
                  </Form.Group>
                </Col>
                <Col xs={4} md={1}>
                  <Form.Group>
                    <Form.Label>UF</Form.Label>
                    <Form.Control value={form.state} onChange={set('state')} maxLength={2} placeholder="PE" required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Group>
                    <Form.Label>CEP</Form.Label>
                    <Form.Control value={form.zipCode} onChange={set('zipCode')} placeholder="00000-000" required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Ponto de referência</Form.Label>
                    <Form.Control value={form.referencePoint} onChange={set('referencePoint')} />
                  </Form.Group>
                </Col>
                <Col xs={4} md={2}>
                  <Form.Group>
                    <Form.Label>DDD</Form.Label>
                    <Form.Control value={form.phoneDdd} onChange={set('phoneDdd')} placeholder="81" required />
                  </Form.Group>
                </Col>
                <Col xs={8} md={4}>
                  <Form.Group>
                    <Form.Label>Celular</Form.Label>
                    <Form.Control value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="99999-9999" required />
                  </Form.Group>
                </Col>
              </Row>
              </FormSection>

              <FormSection title="Conta bancária">
              <Row className="g-3">
                <Col xs={6} md={3}>
                  <Form.Group>
                    <Form.Label>Banco (código)</Form.Label>
                    <Form.Control value={form.bankCode} onChange={set('bankCode')} placeholder="341" required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={3}>
                  <Form.Group>
                    <Form.Label>Agência</Form.Label>
                    <Form.Control value={form.branchNumber} onChange={set('branchNumber')} placeholder="0001" required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Group>
                    <Form.Label>Díg. agência</Form.Label>
                    <Form.Control value={form.branchCheckDigit} onChange={set('branchCheckDigit')} />
                  </Form.Group>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Group>
                    <Form.Label>Conta</Form.Label>
                    <Form.Control value={form.accountNumber} onChange={set('accountNumber')} required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Group>
                    <Form.Label>Díg. conta</Form.Label>
                    <Form.Control value={form.accountCheckDigit} onChange={set('accountCheckDigit')} required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={3}>
                  <Form.Group>
                    <Form.Label>Tipo</Form.Label>
                    <Form.Select value={form.accountType} onChange={set('accountType')}>
                      <option value="checking">Corrente</option>
                      <option value="savings">Poupança</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              </FormSection>

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
