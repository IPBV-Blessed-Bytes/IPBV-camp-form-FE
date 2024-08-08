import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Form, Container, Accordion, Table, Row, Col, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Icons from '../../../components/Icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useTable, useSortBy } from 'react-table';

// const API_URL = 'http://ec2-35-89-80-98.us-west-2.compute.amazonaws.com:8080';

const AdminRide = () => {
  const [rideData, setRideData] = useState({ offerRide: [], needRide: [] });
  const rideApiUrl = 'endpointurl';
  const needRideApiUrl = 'endpointurl';

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rideResponse = await axios.get(rideApiUrl);
        const needRideResponse = await axios.get(needRideApiUrl);

        setRideData({
          offerRide: rideResponse.data,
          needRide: needRideResponse.data,
        });
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      }
    };

    fetchData();
  }, []);

  const handleCheckboxChange = async (type, id, checked) => {
    try {
      const apiUrl = type === 'offerRide' ? rideApiUrl : needRideApiUrl;
      await axios.patch(`${apiUrl}/${id}`, { checked });

      setRideData((prevData) => ({
        ...prevData,
        [type]: prevData[type].map((ride) => (ride.id === id ? { ...ride, checked } : ride)),
      }));
    } catch (error) {
      console.error('Erro ao atualizar o estado do checkbox:', error);
    }
  };

  const generateExcel = () => {
    const combinedData = [...rideData.offerRide, ...rideData.needRide];
    const worksheet = XLSX.utils.json_to_sheet(combinedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rides');
    XLSX.writeFile(workbook, 'rides_data.xlsx');
  };

  const offerRideColumns = useMemo(
    () => [
      {
        Header: 'Marcador',
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
        Header: 'Nome',
        accessor: 'name',
      },
      {
        Header: 'Vagas no Carro',
        accessor: 'seatsInTheCar',
      },
      {
        Header: 'Observação',
        accessor: 'observation',
      },
    ],
    [],
  );

  const needRideColumns = useMemo(
    () => [
      {
        Header: 'Marcador',
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
        Header: 'Nome',
        accessor: 'name',
      },
      {
        Header: 'Observação',
        accessor: 'observation',
      },
    ],
    [],
  );

  const offerRideTableInstance = useTable({ columns: offerRideColumns, data: rideData.offerRide }, useSortBy);
  const needRideTableInstance = useTable({ columns: needRideColumns, data: rideData.needRide }, useSortBy);

  const renderTable = (tableInstance) => {
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

    return (
      <div className="table-responsive">
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
      <Row className="mt-3">
        <Col>
          <Button variant="danger" onClick={() => navigate('/admin')}>
            <Icons typeIcon="arrow-left" iconSize={30} fill="#fff" />
            &nbsp;Voltar
          </Button>
        </Col>
        <Col className="d-flex justify-content-end align-items-center">
          <h4 className="fw-bold m-0">Tabela de Gerenciamento de Caronas:</h4>
        </Col>
      </Row>
      <hr className="horizontal-line" />

      <Row className="table-tools--rides-buttons-wrapper mb-4">
        <Col xs={6}>
          <div className="table-tools__left-buttons-ride d-flex gap-2">
            <Button variant="success" onClick={generateExcel} className="d-flex align-items-center" size="lg">
              <Icons typeIcon="excel" iconSize={30} fill="#fff" />
              <span className="table-tools__button-name">&nbsp;Baixar Excel</span>
            </Button>
          </div>
        </Col>
      </Row>

      <Accordion className="mb-3">
        <Accordion.Header>Oferecem Carona</Accordion.Header>
        <Accordion.Body>
          <div className="table-responsive">{renderTable(offerRideTableInstance)}</div>
        </Accordion.Body>
      </Accordion>

      <Accordion>
        <Accordion.Header>Solicitam Carona</Accordion.Header>
        <Accordion.Body>
          <div className="table-responsive">{renderTable(needRideTableInstance)}</div>
        </Accordion.Body>
      </Accordion>
    </Container>
  );
};

AdminRide.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      checked: PropTypes.bool,
      id: PropTypes.string.isRequired,
    }).isRequired,
  }),
};

export default AdminRide;
