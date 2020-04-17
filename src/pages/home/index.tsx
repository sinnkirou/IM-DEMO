import { connect } from 'dva';
import React, { useEffect } from 'react';
import { Toast } from 'antd-mobile';
import { Redirect } from 'umi';

const Index = (props: IConnectProps) => {
  useEffect(()=> {
    props.dispatch({
			type: 'app/getUserInfo',
		  })
			.catch(Toast.fail);
  }, []) 

  return <Redirect to="/home/setting" />
};


export default connect()(Index);