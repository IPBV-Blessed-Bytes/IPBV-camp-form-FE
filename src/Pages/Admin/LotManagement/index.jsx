import { useEffect, useState } from 'react';
import { Badge, Row, Col, Button, Form, Accordion } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/services/logs';
import DatePicker, { registerLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
import { parse, isValid } from 'date-fns';
import { getLotsAuthenticated, createLot, updateLot as updateLotRequest, deleteLot } from '@/services/lots';
import { getBaseDate, createBaseDate, updateBaseDate } from '@/services/baseDate';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
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

const formatDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('pt-BR');
};

const AdminLotManagement = ({ loading, loggedUsername }) => {
  const [loadingContent, setLoadingContent] = useState(false);
  const [lots, setLots] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLot, setNewLot] = useState({
    name: '',
    price: { ...defaultPrice },
    startDate: '',
    endDate: '',
  });
  const [baseDate, setBaseDate] = useState('');
  const [baseDateExists, setBaseDateExists] = useState(false);
  const [showBaseDateModal, setShowBaseDateModal] = useState(false);
  const [search, setSearch] = useState('');

  scrollUp();

  const fetchLots = async () => {
    try {
      setLoadingContent(true);
      const data = await getLotsAuthenticated();
      setLots(data?.lots || []);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar lotes');
    } finally {
      setLoadingContent(false);
    }
  };

  const fetchBaseDate = async () => {
    try {
      setLoadingContent(true);
      const data = await getBaseDate();
      if (data && data.baseDate) {
        setBaseDate(data.baseDate);
        setBaseDateExists(true);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Erro ao buscar data base:', error);
      }
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    fetchLots();
    fetchBaseDate();
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
      toast.error('Datas em conflito com outro lote');
      return;
    }

    try {
      setLoadingContent(true);
      await updateLotRequest(lot.id, {
        name: lot.name,
        startDate: lot.startDate,
        endDate: lot.endDate,
        price: { registrationFee: lot.price?.registrationFee || '' },
      });
      toast.success(`${lot.name} atualizado com sucesso`);
      registerLog(`Atualizou o ${lot.name}`, loggedUsername);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar lote');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleDeleteLot = async () => {
    if (!selectedLot) return;

    try {
      setLoadingContent(true);
      await deleteLot(selectedLot.id);
      toast.success(`${selectedLot.name} deletado com sucesso`);
      registerLog(`Deletou o ${selectedLot.name}`, loggedUsername);
      setShowDeleteModal(false);
      fetchLots();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao deletar lote');
    } finally {
      setLoadingContent(false);
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
      toast.error('Datas em conflito com outro lote');
      return;
    }

    try {
      setLoadingContent(true);
      await createLot({
        name: newLot.name,
        startDate: newLot.startDate,
        endDate: newLot.endDate,
        price: { registrationFee: newLot.price.registrationFee || '' },
      });
      toast.success(`${newLot.name} adicionado com sucesso`);
      registerLog(`Adicionou o ${newLot.name}`, loggedUsername);
      setShowAddModal(false);
      setNewLot({
        name: '',
        price: { ...defaultPrice },
        startDate: '',
        endDate: '',
      });
      fetchLots();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao adicionar lote');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleSaveBaseDate = async () => {
    if (!baseDate) {
      toast.warning('Por favor, selecione uma data válida');
      return;
    }

    try {
      setLoadingContent(true);
      if (baseDateExists) {
        await updateBaseDate(baseDate);
        toast.success('Data do evento atualizada com sucesso');
        registerLog(`Alterou a data do evento para ${baseDate}`, loggedUsername);
      } else {
        await createBaseDate(baseDate);
        toast.success('Data do evento criada com sucesso');
        registerLog(`Criou a data do evento: ${baseDate}`, loggedUsername);
        setBaseDateExists(true);
      }
      setShowBaseDateModal(false);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar data base');
    } finally {
      setLoadingContent(false);
    }
  };

  const now = new Date();
  const currentLot = lots.find((lot) => {
    const start = parseDate(lot.startDate);
    const end = parseDate(lot.endDate);
    return start && end && now >= start && now <= end;
  });
  const upcomingCount = lots.filter((lot) => {
    const start = parseDate(lot.startDate);
    return start && now < start;
  }).length;
  const endedCount = lots.filter((lot) => {
    const end = parseDate(lot.endDate);
    return end && now > end;
  }).length;
  const statItems = [
    { label: 'Total de lotes', value: lots.length },
    { label: 'Lote atual', value: currentLot?.name || '—', tone: 'free' },
    { label: 'A iniciar', value: upcomingCount, tone: 'info' },
    { label: 'Encerrados', value: endedCount, tone: 'used' },
  ];
  const term = search.trim().toLowerCase();
  const filteredLots = lots.filter((lot) => !term || (lot.name || '').toLowerCase().includes(term));

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'add-new-lot',
      name: 'Adicionar Novo Lote',
      onClick: () => setShowAddModal(true),
      typeButton: 'outline-teal-blue',
      typeIcon: 'plus',
    },
    {
      fill: '#fff',
      iconSize: 22,
      id: 'edit-base-date',
      name: 'Alterar Data do Evento',
      onClick: async () => {
        await fetchBaseDate();
        setShowBaseDateModal(true);
      },
      typeButton: 'teal-blue',
      typeIcon: 'calendar-alt',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--lots">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Lotes e Data"
        subtitle="Lotes de preço e data do evento"
        typeIcon="calendar"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="lots-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder="Buscar por nome..." />
        </div>

        <Row className="justify-content-center">
          <Col>
            <Form>
              <Accordion alwaysOpen>
                {filteredLots.map((lot, index) => {
                  const today = new Date();
                  const start = parseDate(lot.startDate);
                  const end = parseDate(lot.endDate);
                  const isCurrentLot = start && end && today >= start && today <= end;

                  return (
                    <Accordion.Item eventKey={String(index)} key={lot.id}>
                      <Accordion.Header>
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <span>
                            <strong>{lot.name || `Lote ${index + 1}`}</strong>
                            {isCurrentLot && (
                              <Badge bg="success" className="ms-2">
                                Atual
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
                            <strong>Nome do Lote:</strong>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={lot.name}
                            onChange={(e) => handleLotChange(lot.id, 'name', e.target.value)}
                            className="form-control-lg"
                            placeholder="Nome do Lote"
                          />
                        </Form.Group>

                        <Row>
                          <Col xs={12} md={4} className="mb-3">
                            <Form.Group>
                              <Form.Label>
                                <strong>Data Início:</strong>
                              </Form.Label>
                              <DatePicker
                                selected={parseDate(lot.startDate)}
                                onChange={(date) => handleLotChange(lot.id, 'startDate', formatDate(date))}
                                className="form-control form-control-lg"
                                placeholderText="dd/mm/aaaa"
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
                                <strong>Data Fim:</strong>
                              </Form.Label>
                              <DatePicker
                                selected={parseDate(lot.endDate)}
                                onChange={(date) => handleLotChange(lot.id, 'endDate', formatDate(date))}
                                className="form-control form-control-lg"
                                placeholderText="dd/mm/aaaa"
                                dateFormat="dd/MM/yyyy"
                                locale="ptBR"
                                dropdownMode="select"
                                showMonthDropdown
                                showYearDropdown
                              />
                            </Form.Group>
                          </Col>

                        </Row>

                        <div className="d-flex mt-3 justify-content-end gap-2">
                          <Button
                            variant="outline-danger"
                            onClick={() => {
                              setSelectedLot(lot);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Icons typeIcon="delete" iconSize={20} fill="#dc3545" />
                            &nbsp; Deletar
                          </Button>
                          <Button variant="teal-blue" onClick={() => updateLot(lot)}>
                            <Icons typeIcon="checked" iconSize={20} fill="#fff" />
                            &nbsp; Salvar
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
          title="Confirmar Exclusão"
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </Button>
              <Button variant="danger" className="btn-cancel" onClick={handleDeleteLot}>
                Deletar
              </Button>
            </>
          }
        >
          Tem certeza que deseja excluir <b>{selectedLot?.name}</b>?
        </CustomModal>

        <CustomModal
          show={showAddModal}
          size="xl"
          onHide={() => setShowAddModal(false)}
          variant="confirm"
          icon="plus"
          title="Adicionar Novo Lote"
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" className="btn-confirm" onClick={handleAddLot}>
                Adicionar
              </Button>
            </>
          }
        >
          <Form>
            <Row>
              <Col md={12} lg={6} className="mb-3">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Nome:</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={newLot.name}
                    onChange={(e) => setNewLot({ ...newLot, name: e.target.value })}
                    className={`form-control-lg form-control-bg admin-field--even`}
                    placeholder="Nome do Lote"
                  />
                </Form.Group>
              </Col>


              <Col md={12} lg={6} className="mb-3">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Data Início:</strong>
                  </Form.Label>
                  <DatePicker
                    selected={parseDate(newLot.startDate)}
                    onChange={(date) => setNewLot({ ...newLot, startDate: formatDate(date) })}
                    className="form-control form-control-lg admin-field--even"
                    placeholderText="dd/mm/aaaa"
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
                    <strong>Data Fim:</strong>
                  </Form.Label>
                  <DatePicker
                    selected={parseDate(newLot.endDate)}
                    onChange={(date) => setNewLot({ ...newLot, endDate: formatDate(date) })}
                    className="form-control form-control-lg admin-field--even"
                    placeholderText="dd/mm/aaaa"
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

        <CustomModal
          show={showBaseDateModal}
          onHide={() => setShowBaseDateModal(false)}
          variant="confirm"
          icon="plus"
          title="Alterar Data do Evento"
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowBaseDateModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" className="btn-confirm" onClick={handleSaveBaseDate}>
                Salvar
              </Button>
            </>
          }
        >
          <Form.Group>
            <Form.Label>
              <b>Selecione a data do evento:</b>
            </Form.Label>
            <DatePicker
              selected={parseDate(baseDate)}
              onChange={(date) => setBaseDate(formatDate(date))}
              className="form-control form-control-lg mb-2"
              placeholderText="dd/mm/aaaa"
              dateFormat="dd/MM/yyyy"
              locale="ptBR"
              dropdownMode="select"
              showMonthDropdown
              showYearDropdown
            />
            <Form.Text>
              Esta é a data de início do evento e será usada como referência para o cálculo de idades e pacotes.
            </Form.Text>
          </Form.Group>
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
