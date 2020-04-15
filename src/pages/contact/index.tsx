// import { province } from 'antd-mobile-demo-data';
import { StickyContainer, Sticky } from 'react-sticky';
import { ListView, List, SearchBar, WhiteSpace } from 'antd-mobile';
import React from 'react';
import { router } from 'umi';

const { Item } = List;

const province = {
	L: [
		{
			value: '100',
			label: '李四',
			spell: 'lisi'
		}
	],
	W: [
		{
			value: '110',
			label: '王五',
			spell: 'wangwu'
		}
	],
	Z: [
		{
			value: '120',
			label: '张三',
			spell: 'zhangsan'
		}
	]
};

function genData(ds, provinceData) {
	const dataBlob = {};
	const sectionIDs = [];
	const rowIDs = [];
	Object.keys(provinceData).forEach((item, index) => {
		sectionIDs.push(item);
		dataBlob[item] = item;
		rowIDs[index] = [];

		provinceData[item].forEach((jj) => {
			rowIDs[index].push(jj.value);
			dataBlob[jj.value] = jj.label;
		});
	});
	return ds.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs);
}

class Index extends React.Component {
	constructor(props) {
		super(props);
		const getSectionData = (dataBlob, sectionID) => dataBlob[sectionID];
		const getRowData = (dataBlob, sectionID, rowID) => dataBlob[rowID];

		const dataSource = new ListView.DataSource({
			getRowData,
			getSectionHeaderData: getSectionData,
			rowHasChanged: (row1, row2) => row1 !== row2,
			sectionHeaderHasChanged: (s1, s2) => s1 !== s2
		});

		this.state = {
			inputValue: '',
			dataSource,
			isLoading: true
		};
	}

	componentDidMount() {
		// simulate initial Ajax
		this.setState({
			dataSource: genData(this.state.dataSource, province),
			isLoading: false
		});
	}

	onSearch = (val) => {
		const pd = { ...province };
		Object.keys(pd).forEach((item) => {
			const arr = pd[item].filter((jj) => jj.spell.toLocaleLowerCase().indexOf(val) > -1);
			if (!arr.length) {
				delete pd[item];
			} else {
				pd[item] = arr;
			}
		});
		this.setState({
			inputValue: val,
			dataSource: genData(this.state.dataSource, pd)
		});
	};

	render() {
		return (
			<div style={{ paddingTop: '44px', position: 'relative' }}>
				<div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
					<SearchBar
						value={this.state.inputValue}
						placeholder="Search"
						onChange={this.onSearch}
						onClear={() => {
							console.log('onClear');
						}}
						onCancel={() => {
							console.log('onCancel');
						}}
					/>
				</div>
				<ListView.IndexedList
					dataSource={this.state.dataSource}
					className="am-list sticky-list"
					useBodyScroll
					renderSectionWrapper={(sectionID) => (
						<StickyContainer key={`s_${sectionID}_c`} className="sticky-container" style={{ zIndex: 4 }} />
					)}
					renderSectionHeader={(sectionData) => (
						<Sticky>
							{({ style }) => (
								<div
									className="sticky"
									style={{
										...style,
										zIndex: 3,
										backgroundColor: sectionData.charCodeAt(0) % 2 ? '#5890ff' : '#F8591A',
										color: 'white'
									}}
								>
									{sectionData}
								</div>
							)}
						</Sticky>
					)}
					renderHeader={() => <WhiteSpace />}
					renderFooter={() => <WhiteSpace />}
					renderRow={(rowData) => <Item onClick={()=> {
						debugger;
						router.push({
							pathname: '/chat',
							query: {
								targetId: rowData.value
							}
						})
					}}>{rowData}</Item>}
					quickSearchBarStyle={{
						top: 85
					}}
					delayTime={10}
					delayActivityIndicator={<div style={{ padding: 25, textAlign: 'center' }}>rendering...</div>}
				/>
			</div>
		);
	}
}

export default Index;
