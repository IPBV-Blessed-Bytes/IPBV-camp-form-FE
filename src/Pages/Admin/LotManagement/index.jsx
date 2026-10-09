import { useEffect, useState } from 'react';
import { Badge, Row, Col, Button, Form, Accordion } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/services/logs';
import DatePicker, { registerLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
import { parse, isValid } from 'date-fns';
import { getLotsAuthenticated, createLot, updateLot as updateLotRequest, deleteLot } from '@/services/lots';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import SpinnerButton from '@/components/Global/SpinnerButton';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import Icons from '@/components/Global/Icons';

registerLocale('ptBR', ptBR);

const defaultPrice = {
  registrationFee: '',
};

const parseDate = (dateString) => {
  if (!dateString) return null;
  const parsed = parse(dateString, 'dd/MM/yyyy', new Date());
  return isValid(parsed) ? parsed : null;
};

const parseEndOfDay = (dateString) => {
  const date = parseDate(dateString);
  if (date) date.setHours(23, 59, 59, 999);
  return date;
};

const formatDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('pt-BR');
};

const AdminLotManagement = ({ loading, loggedUsername }) => {
  const { t } = useTranslation();
  const [loadingContent, setLoadingContent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lots, setLots] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLot, setNewLot] = useState({
    name: '',
    price: { ...defaultPrice },
    startDate: '',
    endDate: '',
    totalVacancies: '',
  });
  const [search, setSearch] = useState('');

  scrollUp();

  const fetchLots = async (silent = false) => {
    try {
      if (!silent) setLoadingContent(true);
      const data = await getLotsAuthenticated();
      setLots(data?.lots || []);
    } catch (error) {
      console.error(error);
      toast.error(t('admin.lots.loadError'));
    } finally {
      if (!silent) setLoadingContent(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const handleLotChange = (id, field, value, nestedField = null) => {
    setLots((prevLots) =>
      prevLots.map((lot) => {
        if (lot.id !== id) return lot;

        if (field === 'price' && nestedField) {
          return {
            ...lot,
            [field]: { ...lot[field], [nestedField]: value },
          };
        }

        return { ...lot, [field]: value };
      }),
    );
  };

  const updateLot = async (lot) => {
    if (hasDateConflict(lot, lots)) {
      toast.error(t('admin.lots.dateConflict'));
      return;
    }

    try {
      setLoadingContent(true);
      await updateLotRequest(lot.id, {
        name: lot.name,
        startDate: lot.startDate,
        endDate: lot.endDate,
        price: { registrationFee: lot.price?.registrationFee || '' },
        totalVacancies: lot.totalVacancies === '' || lot.totalVacancies == null ? null : Number(lot.totalVacancies),
      });
      toast.success(t('admin.lots.updateSuccess', { name: lot.name }));
      registerLog(`Atualizou o ${lot.name}`, loggedUsername);
    } catch (error) {
      console.error(error);
      toast.error(t('admin.lots.updateError'));
    } finally {
      setLoadingContent(false);
    }
  };

  const handleDeleteLot = async () => {
    if (!selectedLot) return;

    try {
      setSaving(true);
      await deleteLot(selectedLot.id);
      toast.success(t('admin.lots.deleteSuccess', { name: selectedLot.name }));
      registerLog(`Deletou o ${selectedLot.name}`, loggedUsername);
      setShowDeleteModal(false);
      await fetchLots(true);
    } catch (error) {
      console.error(error);
      toast.error(t('admin.lots.deleteError'));
    } finally {
      setSaving(false);
    }
  };

  const hasDateConflict = (lotToCheck, allLots) => {
    const start = parseDate(lotToCheck.startDate);
    const end = parseDate(lotToCheck.endDate);

    return allLots.some((lot) => {
      if (lot.id === lotToCheck.id) return false;

      const lotStart = parseDate(lot.startDate);
      const lotEnd = parseDate(lot.endDate);

      if (!start || !end || !lotStart || !lotEnd) return false;

      const hasNoConflict = end < lotStart || start > lotEnd;

      return !hasNoConflict;
    });
  };

  const handleAddLot = async () => {
    if (hasDateConflict(newLot, lots)) {
      toast.error(t('admin.lots.dateConflict'));
      return;
    }

    try {
      setSaving(true);
      await createLot({
        name: newLot.name,
        startDate: newLot.startDate,
        endDate: newLot.endDate,
        price: { registrationFee: newLot.price.registrationFee || '' },
        totalVacancies:
          newLot.totalVacancies === '' || newLot.totalVacancies == null ? null : Number(newLot.totalVacancies),
      });
      toast.success(t('admin.lots.addSuccess', { name: newLot.name }));
      registerLog(`Adicionou o ${newLot.name}`, loggedUsername);
      setShowAddModal(false);
      setNewLot({
        name: '',
        price: { ...defaultPrice },
        startDate: '',
        endDate: '',
        totalVacancies: '',
      });
      await fetchLots(true);
    } catch (error) {
      console.error(error);
      toast.error(t('admin.lots.addError'));
    } finally {
      setSaving(false);
    }
  };

  const now = new Date();
  const lotStatus = (lot) => {
    const start = parseDate(lot.startDate);
    const end = parseEndOfDay(lot.endDate);
    if (start && end && now >= start && now <= end) return 'current';
    if (start && now < start) return 'upcoming';
    if (end && now > end) return 'ended';
    return 'unknown';
  };
  const currentCount = lots.filter((lot) => lotStatus(lot) === 'current').length;
  const upcomingCount = lots.filter((lot) => lotStatus(lot) === 'upcoming').length;
  const endedCount = lots.filter((lot) => lotStatus(lot) === 'ended').length;
  const statItems = [
    { label: t('admin.lots.statTotal'), value: lots.length },
    { label: t('admin.lots.statCurrent'), value: currentCount, tone: 'free' },
    { label: t('admin.lots.statUpcoming'), value: upcomingCount, tone: 'info' },
    { label: t('admin.lots.statEnded'), value: endedCount, tone: 'used' },
  ];
  const term = search.trim().toLowerCase();
  const filteredLots = lots.filter((lot) => !term || (lot.name || '').toLowerCase().includes(term));

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'add-new-lot',
      name: t('admin.lots.addButton'),
      onClick: () => setShowAddModal(true),
      typeButton: 'outline-teal-blue',
      typeIcon: 'plus',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--lots">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.lots.title')}
        subtitle={t('admin.lots.subtitle')}
        typeIcon="calendar"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="lots-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder={t('admin.lots.searchPlaceholder')} />
        </div>

        <SectionHeader title={t('admin.lots.sectionLots')} count={filteredLots.length} />

        <Row className="justify-content-center">
          <Col>
            <Form>
              <Accordion alwaysOpen>
                {filteredLots.map((lot, index) => {
                  const today = new Date();
                  const start = parseDate(lot.startDate);
                  const end = parseEndOfDay(lot.endDate);
                  const isCurrentLot = start && end && today >= start && today <= end;

                  return (
                    <Accordion.Item eventKey={String(index)} key={lot.id}>
                      <Accordion.Header>
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <span>
                            <strong>{lot.name || t('admin.lots.lotFallback', { number: index + 1 })}</strong>
                            {isCurrentLot && (
                              <Badge bg="success" className="ms-2">
                                {t('admin.lots.current')}
                              </Badge>
                            )}
                          </span>
                          <small className="lot-range-date">
                            {lot.startDate} - {lot.endDate}
                          </small>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body className={isCurrentLot ? 'accordion-body--highlight' : ''}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <strong>{t('admin.lots.formName')}</strong>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={lot.name}
                            onChange={(e) => handleLotChange(lot.id, 'name', e.target.value)}
                            className="form-control-lg"
                            placeholder={t('admin.lots.namePlaceholder')}
                          />
                        </Form.Group>

                        <Row>
                          <Col xs={12} md={4} className="mb-3">
                            <Form.Group>
                              <Form.Label>
                                <strong>{t('admin.lots.startDate')}</strong>
                              </Form.Label>
                              <DatePicker
                                selected={parseDate(lot.startDate)}
                                onChange={(date) => handleLotChange(lot.id, 'startDate', formatDate(date))}
                                className="form-control form-control-lg"
                                placeholderText={t('admin.lots.datePlaceholder')}
                                dateFormat="dd/MM/yyyy"
                                locale="ptBR"
                                dropdownMode="select"
                                showMonthDropdown
                                showYearDropdown
                              />
                            </Form.Group>
                          </Col>

                          <Col xs={12} md={4} className="mb-3">
                            <Form.Group>
                              <Form.Label>
                                <strong>{t('admin.lots.endDate')}</strong>
                              </Form.Label>
                              <DatePicker
                                selected={parseDate(lot.endDate)}
                                onChange={(date) => handleLotChange(lot.id, 'endDate', formatDate(date))}
                                className="form-control form-control-lg"
                                placeholderText={t('admin.lots.datePlaceholder')}
                                dateFormat="dd/MM/yyyy"
                                locale="ptBR"
                                dropdownMode="select"
                                showMonthDropdown
                                showYearDropdown
                              />
                            </Form.Group>
                          </Col>

                          <Col xs={12} md={4} className="mb-3">
                            <Form.Group>
                              <Form.Label>
                                <strong>{t('admin.lots.registrationFee')}</strong>
                              </Form.Label>
                              <Form.Control
                                type="text"
                                value={lot.price?.registrationFee || ''}
                                onChange={(e) => handleLotChange(lot.id, 'price', e.target.value, 'registrationFee')}
                                className="form-control-lg"
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            <strong>{t('admin.lots.totalVacancies')}</strong>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            min="0"
                            value={lot.totalVacancies ?? ''}
                            onChange={(e) => handleLotChange(lot.id, 'totalVacancies', e.target.value)}
                            className="form-control-lg"
                          />
                          <Form.Text className="text-secondary">{t('admin.lots.totalVacanciesHint')}</Form.Text>
                        </Form.Group>

                        <div className="d-flex mt-3 justify-content-end gap-2">
                          <Button
                            variant="outline-danger"
                            onClick={() => {
                              setSelectedLot(lot);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Icons typeIcon="delete" iconSize={20} fill="#dc3545" />
                            &nbsp; {t('admin.lots.delete')}
                          </Button>
                          <Button variant="teal-blue" onClick={() => updateLot(lot)}>
                            <Icons typeIcon="checked" iconSize={20} fill="#fff" />
                            &nbsp; {t('admin.lots.save')}
                          </Button>
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            </Form>
          </Col>
        </Row>

        <CustomModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          variant="cancel"
          title={t('admin.lots.deleteModalTitle')}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                {t('admin.lots.cancel')}
              </Button>
              <SpinnerButton variant="danger" className="btn-cancel" onClick={handleDeleteLot} loading={saving}>
                {t('admin.lots.delete')}
              </SpinnerButton>
            </>
          }
        >
          <Trans i18nKey="admin.lots.deleteConfirm" values={{ name: selectedLot?.name }} components={{ b: <b /> }} />
        </CustomModal>

        <CustomModal
          show={showAddModal}
          size="xl"
          onHide={() => setShowAddModal(false)}
          variant="confirm"
          icon="plus"
          title={t('admin.lots.addModalTitle')}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                {t('admin.lots.cancel')}
              </Button>
              <SpinnerButton variant="primary" className="btn-confirm" onClick={handleAddLot} loading={saving}>
                {t('admin.lots.add')}
              </SpinnerButton>
            </>
          }
        >
          <Form>
            <Row>
              <Col md={12} lg={6} className="mb-3">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>{t('admin.lots.formNameShort')}</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={newLot.name}
                    onChange={(e) => setNewLot({ ...newLot, name: e.target.value })}
                    className={`form-control-lg form-control-bg admin-field--even`}
                    placeholder={t('admin.lots.namePlaceholder')}
                  />
                </Form.Group>
              </Col>

              <Col md={12} lg={6} className="mb-3">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>{t('admin.lots.registrationFee')}</strong>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={newLot.price.registrationFee}
                    onChange={(e) =>
                      setNewLot({
                        ...newLot,
                        price: { ...newLot.price, registrationFee: e.target.value },
                      })
                    }
                    className="form-control-lg form-control-bg admin-field--odd"
                    placeholder={t('admin.lots.pricePlaceholder')}
                  />
                </Form.Group>
              </Col>

              <Col md={12} lg={6} className="mb-3">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>{t('admin.lots.totalVacancies')}</strong>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={newLot.totalVacancies}
                    onChange={(e) => setNewLot({ ...newLot, totalVacancies: e.target.value })}
                    className="form-control-lg form-control-bg admin-field--even"
                  />
                  <Form.Text className="text-secondary">{t('admin.lots.totalVacanciesHint')}</Form.Text>
                </Form.Group>
              </Col>

              <Col md={12} lg={6} className="mb-3">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>{t('admin.lots.startDate')}</strong>
                  </Form.Label>
                  <DatePicker
                    selected={parseDate(newLot.startDate)}
                    onChange={(date) => setNewLot({ ...newLot, startDate: formatDate(date) })}
                    className="form-control form-control-lg admin-field--even"
                    placeholderText={t('admin.lots.datePlaceholder')}
                    dateFormat="dd/MM/yyyy"
                    locale="ptBR"
                    dropdownMode="select"
                    showMonthDropdown
                    showYearDropdown
                  />
                </Form.Group>
              </Col>

              <Col md={12} lg={6} className="mb-3">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>{t('admin.lots.endDate')}</strong>
                  </Form.Label>
                  <DatePicker
                    selected={parseDate(newLot.endDate)}
                    onChange={(date) => setNewLot({ ...newLot, endDate: formatDate(date) })}
                    className="form-control form-control-lg admin-field--even"
                    placeholderText={t('admin.lots.datePlaceholder')}
                    dateFormat="dd/MM/yyyy"
                    locale="ptBR"
                    dropdownMode="select"
                    showMonthDropdown
                    showYearDropdown
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </CustomModal>

        <Loading loading={loading || loadingContent} />
      </div>
    </div>
  );
};

AdminLotManagement.propTypes = {
  loggedUsername: PropTypes.string,
  loading: PropTypes.bool,
};

export default AdminLotManagement;
