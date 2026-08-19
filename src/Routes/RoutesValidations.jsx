import PropTypes from 'prop-types';

import { FormStateProvider } from '@/contexts/FormStateContext';
import FormRoutes from '.';

const RoutesValidations = ({ formStageCloseForm }) => (
  <FormStateProvider formStageCloseForm={formStageCloseForm}>
    <FormRoutes />
  </FormStateProvider>
);

RoutesValidations.propTypes = {
  formStageCloseForm: PropTypes.string,
};

export default RoutesValidations;
