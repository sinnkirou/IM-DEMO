import { getUserInfo, userLogin, userRegister } from '@/servers/user';
import storage from '@/utils/storage';
import { Toast } from 'antd-mobile';

export interface IAppState {
  user?: IUser;
  contacts: IUser[];
}

export interface IUser {
  nickname: string;
  id,
  spell?: string;
  email?: string;
  token?: string;
}

const defState: IAppState = {
  user: {},
  contacts: [],
};
export default {
  namespace: 'app',
  state: defState,
  effects: {
    *signIn({ payload }, { call, put }) {
      const { message, success, data } = yield call(userLogin, payload);
      if (!success) {
        throw message;
      } else {
        storage.cookie.set('token', data.token);
        storage.local.set('user', data);
        yield put({ type: 'STATE', payload: { user: data } });

        return data;
      }
    },
    *signout(_, { put }) {
      storage.cookie.remove('token');
      storage.local.clear();
      yield put({ type: 'RESET' });
      yield put({
        type: 'im/signout',
      });
    },
    *register({ payload }, { call }) {
      const { message, success } = yield call(userRegister, payload);
      if (!success) {
        throw message;
      }
    },
    *getUserInfo({ payload }, { call, put }) {
      const { message, success, data } = yield call(getUserInfo, payload);
      if (!success) {
        throw message;
      } else {
        yield put({
          type: 'STATE',
          payload: {
            contacts: data,
          },
        });
        return data;
      }
    },
  },
  reducers: {
    STATE(state, { payload }) {
      return { ...state, ...payload };
    },
    RESET() {
      return defState;
    }
  },
  subscriptions: {
    init({ dispatch, history }) {
      dispatch({ type: 'STATE', payload: { user: storage.local.get('user') } });
      history.listen(({ pathname }) => {
        if (!['/account'].includes(pathname)) {
          const user = storage.local.get('user');
          if (!storage.cookie.get('token') || !user || !user.token) {
            history.push('/account');
          }
        }
      });

      if (storage.cookie.get('token')) {
        dispatch({
          type: 'getUserInfo',
        })
          .catch(Toast.fail);
      }
    },
  },
};
