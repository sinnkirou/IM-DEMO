export const chatMessageRule = [{
    name: 'dataContent'
  }, {
    name: 'fp'
  }, {
    name: 'from'
  }, {
    name: 'retryCount'
  }, {
    name: 'sendTs',
    format: val => val* 1000
  }, {
    name: 'to'
  }];
