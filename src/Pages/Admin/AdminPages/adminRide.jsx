import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Form, Container, Accordion, Table, Row, Col, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Icons from '@/components/Icons';
import * as XLSX from 'xlsx';
import { useTable, useSortBy } from 'react-table';
import Loading from '@/components/Loading';
import fetcher from '@/fetchers/fetcherWithCredentials';
import AdminHeader from '../AdminComponents/adminHeader';
import scrollUp from '@/fetchers/scrollUp';

const AdminRide = () => {
  const [rideData, setRideData] = useState({ offerRide: [], needRide: [] });
  const [loading, setLoading] = useState(true);

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

  const generateExcel = () => {
    const fieldMapping = {
      id: 'ID',
      type: 'Tipo',
      name: 'Nome',
      seatsInTheCar: 'Vagas no Carro',
      observation: 'Observação',
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
        Header: 'Vagas no Carro:',
        accessor: 'seatsInTheCar',
      },
      {
        Header: 'Observação:',
        accessor: 'observation',
      },
    ],
    [],
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
        Header: 'Observação:',
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

      <Loading loading={loading} />
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
