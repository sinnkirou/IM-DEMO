import { userLogin, userRegister, } from '@/servers/user';
import storage from '@/utils/storage';

const defState = {
  user: {},
};
export default {
  namespace: 'app',
  state: defState,
  effects: {
    *signIn({ payload }, { call, put }) {
      const { message, success, data } = yield call(userLogin, payload);
      if (!success) {
        throw message;
      } else  {
        storage.cookie.set('token', data.token);
        storage.local.set('user', data);
        yield put({ type: 'app/STATE', payload: { user: data } });
        console.log(data);
        return data;
      }
    },
    *signout(_, { put }) {
      storage.cookie.remove('token');
      storage.local.clear();
      yield put({ type: 'RESET' });
    },
    *register({ payload }, { call, }) {
      const { message, success, } = yield call(userRegister, payload);
      if (!success) {
        throw message;
      }
    },
  },
  reducers: {
    STATE(state, { payload }) {
      return { ...state, ...payload };
    },
  },
  subscriptions: {
    init({ dispatch, history }) {
      dispatch({ type: 'STATE', payload: { user: storage.local.get('user') } });
      // history.listen(({ pathname }) => {
      //   if (!['/signin'].includes(pathname)) {
      //     const user = storage.local.get('user');
      //     if (!storage.cookie.get('token') || !user || !user.token) {
      //       history.push('/signin');
      //     }
      //   }
      // });
    },
  },
};