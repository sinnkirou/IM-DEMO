import { List, ListView, SearchBar, WhiteSpace } from 'antd-mobile';
import pinyin from 'chinese-to-pinyin';
import QueueAnim from 'rc-queue-anim';
import React from 'react';
import { Sticky, StickyContainer } from 'react-sticky';
import { router } from 'umi';
import { IUser } from '../ChatWrap/index.d';

const { Item } = List;

function genData(ds, contactList: IContactList) {
  const dataBlob = {};
  const sectionIDs = [];
  const rowIDs = [];
  Object.keys(contactList).forEach((item, index) => {
    sectionIDs.push(item);
    dataBlob[item] = item;
    rowIDs[index] = [];

    contactList[item].forEach(jj => {
      rowIDs[index].push(jj.id);
      dataBlob[jj.id] = jj.nickname;
    });
  });
  return ds.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs);
}

interface IContactList {
  [propName: string]: Array<{ id: string; nickname: string; spell: string; head?: string }>;
}

interface IProps {
    contacts: IUser[]
}

class Index extends React.Component<IProps> {
  public state: {
    inputValue?: string;
    dataSource: any;
    isLoading: boolean;
    contactList: IContactList;
  } = {
    dataSource: null,
    isLoading: true,
    contactList: {},
  };

  constructor(props) {
    super(props);
    const getSectionData = (dataBlob, sectionID) => dataBlob[sectionID];
    const getRowData = (dataBlob, sectionID, rowID) => dataBlob[rowID];

    const dataSource = new ListView.DataSource({
      getRowData,
      getSectionHeaderData: getSectionData,
      rowHasChanged: (row1, row2) => row1 !== row2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });

    this.state = {
      inputValue: '',
      dataSource,
      isLoading: true,
      contactList: {},
    };
  }

  public componentWillMount() {
    const {
        contacts
    } = this.props;
    const contactList: IContactList = {};

    contacts.forEach(item => {
      const spell = pinyin(item.nickname, { removeTone: true }) || '';
      const key = spell.substring(0, 1).toUpperCase();
      const value = contactList[key] || [];
      const head = require(`@/assets/head/头像${Math.round(Math.random() * (1 - 20) + 20)}.png`);
      value.push({
        ...item,
        spell,
        head,
      });
      contactList[key] = value;
    });

    this.setState({
      dataSource: genData(this.state.dataSource, contactList),
      isLoading: false,
      contactList,
    });
  }

  public onSearch = val => {
    const contactSet = { ...this.state.contactList };
    const key = pinyin(val, { removeTone: true }) || '';
    Object.keys(contactSet).forEach(item => {
      const arr = contactSet[item].filter(jj => jj.spell.toLocaleLowerCase().indexOf(key) > -1);
      if (!arr.length) {
        delete contactSet[item];
      } else {
        contactSet[item] = arr;
      }
    });
    this.setState({
      inputValue: val,
      dataSource: genData(this.state.dataSource, contactSet),
    });
  };

  public render() {
    return (
      <div style={{ paddingTop: '44px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <SearchBar
            value={this.state.inputValue}
            placeholder="Search"
            onChange={this.onSearch}
            onClear={() => {
              // console.log('onClear');
            }}
            onCancel={() => {
              // console.log('onCancel');
            }}
          />
        </div>
        <ListView.IndexedList
          dataSource={this.state.dataSource}
          className="am-list sticky-list"
          useBodyScroll={true}
          renderSectionWrapper={sectionID => (
            <StickyContainer
              key={`s_${sectionID}_c`}
              className="sticky-container"
              style={{ zIndex: 4 }}
            />
          )}
          renderSectionHeader={sectionData => (
            <Sticky>
              {({ style }) => (
                <div
                  className="sticky"
                  style={{
                    ...style,
                    zIndex: 3,
                    backgroundColor: sectionData.charCodeAt(0) % 2 ? '#5890ff' : '#F8591A',
                    color: 'white',
                  }}
                >
                  {sectionData}
                </div>
              )}
            </Sticky>
          )}
          renderHeader={() => <WhiteSpace />}
          renderFooter={() => <WhiteSpace />}
          renderRow={(rowData, sectionID, rowID) => {
            const { contactList } = this.state;
            const section = contactList[sectionID] || [];
            const user = section.find(d => d.id === rowID);
            return (
              <QueueAnim type="left" delay={100}>
                <Item
                  onClick={() => {
                    if (user && user.id) {
                      router.push({
                        pathname: '/home/chat',
                        query: {
                          targetId: user.id,
                        },
                      });
                    }
                  }}
                >
                  <img src={user.head} alt="head" />
                  &nbsp;&nbsp;
                  <span>{rowData}</span>
                </Item>
              </QueueAnim>
            );
          }}
          quickSearchBarStyle={{
            top: 85,
          }}
          delayTime={10}
          delayActivityIndicator={
            <div style={{ padding: 25, textAlign: 'center' }}>rendering...</div>
          }
        />
      </div>
    );
  }
}

export default Index;
