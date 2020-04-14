export default {
  isAndroid: () => {
    const u = navigator.userAgent;
    if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {
      return true;
    }
    return false;
  },
  isIOS: () => {
    const u = navigator.userAgent;
    if (u.indexOf('iPhone') > -1) {
      return true;
    }
    return false;
  },
};
