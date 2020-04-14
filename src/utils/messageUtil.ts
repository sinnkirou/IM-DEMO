export const getFieldErrors = (getFieldError, fieldName) => {
  let errors = getFieldError(fieldName);
  errors = errors ? errors.join(',') : null;
  return errors;
};
