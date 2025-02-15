import { useState, useEffect, useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import { Form, Container, Accordion, Table, Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import * as XLSX from 'xlsx';
import { registerLog } from '@/fetchers/userLogs';
import fetcher from '@/fetchers/fetcherWithCredentials';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import AdminHeader from '@/components/Admin/AdminHeader';

const AdminRide = ({ loggedUsername }) => {
  const [rideData, setRideData] = useState({ offerRide: [], needRide: [] });
  const [loading, setLoading] = useState(true);
  const [showDeleteRelationshipModal, setShowDeleteRelationshipModal] = useState(false);
  const [camperToDelete, setCamperToDelete] = useState(false);

  scrollUp();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rideResponse = await fetcher.get(`ride/offer`);
        const needRideResponse = await fetcher.get(`ride/need`);

        setRideData({
          offerRide: rideResponse.data,
          needRide: needRideResponse.data,
        });
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
      await fetcher.patch(`ride/${id}`, { checked });

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

      await fetcher.put(`ride/${offerRideId}/${needRideId}`);
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

    const flattenObject = (obj, parent = '', res = {}) => {
      for (let key in obj) {
        let propName = parent ? `${parent}.${key}` : key;

        let value = obj[key];
        if (typeof value === 'boolean') {
          value = value ? 'Sim' : 'Não';
        }
        res[fieldMapping[propName] || propName] = value;
      }
      return res;
    };

    const combinedData = [...rideData.offerRide, ...rideData.needRide].map((row) => {
      return flattenObject(row);
    });

    const worksheet = XLSX.utils.json_to_sheet(combinedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rides');
    XLSX.writeFile(workbook, 'rides_data.xlsx');
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
      await fetcher.delete(`ride/${needRideId}`);

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

  const offerRideColumns = useMemo(
    () => [
      {
        Header: 'Marcador:',
        accessor: 'select',
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
        Cell: ({ row }) => {
          const availableSeats = row.original.seatsInTheCar - (row.original.relationship?.length || 0);
          return availableSeats > 0 ? `${availableSeats} vagas disponíveis` : <b>CARRO LOTADO</b>;
        },
      },
      {
        Header: 'Contato:',
        accessor: 'cellPhone',
      },
      {
        Header: 'Observação:',
        accessor: 'observation',
      },
      {
        Header: 'Caronas Relacionadas:',
        accessor: 'relationship',
        Cell: ({ row }) => {
          return (
            <Accordion>
              <Accordion.Header className="accordion-header-custom">Vínculos</Accordion.Header>
              <Accordion.Body className="accordion-body-custom">
                <ul>
                  {row.original.relationship && row.original.relationship.length > 0 ? (
                    row.original.relationship.map((relatedRide) =>
                      relatedRide ? (
                        <li key={relatedRide.id}>
                          <div className="d-flex justify-content-between">
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
                        </li>
                      ) : null,
                    )
                  ) : (
                    <span>Sem caronas relacionadas</span>
                  )}
                </ul>
              </Accordion.Body>
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
      },
      {
        Header: 'Observação:',
        accessor: 'observation',
      },
      {
        Header: 'Caronas Disponíveis:',
        accessor: 'offerSelect',
        Cell: ({ row }) => {
          return (
            <Form.Select onChange={(e) => handleCreateRelationship(e.target.value, row.original.id)} defaultValue="">
              <option value="" disabled>
                Selecione uma carona...
              </option>
              {rideData.offerRide
                .filter((offer) => {
                  const availableSeats = offer.seatsInTheCar - offer.relationship.length;
                  return availableSeats >= 1;
                })
                .map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.name}
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
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map((column) => (
                  <th
                    className="table-cells-header"
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    key={column.id}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      {column.render('Header')}
                      <span className="sort-icon-wrapper">
                        <Icons className="sort-icon" typeIcon="sort" iconSize={20} />
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={row.id}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} key={cell.column.id}>
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  };

  return (
    <Container fluid>
      <AdminHeader
        pageName="Gerenciamento de Caronas"
        sessionTypeIcon="ride"
        iconSize={80}
        fill={'#204691'}
        showHeaderTools
        headerToolsClassname="table-tools__right-buttons-generic flex-sm-column flex-md-row  d-flex gap-2"
        headerToolsTypeButton="success"
        headerToolsOpenModal={generateExcel}
        headerToolsButtonIcon="excel"
        headerToolsButtonName="Baixar Excel"
      />

      <Accordion className="mb-3">
        <Accordion.Header>Oferecem Carona</Accordion.Header>
        <Accordion.Body>{renderTable(offerRideTableInstance)}</Accordion.Body>
      </Accordion>

      <Accordion>
        <Accordion.Header>Precisam de Carona</Accordion.Header>
        <Accordion.Body>{renderTable(needRideTableInstance)}</Accordion.Body>
      </Accordion>

      <Modal show={showDeleteRelationshipModal} onHide={handleCloseDeleteRelationshipModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>Confirmar Exclusão</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>Tem certeza de que deseja excluir esse acampante dessa carona?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteRelationshipModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => handleDeleteRelationship(camperToDelete)}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>

      <Loading loading={loading} />
    </Container>
  );
};

AdminRide.propTypes = {
  loggedUsername: PropTypes.string,
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
