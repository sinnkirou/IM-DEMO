import React, { PureComponent } from 'react';
import { NavBar, List, InputItem, Icon, Grid } from 'antd-mobile';
import QueueAnim from 'rc-queue-anim';

const Item = List.Item;

export interface IChatProps {
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

interface IState {
  content: string;
  isShowEmoji: boolean;
}

class Index extends PureComponent<IChatProps> {
  state: IState = {
    content: '', // 输入聊天的内容
    isShowEmoji: false, // 是否显示表情列表
  };
  emojis = [];

  // 切换表情列表的显示
  toggleShow = () => {
    const isShowEmoji = !this.state.isShowEmoji;
    this.setState({ isShowEmoji });
    if (isShowEmoji) {
      // !异步手动派发resize时间,解决表情列表显示bug
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      });
    }
  };
  // 在第一次render()之前回调
  componentWillMount() {
    // 初始化表情列表数据
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
    this.emojis = emojis.map(emoji => ({ text: emoji }));
  }

  componentDidMount() {
    // 初始显示列表
    window.scrollTo(0, document.body.scrollHeight);
  }

  componentDidUpdate() {
    // 更新显示列表
    window.scrollTo(0, document.body.scrollHeight);
  }
  componentWillUnmount() {
    // 发请求更新消息的未读状态
    // const targetId = this.props.match.params.userid;
    // this.props.readMsg(targetId);
  }
  handleSend = () => {
    const content = this.state.content.trim();
    const { id: toId } = this.props.toUser;
    const { id: fromId } = this.props.fromUser;
    // this.props.sendMsg({ from: fromId, to: toId, content });
    this.setState({ content: '', isShowEmoji: false });
  };
  render() {
    const { toUser, msgs } = this.props;
    // const targetIcon = users[targetId] ? require(`../../assets/images/${users[targetId].avatar}.png`) : null;
    const targetIcon = require(`../../assets/head/头像1.png`);

    return (
      <div id="chat-page">
        <NavBar
          className="stick-top"
          icon={<Icon type="left" />}
          onLeftClick={() => this.props.history.goBack()}
        >
          {toUser.username || ''}
        </NavBar>
        <List style={{ marginBottom: 50, marginTop: 50 }}>
          {/*alpha left right top bottom scale scaleBig scaleX scaleY*/}
          <QueueAnim type="left" delay={100}>
            {msgs.map(msg => {
              if (msg.userId === toUser.id) {
                return (
                  <Item key={msg.id} thumb={targetIcon}>
                    {msg.content}
                  </Item>
                );
              } else {
                return (
                  <Item key={msg.id} className="chat-me" extra="我">
                    {msg.content}
                  </Item>
                );
              }
            })}
          </QueueAnim>
        </List>
        <div className="am-tab-bar">
          <InputItem
            placeholder="请输入"
            value={this.state.content}
            onChange={val => this.setState({ content: val })}
            onFocus={() => this.setState({ isShowEmoji: false })}
            extra={
              <span>
                <span role="img" onClick={this.toggleShow} style={{ marginRight: 5 }}>
                  😊
                </span>
                <span onClick={this.handleSend}>发送</span>
              </span>
            }
          />
          {this.state.isShowEmoji ? (
            <Grid
              data={this.emojis}
              columnNum={8}
              carouselMaxRow={4}
              isCarousel={true}
              onClick={item => {
                this.setState({ content: this.state.content + item.text });
              }}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

export default Index;
