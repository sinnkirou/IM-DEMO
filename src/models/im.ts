import { syncMessages } from '@/servers/message';
import { WS_URL } from '@/utils/config';
import storage from '@/utils/storage';
import concat from 'lodash/concat';
import Manager from '../../shurui-im-sdk/src/index';

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
}

// const _messages: IMessage[] = [
//     {
//       from: '100',
//       dataContent: 'Welcome, what can I do for you?',
//       fp: uuid(),
//       sendTs: '2019-09-04 11:55:00',
//       to: '110',
//     },
//     {
//       from: '100',
//       dataContent: "I'm the recipient! (The person you're talking to)",
//       fp: uuid(),
//       sendTs: '2019-09-04 11:56:00',
//       to: '110',
//     },
//     { to: '110', from: '100', dataContent: "I'm you -- the blue bubble!", fp: uuid(), sendTs: '2019-09-04 12:00:00' },
//     { to: '110', from: '110', dataContent: "dasdasd", fp: uuid(), sendTs: '2019-09-04 12:05:00' },
//     { to: '100', from: '110', dataContent: "I'm you -- the blue bubble!", fp: uuid(), sendTs: '2019-09-04 12:06:00' },
//   ];

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
			const { id, token } = storage.local.get('user');
			Manager.getInstance().login(id, token, 'test');
		},
		*signout() {
			Manager.getInstance().logout();
		},
		*release() {
			Manager.getInstance().release();
		},
		*send({ payload }, { call, put, select }) {
			const msg: IMessage = payload.message;
			Manager.getInstance().send(msg.dataContent, msg.from, msg.to, true, msg.fp, null, (code) => {
				if (payload.handleSendResult) {
					payload.handleSendResult(code);
				}
			});
		},
		*syncMessages({ payload }, { call, put }) {
			const { targetId, page, pageSize } = payload;
			const { message, success, data } = yield call(syncMessages, {
				groupId: targetId,
				page,
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
			return {
				...state,
				messages: concat(messages, payload)
			};
		}
	},
	subscriptions: {
		init({ dispatch, history }) {
			dispatch({ type: 'app/STATE', payload: { user: storage.local.get('user') } });

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
					payload: msg
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
			setTimeout(() => {
				dispatch({
					type: 'signin'
				});
			}, 500);
		}
	}
};
