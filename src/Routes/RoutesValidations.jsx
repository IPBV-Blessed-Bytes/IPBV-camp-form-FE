import PropTypes from 'prop-types';

import { FormStateProvider } from '@/contexts/FormStateContext';
import FormRoutes from '.';

const RoutesValidations = ({ formContextCloseForm }) => (
  <FormStateProvider formContextCloseForm={formContextCloseForm}>
    <FormRoutes />
  </FormStateProvider>
);

RoutesValidations.propTypes = {
  formContextCloseForm: PropTypes.string,
};

export default RoutesValidations;
