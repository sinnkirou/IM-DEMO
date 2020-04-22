import { IAppState } from '@/models/app';
import { List, ListView, SearchBar, Toast, WhiteSpace } from 'antd-mobile';
import { connect } from 'dva';
import pinyin from 'chinese-to-pinyin';
import React from 'react';
import { Sticky, StickyContainer } from 'react-sticky';
import { router } from 'umi';

const { Item } = List;

// const users: {
// 	[propName: string]: Array<{ id: number; nickname: string; spell: string }>;
// } = {
// 	L: [
// 		{
// 			id: 4,
// 			nickname: '李四',
// 			spell: 'lisi'
// 		}
// 	],
// 	W: [
// 		{
// 			id: 5,
// 			nickname: '王五',
// 			spell: 'wangwu'
// 		}
// 	],
// 	Z: [
// 		{
// 			id: 3,
// 			nickname: '张三',
// 			spell: 'zhangsan'
// 		}
// 	]
// };

function genData(ds, provinceData) {
  const dataBlob = {};
  const sectionIDs = [];
  const rowIDs = [];
  Object.keys(provinceData).forEach((item, index) => {
    sectionIDs.push(item);
    dataBlob[item] = item;
    rowIDs[index] = [];

    provinceData[item].forEach(jj => {
      rowIDs[index].push(jj.id);
      dataBlob[jj.id] = jj.nickname;
    });
  });
  return ds.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs);
}

interface IContactList {
  [propName: string]: Array<{ id: number; nickname: string; spell: string }>;
}

interface IProps extends IConnectProps {
  app: IAppState;
}

@connect(({ app }) => ({ app }))
class Index extends React.Component<IProps> {
  public state: {
    inputValue?: string;
    dataSource: any;
    isLoading: boolean;
    contactList: IContactList;
  } = {
    dataSource: null,
    isLoading: true,
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
    };
  }

  public componentWillMount() {
    const {
      app: { contacts },
    } = this.props;
    const contactList: IContactList = {};

    contacts.forEach(item => {
      // pending spell...
      const spell = pinyin(item.nickname, { removeTone: true }) || '';
      const key = spell.substring(0, 1).toUpperCase();
      const value = contactList[key] || [];
      value.push({
        ...item,
        spell,
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
    const pd = { ...this.state.contactList };
    Object.keys(pd).forEach(item => {
      const arr = pd[item].filter(jj => jj.spell.toLocaleLowerCase().indexOf(val) > -1);
      if (!arr.length) {
        delete pd[item];
      } else {
        pd[item] = arr;
      }
    });
    this.setState({
      inputValue: val,
      dataSource: genData(this.state.dataSource, pd),
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
          renderRow={(rowData, sectionID, rowID) => (
            <Item
              onClick={() => {
                const { contactList } = this.state;
                const section = contactList[sectionID] || [];
                const user = section.find(d => d.id === rowID);
                if (user) {
                  router.push({
                    pathname: '/home/chat',
                    query: {
                      targetId: user.id,
                    },
                  });
                }
              }}
            >
              {rowData}
            </Item>
          )}
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
