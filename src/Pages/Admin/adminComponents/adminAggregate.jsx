import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useTable, useSortBy } from 'react-table';
import Icons from '@/components/Icons';
import Loading from '@/components/Loading';
import fetcher from '@/fetchers/fetcherWithCredentials';

const AdminAggregate = () => {
  const [dropdownCampers, setDropdownCampers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetcher.get('camper', {
          params: {
            size: 100000,
          },
        });

        const campers = Object.entries(response.data.content).map(([key, camper]) => ({
          id: key,
          personalInformation: camper.personalInformation,
          contact: camper.contact,
        }));

        const sortedCampers = campers.sort((a, b) =>
          a.personalInformation.name.localeCompare(b.personalInformation.name),
        );

        const filteredCampers = sortedCampers.filter((camper) => camper.contact.hasAggregate);

        setDropdownCampers(filteredCampers);
      } catch (error) {
        toast.error('Erro ao carregar usuários');
        console.error('Erro ao buscar campers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    scrollUp();
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const columns = useMemo(
    () => [
      {
        Header: 'Usuário:',
        accessor: 'personalInformation.name',
      },
      {
        Header: 'Agregados:',
        accessor: 'contact.aggregate',
        Cell: ({ value }) => (value ? value.split('|').join(', ') : 'Nenhum agregado'),
      },
    ],
    [],
  );

  const tableInstance = useTable({ columns, data: dropdownCampers }, useSortBy);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

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
          <h4 className="fw-bold m-0">Gerenciamento de Agregados</h4>
          <Icons className="m-left" typeIcon="aggregate" iconSize={80} fill={'#204691'} />
        </Col>
      </Row>
      <hr className="horizontal-line" />

      <Table striped bordered hover responsive className="custom-table mt-3" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())} className="table-cells-header">
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
          {rows.length === 0 ? (
            <tr>
              <td colSpan="2" className="text-center">
                Nenhum usuário com agregados encontrado
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </Table>

      <Loading loading={loading} />
    </Container>
  );
};

export default AdminAggregate;
