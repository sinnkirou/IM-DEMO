import { Toast } from 'antd-mobile';
import router from 'umi/router';
import { syncMessages } from '@/servers/message';
import { WS_URL } from '@/utils/config';
import storage from '@/utils/storage';
import concat from 'lodash/concat';
import Manager from '../../shurui-im-sdk/src/index';
import format from '@/utils/format';
import { chatMessageRule } from '@/utils/formatRules';

export interface IMessageBase {
	from: string;
	to: string;
	dataContent: string;
}

export interface IMessage extends IMessageBase {
	fp: string;
	typeu?: number;
	sendTs: any;
	sentSuccess?: boolean;
}

export interface IMState {
	loginStatus: boolean;
	linkStatus: boolean;
	messages: IMessage[];
	hasLoginedOnce?: boolean;
}

const defState: IMState = {
	loginStatus: undefined,
	linkStatus: undefined,
	messages: []
};
export default {
	namespace: 'im',
	state: defState,
	effects: {
		*init({ payload }, { call, put, select }) {
			const {
				onLoginOrReloginSuccessCB,
				onLoginOrReloginFailCB,
				onLinkCloseMessageCB,
				onTransBufferCB,
				onTransErrorCB,
				handleMessageLost,
				messagesBeReceivedCB
			} = payload;
			const options = {
				wsUrl: WS_URL,
				chatBaseCB: {
					onLoginOrReloginSuccessCB,
					onLoginOrReloginFailCB,
					onLinkCloseMessageCB
				},
				chatTransDataCB: {
					onTransBufferCB,
					onTransErrorCB
				},
				messageQoSCB: {
					handleMessageLost,
					messagesBeReceivedCB
				}
			};

			Manager.getInstance(options);
		},
		*signin({ payload }, { call, put, select }) {
			const { callBack, autoLogin } = payload;
			const hasLoginedOnce = storage.local.get('hasLoginedOnce');
			console.debug('autoLogin', autoLogin, 'hasLoginedOnce', hasLoginedOnce);
			if (!autoLogin || (autoLogin && hasLoginedOnce)) {
				const { id, token } = storage.local.get('user');
				console.debug('id', id, 'token', token);
				if (id && token) {
					Manager.getInstance().login(id, token, 'test', null, (code) => {
						if (callBack) callBack(code);
					});
				}
			}
		},
		*signout({}, { put }) {
			Manager.getInstance().logout();
			yield put({
				type: 'STATE',
				payload: {
					...defState
				}
			});
		},
		*release() {
			Manager.getInstance().release();
		},
		*send({ payload }, { call, put, select }) {
			const msg: IMessage = payload.message;
			Manager.getInstance().send(msg.dataContent, String(msg.from), String(msg.to), true, msg.fp, null, (code) => {
				if (payload.handleSendResult) {
					payload.handleSendResult(code);
				}
			});
		},
		*syncMessages({ payload }, { call, put }) {
			const { pageSize } = payload;
			const { message, success, data } = yield call(syncMessages, {
				...payload,
				pageSize: pageSize || 10
			});
			if (!success) {
				throw message;
			} else {
				const { records } = data;
				yield put({
					type: 'MESSAGE',
					payload: records
				});
			}
		}
	},
	reducers: {
		STATE(state, { payload }) {
			return { ...state, ...payload };
		},
		MESSAGE(state, { payload }) {
			const { messages } = state;
			let newMessages: IMessage[]  = concat(messages, payload);
			newMessages.sort((x,y)=> x.sendTs < y.sendTs? -1: 1);
			return {
				...state,
				messages: newMessages
			};
		},
		LOGIN_ONCE(state, { }) {
			storage.local.set('hasLoginedOnce', true);
			return {
				...state,
				hasLoginedOnce: true
			}
		}
	},
	subscriptions: {
		initIM({ dispatch, history }) {
			const onLoginOrReloginSuccessCB = () => {
				dispatch({
					type: 'STATE',
					payload: {
						loginStatus: true
					}
				});
			};
			const onLoginOrReloginFailCB = () => {
				dispatch({
					type: 'STATE',
					payload: {
						loginStatus: false
					}
				});
			};
			const onLinkCloseMessageCB = () => {
				dispatch({
					type: 'STATE',
					payload: {
						linkStatus: false
					}
				});
			};
			const onTransBufferCB = (msg) => {
				dispatch({
					type: 'MESSAGE',
					payload: format(msg, chatMessageRule)
				});
			};
			const onTransErrorCB = (params) => {
				console.warn(params);
			};
			const handleMessageLost = (lostMsgs: object[]) => {
				console.debug(lostMsgs);
			};
			const messagesBeReceivedCB = (fp: string) => {
				console.debug('message received: ', fp);
			};
			dispatch({
				type: 'init',
				payload: {
					onLoginOrReloginSuccessCB,
					onLoginOrReloginFailCB,
					onLinkCloseMessageCB,
					onTransBufferCB,
					onTransErrorCB,
					handleMessageLost,
					messagesBeReceivedCB
				}
			});

			const hasLoginedOnce = storage.local.get('hasLoginedOnce');
			if(hasLoginedOnce) {
				setTimeout(() => {
					dispatch({
						type: 'signin',
						payload: {
							autoLogin: true,
							callBack: (code)=>{
								if(code.toString() === '0'){
								  dispatch({
									type: 'LOGIN_ONCE',
								  });
								}else {
								  Toast.hide();
								  Toast.fail('login failed, please try again.');
								  router.push('/account');
								}
							  }
						}
					});
				}, 500);
			}
		}
	}
};
