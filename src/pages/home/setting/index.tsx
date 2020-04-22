import BizIcon from '@/components/BizIcon';
import { IAppState } from '@/models/app';
import { Button, List, NavBar, WhiteSpace, WingBlank } from 'antd-mobile';
import { connect } from 'dva';
import React, { PureComponent } from 'react';
import Link from 'umi/link';
import router from 'umi/router';
import styles from './index.less';

interface IProps extends IConnectProps {
  app: IAppState
}

@connect(({ app }) => ({
  app,
}))
class Index extends PureComponent<IProps> {

  public renderTitle = () => (
    <NavBar mode="dark" key="title">
      SETTINGS
    </NavBar>
  );

  public renderUserInfo = () => {
    const { app: { user } } = this.props;
    return (
      <div key="userInfo">
        <List>
          <List.Item arrow="horizontal" className={styles.userBar}>
            <Link to="/setting/selfInfo">
              <span className={styles.userHead}>
                {/* {localInfo.head ? (
                  <img src={localInfo.head} alt="head" className={styles.userImg} />
                ) : ( */}
                  <BizIcon type="camera-fill" className={styles.userIcon} />
                {/* )} */}
              </span>
              <span className={styles.userInfo}>
                <h3 className={styles.nickname}>{user.nickname}</h3>
                <span className={styles.email}>{user.email}</span>
              </span>
            </Link>
          </List.Item>
        </List>
        <WhiteSpace size="lg" />
      </div>
    );
  };

  public renderMenuItems = () => {
    return (
      <div key="menuItems">
        <List>
          <List.Item arrow="horizontal" className={styles.listContent}>
            <Link to="/setting/reset">
              <span>
                <BizIcon type="lock-fill" className={styles.passwordIcon} />
              </span>
              <span>Reset Password</span>
              <span className={styles.count} />
            </Link>
          </List.Item>
        </List>
        <WhiteSpace size="lg" />
        <List>
          <List.Item arrow="horizontal" className={styles.listContent}>
            <Link to="/setting/about">
              <span>
                <BizIcon type="tags-fill" className={styles.aboutIcon} />
              </span>
              <span>About</span>
              <span className={styles.count} />
            </Link>
          </List.Item>
        </List>
        <WhiteSpace size="lg" />
      </div>
    );
  };

  public signOut = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'app/signout',
    }).then(() => {
      router.push('/account');
    });
  };

  public renderSignOutButton = () => (
    <WingBlank size="lg" className={styles.signOutBtn} key="signOutBtn">
      <Button type="primary" onClick={this.signOut}>
        Sign Out
      </Button>
    </WingBlank>
  );

  public render() {
    return [
      // this.renderTitle(),
      this.renderUserInfo(),
      this.renderMenuItems(),
      this.renderSignOutButton(),
    ];
  }
}

export default Index;
