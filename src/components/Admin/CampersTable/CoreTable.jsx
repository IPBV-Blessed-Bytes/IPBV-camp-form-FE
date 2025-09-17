import React from 'react';
import Icons from '@/components/Global/Icons';
import { Table } from 'react-bootstrap';
import PropTypes from 'prop-types';

const CoreTable = ({ getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, showFilters, selectedRows }) => {
  return (
    <div className="table-responsive">
      <Table striped bordered hover {...getTableProps()} className="custom-table">
        <thead>
          {headerGroups.map((headerGroup) => {
            const { key: headerGroupKey, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
            return (
              <React.Fragment key={headerGroupKey}>
                <tr {...restHeaderGroupProps}>
                  {headerGroup.headers.map((column) => {
                    const { key: sortKey, ...restSortProps } = column.getHeaderProps(column.getSortByToggleProps());
                    return (
                      <th className="table-cells-header" key={column.id}>
                        <div className="d-flex justify-content-between align-items-center">
                          {column.render('Header')}
                          <span key={sortKey} {...restSortProps} className="sort-icon-wrapper px-3">
                            <Icons className="sort-icon" typeIcon="sort" iconSize={20} />
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
                {showFilters && (
                  <tr className="filter">
                    {headerGroup.headers.map((column) => (
                      <th key={column.id}>{column.canFilter ? column.render('Filter') : null}</th>
                    ))}
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            const { key: rowKey, ...restRowProps } = row.getRowProps();
            return (
              <tr key={rowKey} {...restRowProps}>
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
  getTableProps: PropTypes.func.isRequired,
  getTableBodyProps: PropTypes.func.isRequired,
  headerGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  prepareRow: PropTypes.func.isRequired,
  showFilters: PropTypes.bool,
  selectedRows: PropTypes.arrayOf(PropTypes.object),
};

export default CoreTable;
