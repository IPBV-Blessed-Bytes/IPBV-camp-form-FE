import React, { useState, useEffect, useMemo } from 'react';
import jsonData from './data.json';
import { Container, Row, Button, Form } from 'react-bootstrap';
import { useTable, useFilters } from 'react-table';
import 'bootstrap/dist/css/bootstrap.min.css';
import Icons from '../../components/Icons';

const DefaultColumnFilter = ({ column: { filterValue, setFilter } }) => (
  <div className="d-flex">
    
    {/* <Form.Control
      className={filterValue ? 'actived-filter' : ''}
      value={filterValue || ''}
      onChange={(e) => setFilter(e.target.value || undefined)}
      placeholder="Pesquise..."
      size="lg"
      type="text"
    /> */}

    <input
      className={filterValue ? 'actived-filter' : ''}
      value={filterValue || ''}
      onChange={(e) => setFilter(e.target.value || undefined)}
      placeholder="Pesquise..."
    />

    {filterValue && <Icons typeIcon="filter" iconSize={28} fill="#4267a7" />}
  </div>
);

const AdminTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(jsonData);
  }, []);

  const columns = useMemo(() => {
    const columnData = [
      'pacote',
      'nome',
      'observacao',
      'pagamento',
      'igreja',
      'dataInscricao',
      'carona',
      'nascimento',
      'cpf',
      'rg',
      'orgaoExpedidor',
      'estadoOrgaoExpedidor',
      'categoria',
      'celular',
      'whatsapp',
      'email',
      'preco',
      'alergia',
      'agregados',
      'idAcomodacao',
      'acomodacao',
      'subAcomodacao',
      'alimentacao',
      'transporte',
    ];

    return [
      ...columnData.map((col) => ({
        Header: col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1'),
        accessor: col,
        Filter: DefaultColumnFilter,
      })),
      {
        Header: 'Ações',
        Cell: () => (
          <>
            <Button variant="info" className="mr-2">
              Editar
            </Button>
            <Button variant="danger">Deletar</Button>
          </>
        ),
        disableFilters: true,
      },
    ];
  }, []);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      defaultColumn: { Filter: DefaultColumnFilter },
    },
    useFilters,
  );

  return (
    <Container fluid>
      <Row>Formulário de Inscrições</Row>
      <Row>
        <div className="w-100 overflow-auto">
          <table
            {...getTableProps()}
            className="table table-bordered table-striped table-hover table-responsive table-light admin-table w-100"
          >
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()}>
                      {column.render('Header')}
                      <div>{column.canFilter ? column.render('Filter') : null}</div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Row>
    </Container>
  );
};

export default AdminTable;
