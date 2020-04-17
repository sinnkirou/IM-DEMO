import AudioPlaying from '@/components/AudioPlaying';
import BizIcon from '@/components/BizIcon';
import Swiper from '@/components/Swiper';
import { IAppState, IUser } from '@/models/app';
import { IMessage, IMState, IMessageBase } from '@/models/im';
import {
  ActivityIndicator,
  Flex,
  Grid,
  Icon,
  InputItem,
  ListView,
  NavBar,
  PullToRefresh,
  Toast,
  WhiteSpace,
} from 'antd-mobile';
import { connect } from 'dva';
import Hammer from 'hammerjs';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment';
import { createForm } from 'rc-form';
import React, { PureComponent } from 'react';
import router from 'umi/router';
import { v1 as uuid } from 'uuid';
// import Manager from 'srt-im-sdk';
import styles from './index.less';

const emojis = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '🤣',
  '😂',
  '🙂',
  '🙃',
  '😉',
  '😊',
  '😇',
  '😍',
  '🤩',
  '😘',
  '😗',
  '😚',
  '😙',
  '😋',
  '😛',
  '😜',
  '🤪',
  '😝',
  '🤑',
  '🤗',
  '🤭',
  '🤫',
  '🤔',
  '🤐',
  '🤨',
  '😐',
  '😑',
  '😶',
  '😏',
  '😒',
  '🙄',
  '😬',
  '🤥',
  '😌',
  '😔',
  '😪',
  '🤤',
  '😴',
  '😷',
  '🤒',
  '🤕',
  '🤢',
  '🤮',
  '🤧',
];
const emojiData = emojis.map(emoji => ({ text: emoji }));

enum DataType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
}

interface IState {
  refreshing: boolean;
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
  emojiHeight?: number;
  currentUser: IUser;
  targetUser: IUser;
  messages: IMessage[];
}

interface IProps extends IConnectFormProps {
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
  public dataSource = null;
  public audios = null;
  public imageIds = null;
  public scrollView = null;
  public inputMessage = null;

  public state: IState = {
    refreshing: false,
    page: 0,
    total: 100,
    lastTimeStamps: {},
    userImageSrc: null,
    toggleTarget: 'input',
    toggleSwipe: false,
    curImageId: null,
    recording: false,
    audioDurations: {},
    emojiHeight: 0,
    currentUser: {},
    targetUser: {},
    messages: [],
  };

  constructor(props) {
    super(props);
    this.dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.audios = {};
    this.imageIds = [];
  }

  static getDerivedStateFromProps(props: IProps, state: IState) {
    const {
      location: {
        query: { targetId },
      },
      im: { messages },
      app: { user },
    } = props;
    const filteredMessages = messages.filter(
      (i: IMessage) => String(i.from) === String(user.id) || String(i.from) === String(targetId)
    );
    return {
      messages: filteredMessages,
    };
  }

  public componentDidMount() {
    this.scrollIntoLatest();
    this.handleGesture();
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
        page: 1
      },
    }).catch(Toast.fail);

    const { contacts } = this.props.app;
    const targetUser = contacts.find(i => String(i.id) === String(targetId)) || {};
    this.setState({
      targetUser,
      currentUser: {
        username: get(user, 'nickname'),
        id: get(user, 'id'),
      },
    });
  }

  public scrollIntoLatest = () => {
    setTimeout(() => {
      if (this.scrollView) {
        this.scrollView.scrollTo(0, 12000);
      }
    }, 200);
  };

  public handleGesture = () => {
    const press = new Hammer(document.getElementsByClassName('am-input-item')[0]);
    press.on(
      'press',
      () => {
        const { toggleTarget } = this.state;
        if (toggleTarget === 'audio') {
          // permissionManager.checkPermission({
          //   permissionList: [PERMISSIONS.RECORD_AUDIO],
          //   permissionReady: () => {
          //     this.mediaSrc = `mdqSmartCare/audios/myRecording${moment().format(
          //       'YYYYMMDDHHmmss'
          //     )}.wav`;
          //     console.debug(`recording${this.mediaSrc}`);
          //     this.audios[this.mediaSrc] = audioUtil.initRecord(this.mediaSrc);
          //     audioUtil.startRecord(this.audios[this.mediaSrc]);
          //     this.setState({ recording: true });
          //   },
          // });
        }
      },
      15,
      2000
    );
    const pressup = new Hammer(document.getElementsByClassName('am-input-item')[0]);
    pressup.on(
      'pressup',
      () => {
        // const { toggleAudio } = this.state;
        // if (toggleAudio) {
        //   console.debug('recorded');
        //   audioUtil.stopRecord(this.audios[this.mediaSrc]);
        //   this.setState({ recording: false });
        //   setTimeout(() => {
        //     this.appendMessage({ dataContent: this.mediaSrc, type: 'audio' });
        //   }, 1000);
        // }
      },
      15
    );
  };

  // initClient = () => {
  //   this.options = {
  //     wsUrl: 'ws://192.168.198.202:7901/ws',
  //     chatBaseCB: {
  //       onLoginOrReloginSuccessCB: () => {
  //         console.log('登陆成功');
  //       },
  //       onLoginOrReloginFailCB: () => {
  //         console.log('登陆失败');
  //       },
  //       onLinkCloseMessageCB: () => {
  //         console.log('连接失败');
  //       },
  //     },
  //     chatTransDataCB: {
  //       onTransBufferCB: params => {
  //         const { dataContent } = params;
  //         console.log(params);
  //         this.appendMessage({ dataContent: dataContent, isOwn: false });
  //       },
  //       onTransErrorCB: params => {
  //         console.log(params);
  //       },
  //     },
  //     messageQoSCB: {
  //       handleMessageLost: params => {
  //         console.log(params);
  //       },
  //       messagesBeReceivedCB: params => {
  //         console.log(params);
  //       },
  //     },
  //   };
  //   setTimeout(() => {
  //     // Manager.getInstance().login('1', 'token', 'test');
  //   }, 1000);
  // };

  public renderTitle = () => {
    const { targetUser } = this.state;
    return (
      <NavBar
        mode="dark"
        icon={<Icon type="left" className={styles.titleIcon} />}
        onLeftClick={router.goBack}
        key="title"
      >
        {targetUser.nickname}
      </NavBar>
    );
  };

  public appendMessage = (message: IMessageBase) => {
    const { dispatch } = this.props;
    const newMessage = {
      ...message,
      fp: uuid(),
      sendTs: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    dispatch({
      type: 'im/MESSAGE',
      payload: {
        ...newMessage,
        sentSuccess: true,
      },
    });
    this.setState({
      toggleTarget: 'input',
    });
    setTimeout(() => this.scrollIntoLatest(), 200);
  };

  public onSendMessage = () => {
    const { form, dispatch, location: {
      query: { targetId },
    }, } = this.props;
    const { currentUser } = this.state;
    // deviceHelper.setSoftKeyboardVisible(false);
    form.validateFields((error, values) => {
      if (!error) {
        const { inputMessage } = values;
        // this.appendMessage({ dataContent: inputMessage, from: currentUser.id, to: targetUser.id });
        const message: IMessageBase = {
          dataContent: inputMessage,
          from: currentUser.id,
          to: targetId,
        };
        dispatch({
          type: 'im/send',
          payload: {
            message,
            handleSendResult: code => {
              console.debug(code);
              if (code === 0) {
                this.appendMessage(message);
              }
            },
          },
        }).catch(Toast.fail);

        this.inputMessage.clearInput();
      }
    });
  };

  public onRefresh = () => {
    const { refreshing, page, total, messages } = this.state;
    if (messages.length >= total) {
      return;
    }
    const newMessages: IMessage[] = [
      {
        dataContent: "I'm new refreshed",
        from: '2',
        to: '1',
        fp: uuid(),
        sendTs: moment()
          .subtract(Math.round(Math.random() * 19), 'months')
          .format('YYYY-MM-DD HH:mm:ss'),
      },
    ]
      .concat(messages)
      .sort((x, y) => (moment(y.sendTs).isAfter(moment(x.sendTs)) ? -1 : 1));
    // this.setState({
    //   messages: newMessages,
    //   refreshing: false,
    //   page: refreshing ? page + 1 : 0,
    // });
  };

  public shouldShowTimeStamp = (messgae: IMessage) => {
    const { sendTs, fp } = messgae;
    if (!sendTs) {
      return false;
    }
    const key = moment(sendTs).format('YYYY-MM-DD HH:mm');
    const { lastTimeStamps } = this.state;
    const timestamp = lastTimeStamps[key];
    let result = true;
    if (!timestamp) {
      Object.keys(lastTimeStamps).forEach(item => {
        if (moment(sendTs).isBetween(moment(item).subtract(5, 'm'), moment(item).add(5, 'm'))) {
          result = false;
        }
      });
      if (result) {
        lastTimeStamps[key] = fp;
      }
    } else {
      result = false;
      if (timestamp && timestamp === fp) {
        result = true;
      }
    }
    return result;
  };

  public formatTimeStamp = time => {
    if (moment(time).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
      return moment(time).format('HH:mm');
    }
    if (
      moment(time).format('YYYY-MM-DD') ===
      moment()
        .subtract(1, 'd')
        .format('YYYY-MM-DD')
    ) {
      return `Yesterday ${moment(time).format('HH:mm')}`;
    }
    if (moment(time).format('w') === moment().format('w')) {
      return moment(time).format('ddd HH:mm');
    }
    if (moment(time).format('YYYY') !== moment().format('YYYY')) {
      return `${moment(time).format('YYYY-MM-DD HH:mm')}`;
    }
    return moment(time).format('MMM Do HH:mm');
  };

  // playAudio = item => {
  //   const { id, dataContent: src } = item;
  //   const { playingItem, audioDurations } = this.state;

  //   this.setState({ playingItem: !playingItem ? id : null }, () => {
  //     if (!this.audios[src]) {
  //       this.audios[src] = audioUtil.initRecord(src);
  //     }
  //     const { playingItem: _playingItem } = this.state;
  //     if (_playingItem) {
  //       audioUtil.play(this.audios[src]);
  //       const duration = audioDurations[src] + 1;
  //       this.autoStop = setTimeout(() => {
  //         console.debug('autoStopped');
  //         this.setState({ playingItem: null });
  //       }, duration * 1000);
  //     } else {
  //       audioUtil.stop(this.audios[src]);
  //       console.debug('stopped');
  //       clearTimeout(this.autoStop);
  //     }
  //   });
  // };

  // setDuration = src => {
  //   const { audioDurations } = this.state;
  //   if (audioDurations[src]) return;
  //   if (!this.audios[src]) {
  //     this.audios[src] = audioUtil.initRecord(src);
  //   }
  //   audioUtil.setVolume(this.audios[src], '0.0');
  //   audioUtil.play(this.audios[src]);
  //   let duration = audioUtil.getDuration(this.audios[src]);
  //   let counter = 0;
  //   const timerDur = setInterval(() => {
  //     counter += 100;
  //     if (counter > 2000) {
  //       clearInterval(timerDur);
  //     }
  //     duration = audioUtil.getDuration(this.audios[src]);
  //     console.debug(`${duration}sec`);
  //     if (duration > 0) {
  //       audioUtil.stop(this.audios[src]);
  //       audioUtil.setVolume(this.audios[src], '1.0');
  //       audioDurations[src] = duration;
  //       this.setState({ audioDurations: { ...audioDurations } });
  //       console.debug(`${duration}sec...`);
  //       clearInterval(timerDur);
  //     }
  //   }, 100);
  // };

  public getAudioWidth = src => {
    const { audioDurations } = this.state;
    return audioDurations[src] ? audioDurations[src] / 10 + 3 : 0;
  };

  public getDataType = (dataContent: string) => {
    switch (dataContent) {
      case '[image]':
        return DataType.IMAGE;
      case '[audio]':
        return DataType.AUDIO;
      default:
        return DataType.TEXT;
    }
  };

  public generateRow = (item: IMessage) => {
    if (isEmpty(item)) return null;
    const { userImageSrc, playingItem, audioDurations } = this.state;
    const { currentUser } = this.state;
    const isOwn = String(item.from) === String(currentUser.id);
    const dataType = this.getDataType(item.dataContent);
    // if (item.type === 'audio') {
    //   // this.setDuration(item.dataContent);
    // } else if (item.type === 'image') {
    //   this.imageIds.push(item.id);
    // }
    return (
      <div key={item.fp} id={item.fp} className={styles.mssageRow}>
        {this.shouldShowTimeStamp(item) && (
          <>
            <WhiteSpace />
            <Flex justify="center">
              <span className={styles.datetime}>{this.formatTimeStamp(item.sendTs)}</span>
            </Flex>
            <WhiteSpace />
          </>
        )}

        {/** messages **/}
        <Flex justify={isOwn ? 'end' : 'start'} align="start">
          {!isOwn && <BizIcon type="icon-test" className={styles.userIcon} />}

          <Flex direction="column" align={isOwn ? 'end' : 'start'}>
            <span className={styles.from}>{currentUser.nickname ? currentUser.nickname : ''}</span>
            {dataType === DataType.TEXT && (
              <span className={`messageItem ${isOwn ? styles.ownMessage : styles.otherMessage}`}>
                {item.dataContent}
              </span>
            )}
            {dataType === DataType.IMAGE && (
              <img
                className={`messageItem ${styles.messageImg}`}
                src={item.dataContent}
                alt="img"
                onClick={() => {
                  this.setState({
                    toggleSwipe: true,
                    curImageId: item.fp,
                  });
                }}
              />
            )}
            {dataType === DataType.AUDIO && (
              <span
                className={`messageItem ${isOwn ? styles.ownMessage : styles.otherMessage}`}
                onClick={() => {
                  // this.playAudio(item);
                }}
                style={{ width: `${this.getAudioWidth(item.dataContent)}rem` }}
                id={item.dataContent}
              >
                <Flex>
                  {`${audioDurations[item.dataContent]}''`}
                  {<AudioPlaying isPlaying={playingItem === item.fp} />}{' '}
                </Flex>
              </span>
            )}
          </Flex>

          {isOwn &&
            (userImageSrc ? (
              <img src={userImageSrc} alt="head" className={styles.roundIcon} />
            ) : (
                <BizIcon type="icon-test" className={styles.userIcon} />
              ))}
        </Flex>
        <WhiteSpace />
      </div>
    );
  };

  public renderChatBody = () => {
    const { refreshing, messages } = this.state;

    return (
      <ListView
        key="listView"
        dataSource={this.dataSource.cloneWithRows(messages)}
        renderRow={this.generateRow}
        className={styles.scrollList}
        pullToRefresh={<PullToRefresh refreshing={refreshing} onRefresh={this.onRefresh} />}
        initialListSize={20}
        ref={el => {
          this.scrollView = el;
        }}
      />
    );
  };

  public isDirty = () => {
    const { form } = this.props;
    const inputValue = form.getFieldValue('inputMessage');
    return !!inputValue;
  };

  // onCameraSuccess = imageURL => {
  //   logger.info(`onCameraSuccess:_____________________${imageURL}`);
  //   const userImageSrc = `data:image/jpeg;base64,${imageURL}`;
  //   this.appendMessage({ dataContent: userImageSrc, type: 'image' });
  // };

  // onCameraError = e => {
  //   logger.error(`onCameraError: ${JSON.stringify(e)}`, e);
  //   // Toast.fail('something goes wrong');
  // };

  // takePhoto = () => {
  //   const cameraOptions = {
  //     ...getDefaultCameraOptions(),
  //     quality: 100,
  //   };
  //   cameraUtil.takePhoto(this.onCameraSuccess, this.onCameraError, cameraOptions);
  // };

  // takeFromGallery = () => {
  //   const cameraOptions = {
  //     ...getDefaultPhotoOptions(),
  //     quality: 100,
  //   };
  //   cameraUtil.takeFromGallery(this.onCameraSuccess, this.onCameraError, cameraOptions);
  // };

  public toggleTarget = (target: 'emoji' | 'audio' | 'multiple' | 'input') => {
    const { toggleTarget } = this.state;
    this.scrollIntoLatest();
    this.setState({ toggleTarget: toggleTarget === target ? 'input' : target });
  };

  public onFocus = () => {
    this.scrollIntoLatest();
    this.setState({ toggleTarget: 'input' });
  };

  public renderChatInput = () => {
    const { form } = this.props;
    const { getFieldProps } = form;
    const { toggleTarget, emojiHeight } = this.state;

    return (
      <div className={styles.toolPanel} key="toolPanel">
        <div className={styles.inputPanel}>
          {toggleTarget !== 'audio' ? (
            <BizIcon
              type="audio"
              onClick={() => {
                this.toggleTarget('audio');
              }}
            />
          ) : (
              <BizIcon
                type="wenzishuru"
                onClick={() => {
                  this.toggleTarget('input');
                }}
              />
            )}
          <form
            action=""
            onSubmit={e => {
              e.preventDefault();
              this.onSendMessage();
              // deviceHelper.handleSoftSubmit(e, this.onSendMessage);
            }}
          >
            <InputItem
              {...getFieldProps('inputMessage', {
                rules: [{ required: true, message: 'Please input something before sending' }],
              })}
              placeholder={toggleTarget !== 'audio' ? 'Please input here...' : 'Hold to talk...'}
              disabled={toggleTarget === 'audio'}
              ref={el => {
                this.inputMessage = el;
              }}
              onFocus={this.onFocus}
            />
          </form>
          <BizIcon
            type="xiaoliantubiao"
            onClick={() => {
              this.toggleTarget('emoji');
              setTimeout(() => {
                try {
                  const emojiHeight = document.getElementsByClassName('slider-slide')[0]
                    .clientHeight;
                  this.setState({ emojiHeight });
                } catch { }
              }, 500);
            }}
          />
          &nbsp;
          {this.isDirty() ? (
            <BizIcon type="send" onClick={this.onSendMessage} />
          ) : (
              <BizIcon
                type="plus-circle"
                onClick={() => {
                  this.toggleTarget('multiple');
                }}
              />
            )}
        </div>
        {toggleTarget === 'multiple' && (
          <div className={styles.multiplePanel}>
            <BizIcon type="camera-fill" />
            <BizIcon type="image-fill" />
            <BizIcon type="folder-open-fill" onClick={this.onSendMessage} />
          </div>
        )}
        {toggleTarget === 'emoji' && (
          <Grid
            style={{ height: emojiHeight }}
            data={emojiData}
            columnNum={8}
            carouselMaxRow={4}
            isCarousel={true}
            onClick={item => {
              const {
                form: { setFieldsValue, getFieldValue },
              } = this.props;
              const inputMessage = getFieldValue('inputMessage');
              setFieldsValue({ inputMessage: (inputMessage || '') + item.text });
            }}
          />
        )}
      </div>
    );
  };

  public renderRecordIndicator = () => {
    const { recording } = this.state;
    return (
      <ActivityIndicator
        toast={true}
        text="Recording...Release to send"
        animating={recording}
        key="recordIndicator"
      />
    );
  };

  public renderSwiper = () => {
    const { toggleSwipe, curImageId, messages } = this.state;
    const imageURLs: string[] = [];
    messages.forEach(item => {
      if (item.dataContent === '[image]') {
        imageURLs.push(item.dataContent);
      }
    });
    const props = {
      imageURLs,
      curImageIndex: this.imageIds.indexOf(curImageId),
      closeSwipe: () => {
        this.setState({ toggleSwipe: false });
      },
    };
    if (toggleSwipe) {
      return <Swiper {...props} key="swiperContainer" />;
    }
    return null;
  };

  public render() {
    return [
      this.renderTitle(),
      this.renderChatBody(),
      this.renderChatInput(),
      this.renderRecordIndicator(),
      this.renderSwiper(),
    ];
  }
}

const IndexWrapper = createForm()(Index);

export default IndexWrapper;
