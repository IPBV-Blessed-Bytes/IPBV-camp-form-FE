import 'bootstrap/dist/css/bootstrap.min.css';
import PropTypes from 'prop-types';
import Icons from '@/components/GlobalComponents/Icons';

const TableColumnFilter = ({ column }) => {
  const filterValue = column?.filterValue || '';
  const setFilter = column?.setFilter || (() => {});

  return (
    <div className="d-flex position-relative">
      <input
        className={`filter-input ${filterValue && 'actived-filter'}`}
        value={filterValue}
        onChange={(e) => setFilter(e.target.value || undefined)}
        placeholder="Pesquise ..."
      />
      {filterValue && <Icons className="filter-icon" typeIcon="filter" iconSize={24} fill="#4267a7" />}
    </div>
  );
};

TableColumnFilter.propTypes = {
  column: PropTypes.shape({
    filterValue: PropTypes.bool,
    setFilter: PropTypes.func,
  }),
};

export default TableColumnFilter;
