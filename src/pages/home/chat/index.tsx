import AudioPlaying from '@/components/AudioPlaying';
import BizIcon from '@/components/BizIcon';
import Swiper from '@/components/Swiper';
import emojis from '@/json/emojis.json';
import { IAppState, IUser } from '@/models/app';
import { IMessage, IMessageBase, IMState } from '@/models/im';
import {
  DataType,
  getDataType,
  getFile,
  getFileURL,
  IFile,
  setFileMsgContent,
} from '@/utils/imFileUtil';
import {
  ActivityIndicator,
  Flex,
  Grid,
  Icon,
  InputItem,
  ListView,
  Modal,
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
import styles from './index.less';

const emojiData = emojis.map(emoji => ({ text: emoji }));

interface IState {
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
  public filePickerRef = null;
  public imagePickerRef = null;
  public cameraPickerRef = null;

  public state: IState = {
    pullRefreshing: false,
    page: 1,
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

  public componentDidMount() {
    this.handleGesture();
    const {
      location: {
        query: { targetId },
      },
      app: { user },
    } = this.props;
    const { contacts } = this.props.app;
    const targetUser = contacts.find(i => String(i.id) === String(targetId)) || {};
    this.setState({
      targetUser,
      currentUser: user,
    });
    this.getMessages();
  }

  public static getDerivedStateFromProps(props: IProps, state: IState) {
    const {
      location: {
        query: { targetId },
      },
      im: { messages },
      app: { user },
    } = props;
    const filteredMessages = messages.filter(
      (i: IMessage) =>
        (String(i.to) === String(user.id) && String(i.from) === String(targetId)) ||
        (String(i.to) === String(targetId) && String(i.from) === String(user.id))
    );
    return { messages: filteredMessages };
  }

  public componentDidUpdate(prevProps, prevState) {
    if (this.state.messages.length !== prevState.messages.length) {
      this.state.messages.forEach(item => {
        const type = getDataType(item.fp, item.dataContent);
        if (type === DataType.IMAGE) {
          this.downLoadFile(item);
        }
      });
      this.scrollIntoLatest();
    }
  }

  public downLoadFile = (msg: IMessage, download: boolean = false) => {
    const dataType = getDataType(msg.fp, msg.dataContent);
    const file = getFile(dataType, msg.fp, msg.dataContent);
    if (file.url.indexOf('blob') >= 0) {
      return;
    }

    if (download) {
      Toast.loading('loading', 0);
    }
    this.props
      .dispatch({
        type: 'im/fileDownload',
        payload: {
          key: file.url,
        },
      })
      .then(res => {
        const blob = res;
        if (download) {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = e => {
            const a = document.createElement('a');
            a.download = file.name;
            a.href = e.target.result;
            document.body.appendChild(a);
            a.click();
            a.remove();
            Toast.hide();
          };
        } else {
          const URL = window.URL || window.webkitURL;
          const blobUrl = URL.createObjectURL(blob);
          this.props.dispatch({
            type: 'im/MESSAGE_UPDATE',
            payload: {
              fp: msg.fp,
              dataContent: setFileMsgContent(file.name, DataType.IMAGE, msg.fp, blobUrl),
            },
          });
        }
      });
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
      sendTs: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    // console.debug(newMessage);
    dispatch({
      type: 'im/INSERT_MESSAGE',
      payload: newMessage,
    });
    this.setState({
      toggleTarget: 'input',
    });
    this.scrollIntoLatest();
  };

  public onSendMessage = () => {
    const {
      form,
      dispatch,
      location: {
        query: { targetId },
      },
    } = this.props;
    const { currentUser } = this.state;
    form.validateFields((error, values) => {
      if (!error) {
        const { inputMessage } = values;
        const message: IMessageBase = {
          dataContent: inputMessage,
          from: currentUser.id,
          to: targetId,
          fp: uuid(),
        };
        dispatch({
          type: 'im/send',
          payload: {
            message,
            handleSendResult: code => {
              // console.debug(code);
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

  public scrollIntoLatest = () => {
    const { pullRefreshing } = this.state;
    if (pullRefreshing) {
      this.setState({ pullRefreshing: false });
      return;
    }
    setTimeout(() => {
      if (this.scrollView) {
        let height = 1000000;
        // const listBody = document.getElementsByClassName('list-view-section-body');
        // if (listBody && listBody[0]) {
        //   height = listBody[0].clientHeight;
        // }
        // console.debug('scrollHeight___________', height);
        this.scrollView.scrollTo(0, height);
      }
    }, 1000);
  };

  public getMessages = () => {
    const {
      location: {
        query: { targetId },
      },
      app: { user },
      dispatch,
    } = this.props;
    const { page } = this.state;
    dispatch({
      type: 'im/syncMessages',
      payload: {
        fromUserId: user.id,
        toUserId: targetId,
        page: page || 1,
      },
    })
      .then(() => {
        
      })
      .catch(Toast.fail);
  };

  public onRefresh = () => {
    const { page, messages } = this.state;
    const {
      im: { total },
    } = this.props;
    if (messages.length >= total) {
      return;
    }
    this.setState({ pullRefreshing: true, page: page + 1 }, () => {
      this.getMessages();
    });
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

  public generateRow = (item: IMessage) => {
    if (isEmpty(item)) {
      return null;
    }
    const { userImageSrc, playingItem, audioDurations } = this.state;
    const { targetUser, currentUser } = this.state;
    const isOwn = String(item.from) === String(currentUser.id);
    const dataType = getDataType(item.fp, item.dataContent);
    const file: IFile = getFile(dataType, item.fp, item.dataContent);

    if (dataType === DataType.IMAGE.toString()) {
      this.imageIds.push(item.fp);
      // console.debug(item, file);
    } else if (dataType === DataType.AUDIO.toString()) {
      // this.setDuration(item.dataContent);
    }
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

        <Flex justify={isOwn ? 'end' : 'start'} align="start">
          {!isOwn && <BizIcon type="icon-test" className={styles.userIcon} />}

          <Flex direction="column" align={isOwn ? 'end' : 'start'}>
            <span className={styles.from}>
              {(isOwn ? currentUser.nickname : targetUser.nickname) || ''}
            </span>
            <Flex direction="row" justify={isOwn ? 'end' : 'start'}>
              {isOwn && item.sentSuccess === undefined && <ActivityIndicator />}
              {isOwn && item.sentSuccess === false && <BizIcon type="reload" />}
              {dataType === DataType.TEXT && (
                <span className={`messageItem ${isOwn ? styles.ownMessage : styles.otherMessage}`}>
                  {item.dataContent}
                </span>
              )}
              {dataType === DataType.IMAGE && (
                <img
                  className={`messageItem ${styles.messageImg}`}
                  src={file.url}
                  alt="img"
                  onClick={() => {
                    this.setState({
                      toggleSwipe: true,
                      curImageId: item.fp,
                    });
                  }}
                />
              )}
              {dataType === DataType.AUDIO.toString() && (
                <span
                  className={`messageItem ${isOwn ? styles.ownMessage : styles.otherMessage}`}
                  onClick={() => {
                    // this.playAudio(item);
                  }}
                  style={{ width: `${this.getAudioWidth(file.url)}rem` }}
                  id={item.dataContent}
                >
                  <Flex>
                    {`${audioDurations[item.dataContent]}''`}
                    {<AudioPlaying isPlaying={playingItem === item.fp} />}{' '}
                  </Flex>
                </span>
              )}
              {dataType === DataType.FILE.toString() && (
                <span
                  className={`messageItem ${isOwn ? styles.ownMessage : styles.otherMessage}`}
                  onClick={() => {
                    Modal.alert('Download', 'Are you sure?', [
                      { text: 'Cancel' },
                      {
                        text: 'Ok',
                        onPress: () => {
                          this.downLoadFile(item, true);
                        },
                      },
                    ]);
                  }}
                >
                  {file.name}
                  &nbsp;&nbsp;
                  <BizIcon type="weizhiwenjian" style={{ fontSize: '0.5rem' }} />
                </span>
              )}
            </Flex>
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
    const { pullRefreshing, messages } = this.state;
    // console.debug(messages);

    return (
      <ListView
        key="listView"
        dataSource={this.dataSource.cloneWithRows(messages)}
        renderRow={this.generateRow}
        className={styles.scrollList}
        pullToRefresh={<PullToRefresh refreshing={pullRefreshing} onRefresh={this.onRefresh} />}
        initialListSize={10}
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

  public toggleTarget = (target: 'emoji' | 'audio' | 'multiple' | 'input') => {
    const { toggleTarget } = this.state;
    this.scrollIntoLatest();
    this.setState({ toggleTarget: toggleTarget === target ? 'input' : target });
  };

  public onFocus = () => {
    this.scrollIntoLatest();
    this.setState({ toggleTarget: 'input' });
  };

  public onFileChange = (e, type: DataType) => {
    const file = get(e, 'target.files[0]');
    if (/image\/*/.test(file.type)) {
      type = DataType.IMAGE;
    }
    // console.debug(type);
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      this.props
        .dispatch({
          type: 'im/fileUpload',
          payload: formData,
        })
        .then(data => {
          if (data) {
            const { currentUser } = this.state;
            const {
              location: {
                query: { targetId },
              },
            } = this.props;
            const fp = uuid();
            const message: IMessageBase = {
              fp,
              dataContent: setFileMsgContent(file.name, type, fp, data),
              from: currentUser.id,
              to: targetId,
            };
            this.props
              .dispatch({
                type: 'im/send',
                payload: {
                  message,
                  handleSendResult: code => {
                    // console.debug(code);
                    if (code === 0) {
                      const fileUrl = getFileURL(file);
                      this.appendMessage({
                        ...message,
                        dataContent: setFileMsgContent(file.name, type, fp, fileUrl),
                      });
                    }
                  },
                },
              })
              .catch(Toast.fail);
          }
        })
        .catch(Toast.fail);
    }
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
            }}
          >
            <InputItem
              {...getFieldProps('inputMessage', {
                rules: [
                  { whitespace: true, message: 'Empty is not allowed' },
                  { required: true, message: 'message is required' },
                ],
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
                } catch {}
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
            <BizIcon
              type="camera-fill"
              onClick={() => {
                this.cameraPickerRef.click();
              }}
            />
            <BizIcon
              type="image-fill"
              onClick={() => {
                this.imagePickerRef.click();
              }}
            />
            <BizIcon
              type="folder-open-fill"
              onClick={() => {
                this.filePickerRef.click();
              }}
            />
            <input
              type="file"
              ref={el => {
                this.cameraPickerRef = el;
              }}
              accept="image/*"
              capture="camera"
              className={styles.hiddenInput}
              onChange={e => {
                this.onFileChange(e, DataType.IMAGE);
              }}
            />
            <input
              type="file"
              ref={el => {
                this.imagePickerRef = el;
              }}
              accept="image/*"
              className={styles.hiddenInput}
              onChange={e => {
                this.onFileChange(e, DataType.IMAGE);
              }}
            />
            <input
              type="file"
              ref={el => {
                this.filePickerRef = el;
              }}
              className={styles.hiddenInput}
              onChange={e => {
                this.onFileChange(e, DataType.FILE);
              }}
            />
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
      const type = getDataType(item.fp, item.dataContent);
      if (type === DataType.IMAGE) {
        const file = getFile(type, item.fp, item.dataContent);
        imageURLs.push(file.url);
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
