import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';

const TablePagination = ({
  pageIndex,
  pageCount,
  pageSize,
  totalRows,
  canPreviousPage,
  canNextPage,
  gotoPage,
  previousPage,
  nextPage,
  setPageSize,
  pageSizeOptions,
}) => {
  if (totalRows === 0) return null;

  const firstRow = pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="table-pagination">
      <span className="table-pagination__info">
        {firstRow}–{lastRow} de {totalRows}
      </span>

      <div className="table-pagination__controls">
        <button
          type="button"
          className="table-pagination__btn"
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
          aria-label="Primeira página"
        >
          <Icons typeIcon="arrow-left" iconSize={16} fill="#007185" />
          <Icons typeIcon="arrow-left" iconSize={16} fill="#007185" />
        </button>
        <button
          type="button"
          className="table-pagination__btn"
          onClick={previousPage}
          disabled={!canPreviousPage}
          aria-label="Página anterior"
        >
          <Icons typeIcon="arrow-left" iconSize={16} fill="#007185" />
        </button>

        <span className="table-pagination__page">
          Página <strong>{pageIndex + 1}</strong> de <strong>{pageCount || 1}</strong>
        </span>

        <button
          type="button"
          className="table-pagination__btn"
          onClick={nextPage}
          disabled={!canNextPage}
          aria-label="Próxima página"
        >
          <Icons typeIcon="arrow-right" iconSize={16} fill="#007185" />
        </button>
        <button
          type="button"
          className="table-pagination__btn"
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
          aria-label="Última página"
        >
          <Icons typeIcon="arrow-right" iconSize={16} fill="#007185" />
          <Icons typeIcon="arrow-right" iconSize={16} fill="#007185" />
        </button>
      </div>

      <Form.Select
        className="table-pagination__size"
        value={pageSize}
        onChange={(e) => setPageSize(Number(e.target.value))}
        aria-label="Itens por página"
      >
        {pageSizeOptions.map((size) => (
          <option key={size} value={size}>
            {size} por página
          </option>
        ))}
      </Form.Select>
    </div>
  );
};

TablePagination.propTypes = {
  pageIndex: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalRows: PropTypes.number.isRequired,
  canPreviousPage: PropTypes.bool.isRequired,
  canNextPage: PropTypes.bool.isRequired,
  gotoPage: PropTypes.func.isRequired,
  previousPage: PropTypes.func.isRequired,
  nextPage: PropTypes.func.isRequired,
  setPageSize: PropTypes.func.isRequired,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default TablePagination;
