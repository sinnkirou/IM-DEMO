/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
export const dva = {
  config: {
    onError(e) {
      e.preventDefault();
      console.error(e.message);
    },
  },
};
