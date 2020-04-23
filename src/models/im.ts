import { fileDownload, fileUpload } from '@/servers/file';
import { syncMessages } from '@/servers/message';
import { WS_URL } from '@/utils/config';
import format from '@/utils/format';
import { chatMessageRule } from '@/utils/formatRules';
import storage from '@/utils/storage';
import { Toast } from 'antd-mobile';
import cloneDeep from 'lodash/cloneDeep';
import concat from 'lodash/concat';
import uniqBy from 'lodash/uniqBy';
import router from 'umi/router';
import Manager, { WSOptions } from 'srt-im-sdk';
// import Manager, { WSOptions } from '../../../shurui-im-sdk/src/index';

export interface IMessageBase {
	fp: string;
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
	total: number;
}

const defState: IMState = {
	loginStatus: undefined,
	linkStatus: undefined,
	messages: [],
	total: 0,
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
			const options: WSOptions = {
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
			if (!autoLogin || (autoLogin && hasLoginedOnce)) {
				const { id, token } = storage.local.get('user');
				if (id && token) {
					Manager.getInstance().login(id, token, 'test', null, (code) => {
						if (callBack) { callBack(code); }
					});
				}
			}
		},
		*signout({}, { put }) {
			Manager.getInstance().logout();
			yield put({
				type: 'RESET',
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
			let records: IMessage[] = [];
			if (!success) {
				throw message;
			} else {
				records = data.records;
				records = records.map((i)=> ({
						...i,
						sentSuccess: true,
				}));
				yield put({
					type: 'INSERT_MESSAGE',
					payload: records
				});
				yield put({
					type: 'STATE',
					payload: {
						total: data.total
					}
				})
			}
		},
		*fileUpload({ payload }, { call, put}) {
			const { message, success, data } =  yield call(fileUpload, payload);
			if(!success) {
				throw message;
			}else{
				return data;
			}
		},
		*fileDownload({ payload }, { call, put }) {
			return yield call(fileDownload, payload);
		}
	},
	reducers: {
		STATE(state, { payload }) {
			return { ...state, ...payload };
		},
		RESET() {
			return defState;
		},
		INSERT_MESSAGE(state: IMState, { payload }) {
			const { messages } = state;
			let newMessages: IMessage[]  = concat(messages, payload);
			newMessages = newMessages.map((item)=> {
				const fpArray = item.fp.split('|');
				return {
					...item,
					fp: fpArray[fpArray.length-1]
				}
			});
			newMessages = newMessages.sort((x,y)=> x.sendTs < y.sendTs? -1: 1);
			newMessages = uniqBy(newMessages, 'fp');
			const insertedNumber = newMessages.length - messages.length;
			return {
				...state,
				messages: newMessages,
				total: state.total + insertedNumber
			};
		},
		LOGIN_ONCE(state, { }) {
			storage.local.set('hasLoginedOnce', true);
			return {
				...state,
				hasLoginedOnce: true
			}
		},
		MESSAGE_UPDATE(state: IMState, { payload }) {
			const messages: IMessage[] = state.messages;
			const targetMessageIndex: number = messages.findIndex((i: IMessage) => String(i.fp) === String(payload.fp));
			if (targetMessageIndex > -1) {
				const targetMessage:IMessage =  messages.find((i: IMessage) => String(i.fp) === String(payload.fp));
				const newMessage = {
					...targetMessage,
					...payload
				};
				messages.splice(targetMessageIndex, 1, newMessage);
			}
			return {
				...state,
				messages: cloneDeep(messages)
			};
		}
	},
	subscriptions: {
		initIM({ dispatch, history }) {
			const onLoginOrReloginSuccessCB = () => {
				dispatch({
					type: 'STATE',
					payload: {
						loginStatus: true,
						linkStatus: true
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
					type: 'INSERT_MESSAGE',
					payload: {
						...format(msg, chatMessageRule),
						sentSuccess: true,
					}
				});
			};
			const onTransErrorCB = (params) => {
				console.warn(params);
			};
			const handleMessageLost = (lostMsgs: IMessage[]) => {
				lostMsgs.forEach(msg=> {
					dispatch({
						type: 'MESSAGE_UPDATE',
						payload: {
							fp: msg.fp,
							sentSuccess: false
						}
					})
				})
			};
			const messagesBeReceivedCB = (fp: string) => {
				dispatch({
					type: 'MESSAGE_UPDATE',
					payload: {
						fp,
						sentSuccess: true
					}
				})
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
