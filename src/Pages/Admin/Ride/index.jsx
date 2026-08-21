import { useState, useEffect, useMemo, Fragment } from 'react';
import { useTable, useSortBy } from 'react-table';
import { Form, Accordion, Table, Button, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import { downloadSingleSheet, flattenForExcel } from '@/utils/excelExport';
import { registerLog } from '@/services/logs';
import {
  listRideOffers,
  listRideNeeds,
  setRideChecked,
  matchRide,
  deleteRide,
} from '@/services/rides';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';

const digitsOnly = (v) => (v || '').replace(/\D/g, '');

const WhatsAppLink = ({ phone }) => {
  const digits = digitsOnly(phone);
  if (!digits) return <span className="text-secondary">—</span>;
  const wa = digits.length > 11 ? digits : `55${digits}`;
  return (
    <a className="ride-contact" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
      <Icons typeIcon="whatsapp" iconSize={16} fill="#25D366" />
      <span>{phone}</span>
    </a>
  );
};
WhatsAppLink.propTypes = { phone: PropTypes.string };

const SeatIndicator = ({ total, used }) => {
  const seatCount = Number(total) || 0;
  const free = Math.max(seatCount - (used || 0), 0);
  return (
    <div className="ride-seats">
      <span className="ride-seats__pills">
        {Array.from({ length: seatCount }).map((_, i) => (
          <span key={i} className={`ride-seats__pill ${i < (used || 0) ? 'is-used' : ''}`} />
        ))}
      </span>
      {free > 0 ? (
        <Badge bg="teal-blue">
          {free} livre{free === 1 ? '' : 's'}
        </Badge>
      ) : (
        <Badge bg="danger">Lotado</Badge>
      )}
    </div>
  );
};
SeatIndicator.propTypes = { total: PropTypes.number, used: PropTypes.number };

const RideStat = ({ label, value, tone }) => (
  <div className={`ride-stat ride-stat--${tone || 'default'}`}>
    <span className="ride-stat__value">{value}</span>
    <span className="ride-stat__label">{label}</span>
  </div>
);
RideStat.propTypes = { label: PropTypes.string, value: PropTypes.node, tone: PropTypes.string };

const AdminRide = ({ loggedUsername }) => {
  const [rideData, setRideData] = useState({ offerRide: [], needRide: [] });
  const [loading, setLoading] = useState(true);
  const [showDeleteRelationshipModal, setShowDeleteRelationshipModal] = useState(false);
  const [camperToDelete, setCamperToDelete] = useState(false);

  scrollUp();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offerRide, needRide] = await Promise.all([listRideOffers(), listRideNeeds()]);

        setRideData({ offerRide, needRide });
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCheckboxChange = async (type, id, checked) => {
    try {
      await setRideChecked(id, checked);

      setRideData((prevData) => ({
        ...prevData,
        [type]: prevData[type].map((ride) => (ride.id === id ? { ...ride, checked } : ride)),
      }));
    } catch (error) {
      console.error('Erro ao atualizar o estado do checkbox:', error);
    }
  };

  const handleCreateRelationship = async (offerRideId, needRideId) => {
    try {
      const needRide = rideData.needRide.find((ride) => ride.id === needRideId);
      const offerRide = rideData.offerRide.find((ride) => ride.id === offerRideId);

      await matchRide(offerRideId, needRideId);
      setRideData((prevData) => {
        const updatedOfferRide = prevData.offerRide.map((offer) => {
          if (offer.id === offerRideId) {
            return {
              ...offer,
              relationship: [...(offer.relationship || []), { id: needRideId, name: needRide.name }],
            };
          }
          return offer;
        });

        const updatedNeedRide = prevData.needRide.filter((ride) => ride.id !== needRideId);
        toast.success('Carona vinculada com sucesso');

        if (needRide && offerRide) {
          registerLog(
            `Criou o relacionamento de carona entre ${offerRide.name} (oferecendo) e ${needRide.name} (solicitando)`,
            loggedUsername,
          );
        }

        return { offerRide: updatedOfferRide, needRide: updatedNeedRide };
      });
    } catch (error) {
      console.error('Erro ao criar relacionamento:', error);
    }
  };

  const generateExcel = () => {
    const fieldMapping = {
      id: 'ID',
      type: 'Tipo',
      name: 'Nome',
      seatsInTheCar: 'Vagas no Carro',
      observation: 'Observação',
      cellPhone: 'Contato',
      checked: 'Checked',
    };

    const rows = [...rideData.offerRide, ...rideData.needRide].map((row) => flattenForExcel(row, fieldMapping));

    downloadSingleSheet({ filename: 'caronas.xlsx', sheetName: 'Rides', rows });
  };

  const handleShowDeleteRelationshipModal = (needRideId) => {
    setCamperToDelete(needRideId);
    setShowDeleteRelationshipModal(true);
  };

  const handleCloseDeleteRelationshipModal = () => {
    setCamperToDelete(null);
    setShowDeleteRelationshipModal(false);
  };

  const handleDeleteRelationship = async (needRideId) => {
    try {
      await deleteRide(needRideId);

      const removedNeedRide = rideData.offerRide
        .flatMap((offer) => offer.relationship)
        .find((related) => related.id === needRideId);

      const offerWithRelationship = rideData.offerRide.find((offer) =>
        offer.relationship.some((related) => related.id === needRideId),
      );

      setRideData((prevData) => {
        const updatedOfferRide = prevData.offerRide.map((offer) => ({
          ...offer,
          relationship: offer.relationship.filter((related) => related.id !== needRideId),
        }));

        const updatedNeedRide = removedNeedRide ? [...prevData.needRide, removedNeedRide] : prevData.needRide;

        toast.success('Carona desvinculada com sucesso');
        handleCloseDeleteRelationshipModal();

        if (offerWithRelationship && removedNeedRide) {
          registerLog(
            `Deletou o relacionamento de carona entre ${offerWithRelationship.name} (oferecendo) e ${removedNeedRide.name} (necessitando)`,
            loggedUsername,
          );
        }

        return { offerRide: updatedOfferRide, needRide: updatedNeedRide };
      });
    } catch (error) {
      console.error('Erro ao desvincular carona:', error);
    }
  };

  const stats = useMemo(() => {
    const cars = rideData.offerRide.length;
    const totalSeats = rideData.offerRide.reduce((s, o) => s + (Number(o.seatsInTheCar) || 0), 0);
    const usedSeats = rideData.offerRide.reduce((s, o) => s + (o.relationship?.length || 0), 0);
    const freeSeats = Math.max(totalSeats - usedSeats, 0);
    const waiting = rideData.needRide.length;
    const totalPeople = usedSeats + waiting;
    const matchedPct = totalPeople > 0 ? Math.round((usedSeats / totalPeople) * 100) : 0;
    return { cars, totalSeats, usedSeats, freeSeats, waiting, matchedPct };
  }, [rideData]);

  const offerRideColumns = useMemo(
    () => [
      {
        Header: 'Marcador:',
        accessor: 'select',
        disableSortBy: true,
        Cell: ({ row }) => (
          <Form.Check
            type="checkbox"
            checked={row.original.checked}
            onChange={(e) => handleCheckboxChange('offerRide', row.original.id, e.target.checked)}
          />
        ),
      },
      {
        Header: 'Nome:',
        accessor: 'name',
      },
      {
        Header: 'Vagas Disponibilizadas:',
        accessor: 'seatsInTheCar',
      },
      {
        Header: 'Status:',
        accessor: 'status',
        disableSortBy: true,
        Cell: ({ row }) => (
          <SeatIndicator total={row.original.seatsInTheCar} used={row.original.relationship?.length || 0} />
        ),
      },
      {
        Header: 'Contato:',
        accessor: 'cellPhone',
        Cell: ({ value }) => <WhatsAppLink phone={value} />,
      },
      {
        Header: 'Observação:',
        accessor: 'observation',
      },
      {
        Header: 'Caronas Relacionadas:',
        accessor: 'relationship',
        disableSortBy: true,
        Cell: ({ row }) => {
          return (
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header className="">Vínculos</Accordion.Header>
                <Accordion.Body className="">
                  {row.original.relationship && row.original.relationship.length > 0 ? (
                    row.original.relationship.map(
                      (relatedRide, index) =>
                        relatedRide && (
                          <Fragment key={`${relatedRide.id}-${index}`}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span>{relatedRide.name}</span>&nbsp;
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleShowDeleteRelationshipModal(relatedRide.id)}
                              >
                                <Icons typeIcon="delete" iconSize={24} fill="#fff" />
                              </Button>
                            </div>
                            <hr className="horizontal-line" />
                          </Fragment>
                        ),
                    )
                  ) : (
                    <span>Sem caronas relacionadas</span>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          );
        },
      },
    ],
    [rideData.needRide],
  );

  const needRideColumns = useMemo(
    () => [
      {
        Header: 'Marcador:',
        accessor: 'select',
        disableSortBy: true,
        Cell: ({ row }) => (
          <Form.Check
            type="checkbox"
            checked={row.original.checked}
            onChange={(e) => handleCheckboxChange('needRide', row.original.id, e.target.checked)}
          />
        ),
      },
      {
        Header: 'Nome:',
        accessor: 'name',
      },
      {
        Header: 'Contato:',
        accessor: 'cellPhone',
        Cell: ({ value }) => <WhatsAppLink phone={value} />,
      },
      {
        Header: 'Observação:',
        accessor: 'observation',
      },
      {
        Header: 'Caronas Disponíveis:',
        accessor: 'offerSelect',
        disableSortBy: true,
        Cell: ({ row }) => {
          return (
            <Form.Select onChange={(e) => handleCreateRelationship(e.target.value, row.original.id)} defaultValue="">
              <option value="" disabled>
                Selecione uma carona...
              </option>
              {rideData.offerRide
                .map((offer) => ({
                  ...offer,
                  availableSeats: (offer.seatsInTheCar || 0) - (offer.relationship?.length || 0),
                }))
                .filter((offer) => offer.availableSeats >= 1)
                .map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.name} — {offer.availableSeats} vaga{offer.availableSeats === 1 ? '' : 's'}
                  </option>
                ))}
            </Form.Select>
          );
        },
      },
    ],
    [rideData.offerRide],
  );

  const offerRideTableInstance = useTable({ columns: offerRideColumns, data: rideData.offerRide }, useSortBy);
  const needRideTableInstance = useTable({ columns: needRideColumns, data: rideData.needRide }, useSortBy);

  const renderTable = (tableInstance) => {
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

    return (
      <div className="table-responsive ride">
        <Table striped bordered hover className="custom-table" {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => {
              const { key: headerGroupKey, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={headerGroupKey} {...restHeaderGroupProps}>
                  {headerGroup.headers.map((column) => {
                    const { key: columnKey, ...restColumnProps } = column.getHeaderProps(
                      column.getSortByToggleProps(),
                    );
                    return (
                      <th className="table-cells-header" key={columnKey} {...restColumnProps}>
                        <div className="d-flex justify-content-between align-items-center">
                          {column.render('Header')}
                          {column.canSort && (
                            <span className="sort-icon-wrapper">
                              <Icons className="sort-icon" typeIcon="sort" iconSize={20} fill="#fff" />
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              const { key: rowKey, ...restRowProps } = row.getRowProps();
              return (
                <tr key={rowKey} {...restRowProps}>
                  {row.cells.map((cell) => {
                    const { key: cellKey, ...restCellProps } = cell.getCellProps();
                    return (
                      <td key={cellKey} {...restCellProps}>
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  };

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'rooms-excel',
      name: 'Baixar Relatório',
      onClick: generateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--ride">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Caronas"
        subtitle="Ofertas e pedidos de carona dos inscritos"
        typeIcon="ride"
      />

      <div className="admin-subpage__content">
        <div className="ride-stats">
          <RideStat label="Carros" value={stats.cars} />
          <RideStat label="Vagas totais" value={stats.totalSeats} />
          <RideStat label="Ocupadas" value={stats.usedSeats} tone="used" />
          <RideStat label="Livres" value={stats.freeSeats} tone="free" />
          <RideStat label="Aguardando carona" value={stats.waiting} tone="waiting" />
          <RideStat label="Alocados" value={`${stats.matchedPct}%`} tone="pct" />
        </div>

        <AdminToolbar buttons={toolsButtons} />

        <Accordion className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Oferecem Carona</Accordion.Header>
          <Accordion.Body>{renderTable(offerRideTableInstance)}</Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Precisam de Carona</Accordion.Header>
          <Accordion.Body>{renderTable(needRideTableInstance)}</Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <CustomModal
        show={showDeleteRelationshipModal}
        onHide={handleCloseDeleteRelationshipModal}
        variant="cancel"
        title="Confirmar Exclusão"
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseDeleteRelationshipModal}>
              Cancelar
            </Button>
            <Button variant="danger" className="btn-cancel" onClick={() => handleDeleteRelationship(camperToDelete)}>
              Excluir
            </Button>
          </>
        }
      >
        Tem certeza de que deseja excluir esse acampante dessa carona?
      </CustomModal>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminRide.propTypes = {
  loggedUsername: PropTypes.string,
  value: PropTypes.string,
  rideData: PropTypes.shape({
    offerRide: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        relationship: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string,
          }),
        ),
        seatsInTheCar: PropTypes.number,
        checked: PropTypes.bool,
      }),
    ),
    needRide: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
      }),
    ),
  }),
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      checked: PropTypes.bool,
      seatsInTheCar: PropTypes.number,
      relationship: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          name: PropTypes.string,
        }),
      ),
    }),
    getRowProps: PropTypes.func,
    id: PropTypes.string,
    cells: PropTypes.arrayOf(PropTypes.object),
  }),
  handleCreateRelationship: PropTypes.func,
  handleDeleteRelationship: PropTypes.func,
  handleCheckboxChange: PropTypes.func,
  registerLog: PropTypes.func,
};

export default AdminRide;
