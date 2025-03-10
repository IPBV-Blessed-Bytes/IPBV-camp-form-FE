import React from 'react';
import Icons from '@/components/Global/Icons';
import { Table } from 'react-bootstrap';
import PropTypes from 'prop-types';

const CoreTable = ({
  getTableProps,
  getTableBodyProps,
  headerGroups,
  rows,
  prepareRow,
  showFilters,
  selectedRows,
}) => {
  return (
    <div className="table-responsive">
      <Table striped bordered hover {...getTableProps()} className="custom-table">
        <thead>
          {headerGroups.map((headerGroup) => (
            <React.Fragment key={headerGroup.id}>
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th className="table-cells-header" key={column.id}>
                    <div className="d-flex justify-content-between align-items-center">
                      {column.render('Header')}
                      <span
                        className="sort-icon-wrapper px-3"
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                      >
                        <Icons className="sort-icon" typeIcon="sort" iconSize={20} />
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
              {showFilters && (
                <tr className="filter">
                  {headerGroup.headers.map((column) => (
                    <th key={column.id}>{column.canFilter ? column.render('Filter') : null}</th>
                  ))}
                </tr>
              )}
            </React.Fragment>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);

            return (
              <tr {...row.getRowProps()} key={row.id}>
                {row.cells.map((cell) => (
                  <td
                    className={`table-cells-cols${
                      selectedRows.some((selectedRow) => selectedRow.index === row.index) ? ' selected-row' : ''
                    }`}
                    key={cell.id}
                    {...cell.getCellProps()}
                  >
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

CoreTable.propTypes = {
  getTableProps: PropTypes.func,
  getTableBodyProps: PropTypes.func,
  headerGroups: PropTypes.object,
  rows: PropTypes.object,
  prepareRow: PropTypes.func,
  showFilters: PropTypes.bool,
  selectedRows: PropTypes.array,
};

export default CoreTable;
