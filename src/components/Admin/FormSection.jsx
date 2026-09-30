import PropTypes from 'prop-types';
import './FormSection.scss';

const FormSection = ({ title, description, children }) => (
  <section className="admin-form-section">
    {title && <h5 className="admin-form-section__title">{title}</h5>}
    {description && <p className="admin-form-section__desc">{description}</p>}
    {children}
  </section>
);

FormSection.propTypes = {
  title: PropTypes.string,
  description: PropTypes.node,
  children: PropTypes.node,
};

export default FormSection;
