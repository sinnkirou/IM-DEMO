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

export interface IUser {
  nickname: string;
  id: string;
  spell?: string;
  email?: string;
  token?: string;
  head?: string;
}

export interface IState {
  pullRefreshing: boolean;
  page: number;
  total: number;
  lastTimeStamps?: object;
  userImageSrc?: string;
  toggleSwipe?: boolean;
  curImageId?: string;
  recording?: boolean;
  audioDurations?: object;
  playingItem?: string;
  toggleTarget?: 'emoji' | 'audio' | 'multiple' | 'input';
  messages: IMessage[];
}

export interface IChatProps {
  currentUser: IUser;
  targetUser: IUser;
  messages: IMessage[];
  canPullRefresh: boolean;
  fileDownload?: (key: string) => Promise<any>;
  fileUpload?: (formData: FormData) => Promise<any>;
  msgUpdate?: (key: string, dataContent: string) => Promise<any>;
  insertMsg: (msg: IMessage) => Promise<any>;
  sendMsg: (msg: IMessageBase) => Promise<any>;
  syncMsgs: (page?: number) => any;
  toolPanelStyle?: {};
  scrollListStyle?: {};
}
