import { useState, useEffect, useMemo } from 'react';
import { Table, Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTable, useSortBy } from 'react-table';
import Icons from '@/components/Icons';
import Loading from '@/components/Loading';
import fetcher from '@/fetchers/fetcherWithCredentials';
import AdminHeader from '../AdminComponents/adminHeader';

const AdminAggregate = () => {
  const [dropdownCampers, setDropdownCampers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <AdminHeader pageName="Gerenciamento de Agregados" typeIcon="aggregate" iconSize={80} fill={'#204691'} />

      <Table striped bordered hover responsive className="custom-table mt-3" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, index) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={index}>
              {headerGroup.headers.map((column, index) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())} className="table-cells-header" key={index}>
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
            rows.map((row, index) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={index}>
                  {row.cells.map((cell, index) => (
                    <td {...cell.getCellProps()} key={index}>{cell.render('Cell')}</td>
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
