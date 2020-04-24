import head1 from '@/assets/head/头像1.png';
import head2 from '@/assets/head/头像2.png';
import ChatWrap from '@/components/ChatWrap';
import { IChatProps, IMessage, IUser } from '@/components/ChatWrap/index.d';
import { IAppState } from '@/models/app';
import { IMState } from '@/models/im';
import { Toast } from 'antd-mobile';
import { connect } from 'dva';
import React, { PureComponent } from 'react';

interface IState {
  currentUser: IUser;
  targetUser: IUser;
}

interface IProps extends IConnectProps {
  location: {
    query: {
      targetId: string;
    };
  };
  app: IAppState;
  im: IMState;
}

@connect(({ app, im }) => ({
  app,
  im,
}))
class Index extends PureComponent<IProps> {
  public state: IState = {
    currentUser: {},
    targetUser: {},
  };

  public componentDidMount() {
    const {
      location: {
        query: { targetId },
      },
      app: { user, contacts },
    } = this.props;
    const targetUser = contacts.find(i => String(i.id) === String(targetId)) || {};
    this.setState({
      targetUser,
      currentUser: user,
    });
  }

  public fileDownload = (key: string) =>
    this.props.dispatch({
      type: 'im/fileDownload',
      payload: {
        key,
      },
    });

  public msgUpdate = (key: string, dataContent: string) =>
    this.props.dispatch({
      type: 'im/MESSAGE_UPDATE',
      payload: {
        fp: key,
        dataContent,
      },
    });

  public insertMsg = (message: IMessage) => {
    return this.props.dispatch({
      type: 'im/INSERT_MESSAGE',
      payload: message,
    });
  };

  public sendMsg = (message: IMessage) =>
    this.props
      .dispatch({
        type: 'im/send',
        payload: {
          message,
        },
      })
      .catch(Toast.fail);

  public syncMsgs = (page: number = 1) => {
    const {
      location: {
        query: { targetId },
      },
      app: { user },
      dispatch,
    } = this.props;
    dispatch({
      type: 'im/syncMessages',
      payload: {
        fromUserId: user.id,
        toUserId: targetId,
        page,
      },
    });
    // .catch(Toast.fail);
  };

  public canPullRefresh = () => {
    const {
      im: { messages },
    } = this.props;
    const {
      im: { total },
    } = this.props;
    if (messages.length >= total) {
      return false;
    }
    return true;
  };

  public fileUpload = (formData: FormData) =>
    this.props.dispatch({
      type: 'im/fileUpload',
      payload: formData,
    });

  public render() {
    const { targetUser, currentUser } = this.state;
    const {
      im: { messages },
    } = this.props;
    const props: IChatProps = {
      targetUser: {
        ...targetUser,
        head: head1,
      },
      currentUser: {
        ...currentUser,
        head: head2,
      },
      messages,
      canPullRefresh: this.canPullRefresh(),
      fileDownload: this.fileDownload,
      fileUpload: this.fileUpload,
      msgUpdate: this.msgUpdate,
      insertMsg: this.insertMsg,
      syncMsgs: this.syncMsgs,
      sendMsg: this.sendMsg,
    };

    return <ChatWrap {...props} />;
  }
}

export default Index;
