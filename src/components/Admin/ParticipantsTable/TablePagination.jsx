import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';
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
  const { t } = useTranslation();
  if (totalRows === 0) return null;

  const firstRow = pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="table-pagination">
      <span className="table-pagination__info">
        {t('admin.participantsTable.paginationInfo', { first: firstRow, last: lastRow, total: totalRows })}
      </span>

      <div className="table-pagination__controls">
        <button
          type="button"
          className="table-pagination__btn"
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
          aria-label={t('admin.participantsTable.ariaFirst')}
        >
          <Icons typeIcon="arrow-left" iconSize={16} fill="#007185" />
          <Icons typeIcon="arrow-left" iconSize={16} fill="#007185" />
        </button>
        <button
          type="button"
          className="table-pagination__btn"
          onClick={previousPage}
          disabled={!canPreviousPage}
          aria-label={t('admin.participantsTable.ariaPrevious')}
        >
          <Icons typeIcon="arrow-left" iconSize={16} fill="#007185" />
        </button>

        <span className="table-pagination__page">
          <Trans
            i18nKey="admin.participantsTable.paginationPage"
            values={{ current: pageIndex + 1, total: pageCount || 1 }}
            components={[<strong key="0" />, <strong key="1" />]}
          />
        </span>

        <button
          type="button"
          className="table-pagination__btn"
          onClick={nextPage}
          disabled={!canNextPage}
          aria-label={t('admin.participantsTable.ariaNext')}
        >
          <Icons typeIcon="arrow-right" iconSize={16} fill="#007185" />
        </button>
        <button
          type="button"
          className="table-pagination__btn"
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
          aria-label={t('admin.participantsTable.ariaLast')}
        >
          <Icons typeIcon="arrow-right" iconSize={16} fill="#007185" />
          <Icons typeIcon="arrow-right" iconSize={16} fill="#007185" />
        </button>
      </div>

      <Form.Select
        className="table-pagination__size"
        value={pageSize}
        onChange={(e) => setPageSize(Number(e.target.value))}
        aria-label={t('admin.participantsTable.ariaItemsPerPage')}
      >
        {pageSizeOptions.map((size) => (
          <option key={size} value={size}>
            {t('admin.participantsTable.pageSizeOption', { size })}
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
