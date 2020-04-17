/*
 * @Author: Jan-superman 
 * @Date: 2018-09-27 20:38:14 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-04-17 11:39:56
 */

import MenuBar, { tabBarData } from '@/components/MenuBar';
import '@/layouts/nprogress.less';
import { IMState } from '@/models/im';
import { Toast } from 'antd-mobile';
import { connect } from 'dva';
import NProgress from 'nprogress';
import React, { PureComponent } from 'react';
import withRouter from 'umi/withRouter';

NProgress.configure({ showSpinner: false });

// 底部有bar菜单
let currHref = '';

interface IProps extends IConnectProps {
  im: IMState
}
class BasicLayout extends PureComponent<IProps> {
  public render() {
    const { children, location, loading, im: {
      loginStatus,
      linkStatus
    } } = this.props;
    const { href } = window.location; // 浏览器地址栏中地址
    if (currHref !== href) {
      // currHref 和 href 不一致时说明进行了页面跳转
      NProgress.start(); // 页面开始加载时调用 start 方法
      if (!loading.global) {
        // loading.global 为 false 时表示加载完毕
        NProgress.done(); // 页面请求完毕时调用 done 方法
        currHref = href; // 将新页面的 href 值赋值给 currHref
      }
    }

    if(linkStatus === false) {
      Toast.offline('Network connection failed.', 10, null, false);
    }
    if(loginStatus === false) {
      Toast.fail('Log in failed.', 10, null, false);
    }
    
    const BarRoutes = tabBarData.map(i => i.link);
    if (BarRoutes.indexOf(location.pathname) < 0) {
      return <>{children}</>;
    }

    return <MenuBar pathname={location.pathname}>{children}</MenuBar>;
  }
}

export default withRouter(connect(({ im, loading }) => ({ im, loading }))(BasicLayout));
