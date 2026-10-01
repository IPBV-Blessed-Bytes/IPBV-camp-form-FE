import 'bootstrap/dist/css/bootstrap.min.css';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Icons from '@/components/Global/Icons';
import '../../Style/ColumnFilter.scss';

const ColumnFilter = ({ column }) => {
  const { t } = useTranslation();
  const filterValue = column?.filterValue || '';
  const setFilter = column?.setFilter || (() => {});

  const handleFilterChange = (e) => {
    const value = e.target.value || undefined;
    setFilter(value);
  };

  return (
    <div className="d-flex position-relative">
      <input
        className={`filter-input ${filterValue && 'actived-filter'}`}
        value={filterValue}
        onChange={(e) => {
          handleFilterChange(e);
        }}
        placeholder={t('admin.participantsTable.filterSearchPlaceholder')}
      />
      {filterValue && <Icons className="filter-icon" typeIcon="filter" iconSize={24} fill="#4267a7" />}
    </div>
  );
};

ColumnFilter.propTypes = {
  column: PropTypes.shape({
    filterValue: PropTypes.string,
    setFilter: PropTypes.func,
  }),
};

export default ColumnFilter;
