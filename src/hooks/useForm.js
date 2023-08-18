import { useFormik } from 'formik';

const useForm = ({ initialValues, validationSchema, options }) => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: options.onSubmit,
    ...options,
  });

  return {
    ...formik,
  };
};

export default useForm;
