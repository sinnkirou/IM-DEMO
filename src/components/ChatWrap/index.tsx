import AudioPlaying from '@/components/AudioPlaying';
import BizIcon from '@/components/BizIcon';
import {
  DataType,
  getFile,
  getLocalFileURL,
  IFile,
  setFileMsgContent,
} from '@/components/ChatWrap/utils/imFileUtil';
import Swiper from '@/components/Swiper';
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
import Hammer from 'hammerjs';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment';
import { createForm } from 'rc-form';
import QueueAnim from 'rc-queue-anim';
import React, { PureComponent } from 'react';
import router from 'umi/router';
import { v1 as uuid } from 'uuid';
import { IChatProps, IMessage, IMessageBase, IState } from './index.d';
import styles from './index.less';
import emojis from './json/emojis.json';

const emojiData = emojis.map(emoji => ({ text: emoji }));

interface IProps extends IChatProps, IRCForm {}
class Index extends PureComponent<IProps> {
  public static getDerivedStateFromProps(props: IProps) {
    const { targetUser, currentUser, messages } = props;
    const filteredMessages = messages.filter(
      (i: IMessage) =>
        (String(i.to) === String(currentUser.id) && String(i.from) === String(targetUser.id)) ||
        (String(i.to) === String(targetUser.id) && String(i.from) === String(currentUser.id))
    );
    return { messages: filteredMessages };
  }
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
    toggleTarget: 'input',
    toggleSwipe: false,
    curImageId: null,
    recording: false,
    audioDurations: {},
    messages: []
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
    this.props.syncMsgs();
    this.scrollIntoLatest();
  }

  public componentDidUpdate(prevProps: IProps) {
    if (this.props.messages.length !== prevProps.messages.length) {
      const { length } = this.props.messages;
      let timeout = 500;
      const scrollIfTheLast = (index: number, size: number) => {
        if (index === size - 1) {
          this.scrollIntoLatest(timeout);
        }
      };
      this.props.messages.forEach((item, index) => {
        const { type } = getFile(item.dataContent);
        if (type === DataType.IMAGE) {

          timeout = prevProps.messages.length === 0? 3000: 1000;
          
          this.loadOrDownloadFile(item, false, () => {
            scrollIfTheLast(index, length);
          });
        } else {
          scrollIfTheLast(index, length);
        }
      });
    }
  }

  public loadOrDownloadFile = (
    msg: IMessage,
    isDownload: boolean = false,
    callback?: () => void
  ) => {
    const download = (blobUrl: string) => {
      const a = document.createElement('a');
      a.download = file.name;
      a.href = blobUrl;
      document.body.appendChild(a);
      a.click();
      a.remove();
    };
    const downloadWithBlobOrUrl = (blob: Blob | string) => {
      if (typeof blob !== 'string') {
        const reader = new FileReader();
        reader.readAsDataURL(blob as Blob);
        reader.onload = e => {
          download(e.target.result as string);
          Toast.hide();
        };
      } else {
        download(blob);
        Toast.hide();
      }
    };

    if (isDownload) {
      Toast.loading('loading', 0);
    }
    const file = getFile(msg.dataContent);
    if (file.url.indexOf('blob') >= 0) {
      if (isDownload) {
        downloadWithBlobOrUrl(file.url);
      }
      if (callback) {
        callback();
      }
      return;
    }
    if(this.props.fileDownload) {
      this.props.fileDownload(file.url).then((res: Blob) => {
        const blob = res;
        if (isDownload) {
          downloadWithBlobOrUrl(blob);
        } else {
          const URL = window.URL || window.webkitURL;
          const blobUrl = URL.createObjectURL(blob);
          if(this.props.msgUpdate) {
            this.props.msgUpdate(msg.fp, setFileMsgContent(file.name, DataType.IMAGE, msg.fp, blobUrl));
          }
          if (callback) {
            callback();
          }
        }
      });
    }
  };

  public handleGesture = () => {
    const press = new Hammer(document.getElementsByClassName('am-input-item')[0]);
    press.on(
      'press',
      () => {
        const { toggleTarget } = this.state;
        if (toggleTarget === 'audio') {
          console.debug('');
        }
      },
      15,
      2000
    );
    const pressup = new Hammer(document.getElementsByClassName('am-input-item')[0]);
    pressup.on('pressup', null, 15);
  };

  public renderTitle = () => {
    const { targetUser } = this.props;
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
    const newMessage = {
      ...message,
      sendTs: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    // console.debug(newMessage);
    this.props.insertMsg(newMessage);
    this.setState({
      toggleTarget: 'input',
    });
  };

  public onSendMessage = () => {
    const { form, targetUser, currentUser } = this.props;
    form.validateFields((error, values) => {
      if (!error) {
        const { inputMessage } = values;
        const message: IMessageBase = {
          dataContent: inputMessage,
          from: currentUser.id,
          to: targetUser.id,
          fp: uuid(),
        };
        this.appendMessage(message);
        this.props.sendMsg(message);
        this.inputMessage.clearInput();
      }
    });
  };

  public scrollIntoLatest = (timeout: number = 500) => {
    const { pullRefreshing } = this.state;
    if (pullRefreshing) {
      this.setState({ pullRefreshing: false });
      return;
    }
    setTimeout(() => {
      if (this.scrollView) {
        const height = 1000000;
        // const listBody = document.getElementsByClassName('list-view-section-body');
        // if (listBody && listBody[0]) {
        //   height = listBody[0].clientHeight;
        // }
        // console.debug('scrollHeight___________', height);
        this.scrollView.scrollTo(0, height);
        // console.debug('scrollIntoLatest');
      }
    }, timeout);
  };

  public onRefresh = () => {
    const { page } = this.state;
    const { canPullRefresh } = this.props;
    if (!canPullRefresh) {
      return;
    }
    this.setState({ pullRefreshing: true, page: page + 1 }, () => {
      this.props.syncMsgs(this.state.page);
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

  public getAudioWidth = src => {
    const { audioDurations } = this.state;
    return audioDurations[src] ? audioDurations[src] / 10 + 3 : 0;
  };

  public generateRow = (item: IMessage) => {
    if (isEmpty(item)) {
      return null;
    }
    const { playingItem, audioDurations } = this.state;
    const { targetUser, currentUser } = this.props;
    const isOwn = String(item.from) === String(currentUser.id);
    const file: IFile = getFile(item.dataContent);

    return (
      <QueueAnim delay={100}>
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
            {!isOwn &&
              (targetUser.head ? (
                <img src={targetUser.head} alt="head" className={styles.roundIcon} />
              ) : (
                <BizIcon type="icon-test" className={styles.userIcon} />
              ))}

            <Flex direction="column" align={isOwn ? 'end' : 'start'}>
              <span className={styles.nickname}>
                {(isOwn ? currentUser.nickname : targetUser.nickname) || ''}
              </span>
              <Flex direction="row" justify={isOwn ? 'end' : 'start'}>
                {isOwn && item.sentSuccess === undefined && <ActivityIndicator />}
                {isOwn && item.sentSuccess === false && <BizIcon type="reload" />}
                {file.type === DataType.TEXT && (
                  <span
                    className={`messageItem ${isOwn ? styles.ownMessage : styles.otherMessage}`}
                  >
                    {item.dataContent}
                  </span>
                )}
                {file.type === DataType.IMAGE && (
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
                {file.type === DataType.AUDIO.toString() && (
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
                {file.type === DataType.FILE.toString() && (
                  <span
                    className={`messageItem ${isOwn ? styles.ownMessage : styles.otherMessage}`}
                    onClick={() => {
                      Modal.alert('Download', 'Are you sure?', [
                        { text: 'Cancel' },
                        {
                          text: 'Ok',
                          onPress: () => {
                            this.loadOrDownloadFile(item, true);
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
              (currentUser.head ? (
                <img src={currentUser.head} alt="head" className={styles.roundIcon} />
              ) : (
                <BizIcon type="icon-test" className={styles.userIcon} />
              ))}
          </Flex>
          <WhiteSpace />
        </div>
      </QueueAnim>
    );
  };

  public renderChatBody = () => {
    const { pullRefreshing, messages } = this.state;
    const { toolPanelStyle } = this.props;
    // console.debug(messages);

    return (
      <ListView
        key="listView"
        dataSource={this.dataSource.cloneWithRows(messages)}
        renderRow={this.generateRow}
        className={styles.scrollList}
        style={toolPanelStyle}
        pullToRefresh={<PullToRefresh refreshing={pullRefreshing} onRefresh={this.onRefresh} />}
        initialListSize={100}
        ref={el => {
          this.scrollView = el;
        }}
        pageSize={10}
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
      const { currentUser, targetUser } = this.props;
      const fp = uuid();
      const fileUrl = getLocalFileURL(file);
      const message: IMessageBase = {
        fp,
        dataContent: setFileMsgContent(file.name, type, fp, fileUrl),
        from: currentUser.id,
        to: targetUser.id,
      };

      this.appendMessage(message);
      const formData = new FormData();
      formData.append('file', file);
      this.props
        .fileUpload(formData)
        .then(data => {
          if (data) {
            this.props.sendMsg({
              ...message,
              dataContent: setFileMsgContent(file.name, type, fp, data),
            });
          }
        })
        .catch(Toast.fail);
    }
  };

  public renderChatInput = () => {
    const { form, toolPanelStyle } = this.props;
    const { getFieldProps } = form;
    const { toggleTarget } = this.state;

    return (
      <div className={styles.toolPanel} style={toolPanelStyle} key="toolPanel">
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
                this.forceUpdate();
              }, 0);
            }}
          />
          &nbsp;
          {this.isDirty() ? (
            <BizIcon
              type="send"
              onClick={e => {
                e.preventDefault();
                this.onSendMessage();
                if (document.getElementsByTagName('input')) {
                  document.getElementsByTagName('input')[0].blur();
                }
              }}
            />
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
              className={styles.hidden}
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
              className={styles.hidden}
              onChange={e => {
                this.onFileChange(e, DataType.IMAGE);
              }}
            />
            <input
              type="file"
              ref={el => {
                this.filePickerRef = el;
              }}
              className={styles.hidden}
              onChange={e => {
                this.onFileChange(e, DataType.FILE);
              }}
            />
          </div>
        )}
        {toggleTarget === 'emoji' && (
          <Grid
            data={emojiData}
            columnNum={8}
            carouselMaxRow={4}
            isCarousel={true}
            hasLine={false}
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
    this.imageIds = [];
    messages.forEach(item => {
      const file = getFile(item.dataContent);
      if (file.type === DataType.IMAGE) {
        imageURLs.push(file.url);
        this.imageIds.push(file.fp);
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
