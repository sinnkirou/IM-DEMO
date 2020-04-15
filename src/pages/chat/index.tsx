import React, { PureComponent } from 'react';
import {
  NavBar,
  Icon,
  List,
  InputItem,
  Flex,
  ListView,
  PullToRefresh,
  WhiteSpace,
  Toast,
  ActivityIndicator,
  Grid,
} from 'antd-mobile';
import router from 'umi/router';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import uuid from 'uuid/v1';
import moment from 'moment';
import Hammer from 'hammerjs';
// import Manager from 'srt-im-sdk';
import styles from './index.less';
import BizIcon from '@/components/BizIcon';
import AudioPlaying from '@/components/AudioPlaying';
import Swiper from '@/components/Swiper';
import imageSrc from '@/assets/newUpdate.png';

const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧'];
const emojiData = emojis.map(emoji => ({ text: emoji }));

const _messages: IMessage[] = [
  {
    from: '张三',
    value: 'Welcome, what can I do for you?',
    id: uuid(),
    time: '2019-09-04 11:55:00',
  },
  {
    from: '张三',
    value: "I'm the recipient! (The person you're talking to)",
    id: uuid(),
    time: '2019-09-04 11:56:00',
  },
  { isOwn: true, value: "I'm you -- the blue bubble!", id: uuid(), time: '2019-09-04 12:00:00' },
  { isOwn: true, value: imageSrc, type: 'image', id: uuid(), time: '2019-09-04 12:05:00' },
  { isOwn: true, value: "I'm you -- the blue bubble!", id: uuid(), time: '2019-09-04 12:06:00' },
  { from: '张三', value: imageSrc, type: 'image', id: uuid(), time: '2019-09-04 12:07:00' },
  { from: '张三', value: imageSrc, type: 'image', id: uuid(), time: '2019-09-04 12:08:00' },
];

interface IMessage {
  value;
  isOwn?: boolean;
  type?;
  from?;
  id?: string;
  time?: string;
}

interface IState {
  refreshing: boolean;
  messages: IMessage[];
  page: number;
  total: number;
  lastTimeStamps?: object;
  userImageSrc?: string;
  toggleSwipe?: boolean;
  curImageId?: string;
  recording?: boolean;
  audioDurations?: object;
  playingItem: boolean;
  toggleTarget?: 'emoji' | 'audio' | 'multiple' | 'input';
  emojiHeight?: number;
}

interface IProps extends IConnectFormProps {
  fromUser: {
    id;
    username: string;
  };
  toUser: {
    id;
    username: string;
  };
  msgs: {
    id;
    userId;
    groupId;
    createTime: string;
    content: string;
  }[];
}

@connect(({ app }) => ({
  app,
}))
class Index extends PureComponent<IProps> {
  dataSource = null;
  audios = null;
  imageIds = null;
  scrollView = null;
  inputMessage = null;

  state: IState = {
    refreshing: false,
    messages: _messages,
    page: 0,
    total: 100,
    lastTimeStamps: {},
    userImageSrc: null,
    toggleTarget: 'input',
    toggleSwipe: false,
    curImageId: null,
    recording: false,
    audioDurations: {},
    playingItem: false,
    emojiHeight: 0,
  };

  constructor(props) {
    super(props);
    this.dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    // this.initClient();
    this.audios = {};
    this.imageIds = [];
  }

  componentDidMount() {
    this.scrollIntoLatest();
    this.handleGesture();
  }

  componentWillUnmount() {
    // Manager.getInstance().release();
  }

  scrollIntoLatest = () => {
    setTimeout(() => {
      if (this.scrollView) this.scrollView.scrollTo(0, 12000);
    }, 200);
  };

  handleGesture = () => {
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
        //     this.appendMessage({ value: this.mediaSrc, type: 'audio' });
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
  //         this.appendMessage({ value: dataContent, isOwn: false });
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

  renderTitle = () => {
    // const { toUser } = this.props;
    return (
      <NavBar
        mode="dark"
        icon={<Icon type="left" className={styles.titleIcon} />}
        onLeftClick={() => router.push('/setting')}
        key="title"
      >
        {/* {toUser.username} */}
        {'toUser'}
      </NavBar>
    );
  };

  appendMessage = (newMessage: IMessage) => {
    const { messages } = this.state;
    const { isOwn, value, type, from } = newMessage;
    const newMessages = messages.concat({
      isOwn,
      value,
      type,
      id: uuid(),
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      from,
    });
    this.setState({
      messages: newMessages,
      toggleMultiple: false,
    });
    setTimeout(() => this.scrollIntoLatest(), 200);
  };

  emitCallback = ({ code, message }) => {
    Toast.fail(message);
  };

  onSendMessage = () => {
    const { form } = this.props;
    // deviceHelper.setSoftKeyboardVisible(false);
    form.validateFields((error, value) => {
      if (!error) {
        const { inputMessage } = value;
        // Manager.getInstance().send(inputMessage, '1', '2', true);
        this.appendMessage({ value: inputMessage, isOwn: true });
        this.inputMessage.clearInput();
      }
    });
  };

  onRefresh = () => {
    const { refreshing, page, messages, total } = this.state;
    if (messages.length >= total) {
      return;
    }
    const newMessages: IMessage = [
      {
        value: "I'm new refreshed",
        from: 'Gary',
        id: uuid(),
        time: moment()
          .subtract(Math.round(Math.random() * 19), 'months')
          .format('YYYY-MM-DD HH:mm:ss'),
      },
    ]
      .concat(messages)
      .sort((x, y) => (moment(y.time).isAfter(moment(x.time)) ? -1 : 1));
    this.setState({
      messages: newMessages,
      refreshing: false,
      page: refreshing ? page + 1 : 0,
    });
  };

  shouldShowTimeStamp = ({ time, id }) => {
    if (!time) return false;
    const key = moment(time).format('YYYY-MM-DD HH:mm');
    const { lastTimeStamps } = this.state;
    const timestamp = lastTimeStamps[key];
    let result = true;
    if (!timestamp) {
      Object.keys(lastTimeStamps).forEach(item => {
        if (moment(time).isBetween(moment(item).subtract(5, 'm'), moment(item).add(5, 'm'))) {
          result = false;
        }
      });
      if (result) lastTimeStamps[key] = id;
    } else {
      result = false;
      if (timestamp && timestamp === id) result = true;
    }
    return result;
  };

  formatTimeStamp = time => {
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
  //   const { id, value: src } = item;
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

  getAudioWidth = src => {
    const { audioDurations } = this.state;
    return audioDurations[src] ? audioDurations[src] / 10 + 3 : 0;
  };

  generateRow = item => {
    const { userImageSrc, playingItem, audioDurations } = this.state;
    if (item.type === 'audio') {
      // this.setDuration(item.value);
    } else if (item.type === 'image') {
      this.imageIds.push(item.id);
    }
    return (
      <div key={item.id} id={item.id} className={styles.mssageRow}>
        {this.shouldShowTimeStamp(item) && (
          <>
            <WhiteSpace />
            <Flex justify="center">
              <span className={styles.datetime}>{this.formatTimeStamp(item.time)}</span>
            </Flex>
            <WhiteSpace />
          </>
        )}
        <Flex justify={item.isOwn ? 'end' : 'start'} align="start">
          {!item.isOwn && <BizIcon type="icon-test" className={styles.userIcon} />}

          <Flex direction="column" align={item.isOwn ? 'end' : 'start'}>
            <span className={styles.from}>{item.from ? item.from : ''}</span>
            {(!item.type || item.type === 'text') && (
              <span
                className={`messageItem ${item.isOwn ? styles.ownMessage : styles.otherMessage}`}
              >
                {item.value}
              </span>
            )}
            {item.type === 'image' && (
              <img
                className={`messageItem ${styles.messageImg}`}
                src={item.value}
                alt="img"
                onClick={() => {
                  this.setState({
                    toggleSwipe: true,
                    curImageId: item.id,
                  });
                }}
              />
            )}
            {item.type === 'audio' && (
              <span
                className={`messageItem ${item.isOwn ? styles.ownMessage : styles.otherMessage}`}
                onClick={() => {
                  // this.playAudio(item);
                }}
                style={{ width: `${this.getAudioWidth(item.value)}rem` }}
                id={item.value}
              >
                <Flex>
                  {`${audioDurations[item.value]}''`}
                  {<AudioPlaying isPlaying={playingItem === item.id} />}{' '}
                </Flex>
              </span>
            )}
          </Flex>

          {item.isOwn &&
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

  renderChatBody = () => {
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

  isDirty = () => {
    const { form } = this.props;
    const value = form.getFieldValue('inputMessage');
    return !!value;
  };

  // onCameraSuccess = imageURL => {
  //   logger.info(`onCameraSuccess:_____________________${imageURL}`);
  //   const userImageSrc = `data:image/jpeg;base64,${imageURL}`;
  //   this.appendMessage({ value: userImageSrc, type: 'image' });
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

  toggleTarget = (target: 'emoji' | 'audio' | 'multiple' | 'input') => {
    const { toggleTarget } = this.state;
    this.scrollIntoLatest();
    this.setState({ toggleTarget: toggleTarget === target ? 'input' : target });
  };

  onFocus = () => {
    this.scrollIntoLatest();
    this.setState({ toggleMultiple: false });
  };

  renderChatInput = () => {
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
                  const emojiHeight = document.getElementsByClassName('slider-slide')[0].clientHeight;
                  this.setState({ emojiHeight });
                }catch{

                }
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
              style={{height: emojiHeight}}
              data={emojiData}
              columnNum={8}
              carouselMaxRow={4}
              isCarousel={true}
              onClick={(item) => {
                // this.setState({ content: this.state.content + item.text })
              }}
            />
        )}
      </div>
    );
  };

  renderRecordIndicator = () => {
    const { recording } = this.state;
    return (
      <ActivityIndicator
        toast
        text="Recording...Release to send"
        animating={recording}
        key="recordIndicator"
      />
    );
  };

  renderSwiper = () => {
    const { toggleSwipe, curImageId, messages } = this.state;
    const imageURLs: string[] = [];
    messages.forEach(item => {
      if (item.type === 'image') imageURLs.push(item.value);
    });
    const props = {
      imageURLs,
      curImageIndex: this.imageIds.indexOf(curImageId),
      closeSwipe: () => {
        this.setState({ toggleSwipe: false });
      },
    };
    if (toggleSwipe) return <Swiper {...props} key="swiperContainer" />;
    return null;
  };

  render() {
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
