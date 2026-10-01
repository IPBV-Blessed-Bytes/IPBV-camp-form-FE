import { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
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
  const { t } = useTranslation();
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
      toast.success(t('admin.recebimento.configSuccess'));
      setOnboarded(true);
    } catch (error) {
toast.error(getApiErrorMessage(error) || t('admin.recebimento.configError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-subpage recebimento">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.recebimento.title')}
        subtitle={t('admin.recebimento.subtitle', { event: eventName })}
        typeIcon="money"
      />

      <div className="recebimento__content">
        {loading ? (
          <Loading loading />
        ) : onboarded ? (
          <div className="recebimento__done">
            <Icons typeIcon="checked" iconSize={44} fill="#057c05" />
            <h3>{t('admin.recebimento.doneTitle')}</h3>
            <p>{t('admin.recebimento.doneText')}</p>
          </div>
        ) : (
          <>
            <div className="recebimento__intro">
              <span className="recebimento__intro-icon">
                <Icons typeIcon="money" iconSize={22} fill="#007185" />
              </span>
              <p>
                <Trans i18nKey="admin.recebimento.intro" components={{ strong: <strong /> }} />
              </p>
            </div>
            <Form onSubmit={handleSubmit} className="recebimento__form">
              <FormSection title={t('admin.recebimento.sectionResponsible')}>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group controlId="rcb-1">
                    <Form.Label>{t('admin.recebimento.fullName')}</Form.Label>
                    <Form.Control value={form.name} onChange={set('name')} required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group controlId="rcb-2">
                    <Form.Label>{t('admin.recebimento.cpf')}</Form.Label>
                    <Form.Control value={form.document} onChange={set('document')} placeholder="000.000.000-00" required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group controlId="rcb-3">
                    <Form.Label>{t('admin.recebimento.email')}</Form.Label>
                    <Form.Control type="email" value={form.email} onChange={set('email')} required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group controlId="rcb-4">
                    <Form.Label>{t('admin.recebimento.motherName')}</Form.Label>
                    <Form.Control value={form.motherName} onChange={set('motherName')} required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={3}>
                  <Form.Group controlId="rcb-5">
                    <Form.Label>{t('admin.recebimento.birthdate')}</Form.Label>
                    <Form.Control
                      value={form.birthdate}
                      onChange={set('birthdate')}
                      placeholder={t('admin.recebimento.datePlaceholder')}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={6} md={3}>
                  <Form.Group controlId="rcb-6">
                    <Form.Label>{t('admin.recebimento.monthlyIncome')}</Form.Label>
                    <Form.Control type="number" min={0} value={form.monthlyIncome} onChange={set('monthlyIncome')} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group controlId="rcb-7">
                    <Form.Label>{t('admin.recebimento.occupation')}</Form.Label>
                    <Form.Control value={form.professionalOccupation} onChange={set('professionalOccupation')} />
                  </Form.Group>
                </Col>
              </Row>
              </FormSection>

              <FormSection title={t('admin.recebimento.sectionAddress')}>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group controlId="rcb-8">
                    <Form.Label>{t('admin.recebimento.street')}</Form.Label>
                    <Form.Control value={form.street} onChange={set('street')} required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Group controlId="rcb-9">
                    <Form.Label>{t('admin.recebimento.number')}</Form.Label>
                    <Form.Control value={form.streetNumber} onChange={set('streetNumber')} />
                  </Form.Group>
                </Col>
                <Col xs={6} md={4}>
                  <Form.Group controlId="rcb-10">
                    <Form.Label>{t('admin.recebimento.complement')}</Form.Label>
                    <Form.Control value={form.complementary} onChange={set('complementary')} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={5}>
                  <Form.Group controlId="rcb-11">
                    <Form.Label>{t('admin.recebimento.neighborhood')}</Form.Label>
                    <Form.Control value={form.neighborhood} onChange={set('neighborhood')} required />
                  </Form.Group>
                </Col>
                <Col xs={8} md={4}>
                  <Form.Group controlId="rcb-12">
                    <Form.Label>{t('admin.recebimento.city')}</Form.Label>
                    <Form.Control value={form.city} onChange={set('city')} required />
                  </Form.Group>
                </Col>
                <Col xs={4} md={1}>
                  <Form.Group controlId="rcb-13">
                    <Form.Label>{t('admin.recebimento.state')}</Form.Label>
                    <Form.Control value={form.state} onChange={set('state')} maxLength={2} placeholder="PE" required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Group controlId="rcb-14">
                    <Form.Label>{t('admin.recebimento.zipCode')}</Form.Label>
                    <Form.Control value={form.zipCode} onChange={set('zipCode')} placeholder="00000-000" required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group controlId="rcb-15">
                    <Form.Label>{t('admin.recebimento.referencePoint')}</Form.Label>
                    <Form.Control value={form.referencePoint} onChange={set('referencePoint')} />
                  </Form.Group>
                </Col>
                <Col xs={4} md={2}>
                  <Form.Group controlId="rcb-16">
                    <Form.Label>{t('admin.recebimento.ddd')}</Form.Label>
                    <Form.Control value={form.phoneDdd} onChange={set('phoneDdd')} placeholder="81" required />
                  </Form.Group>
                </Col>
                <Col xs={8} md={4}>
                  <Form.Group controlId="rcb-17">
                    <Form.Label>{t('admin.recebimento.phone')}</Form.Label>
                    <Form.Control value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="99999-9999" required />
                  </Form.Group>
                </Col>
              </Row>
              </FormSection>

              <FormSection title={t('admin.recebimento.sectionBank')}>
              <Row className="g-3">
                <Col xs={6} md={3}>
                  <Form.Group controlId="rcb-18">
                    <Form.Label>{t('admin.recebimento.bankCode')}</Form.Label>
                    <Form.Control value={form.bankCode} onChange={set('bankCode')} placeholder="341" required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={3}>
                  <Form.Group controlId="rcb-19">
                    <Form.Label>{t('admin.recebimento.branch')}</Form.Label>
                    <Form.Control value={form.branchNumber} onChange={set('branchNumber')} placeholder="0001" required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Group controlId="rcb-20">
                    <Form.Label>{t('admin.recebimento.branchDigit')}</Form.Label>
                    <Form.Control value={form.branchCheckDigit} onChange={set('branchCheckDigit')} />
                  </Form.Group>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Group controlId="rcb-21">
                    <Form.Label>{t('admin.recebimento.account')}</Form.Label>
                    <Form.Control value={form.accountNumber} onChange={set('accountNumber')} required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Group controlId="rcb-22">
                    <Form.Label>{t('admin.recebimento.accountDigit')}</Form.Label>
                    <Form.Control value={form.accountCheckDigit} onChange={set('accountCheckDigit')} required />
                  </Form.Group>
                </Col>
                <Col xs={6} md={3}>
                  <Form.Group controlId="rcb-23">
                    <Form.Label>{t('admin.recebimento.accountType')}</Form.Label>
                    <Form.Select value={form.accountType} onChange={set('accountType')}>
                      <option value="checking">{t('admin.recebimento.checking')}</option>
                      <option value="savings">{t('admin.recebimento.savings')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              </FormSection>

              <div className="recebimento__actions">
                <SpinnerButton type="submit" variant="teal-blue" className="fw-bold" loading={saving}>
                  {t('admin.recebimento.submit')}
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
