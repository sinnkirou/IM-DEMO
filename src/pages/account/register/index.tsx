import ScrollWrap from '@/components/ScrollWrap';
import { EMAIL_REGEX, PASSWROD_REGEX } from '@/utils/constants';
import { Button, Icon, InputItem, List, NavBar, Toast, WhiteSpace, WingBlank } from 'antd-mobile';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import React, { Component } from 'react';
import router from 'umi/router';

interface IState {
  confirmDirty: boolean;
}

@connect()
class Index extends Component<{
  [propName: string]: any;
}> {
  public state: IState = {
    confirmDirty: false,
  };
  public signup = () => {
    const { form } = this.props;
    form.validateFields((error, values) => {
      if (!error) {
        Toast.loading('loading...', 25);
        const { dispatch } = this.props;
        const { email, password, nickName } = values;
        dispatch({
          type: 'app/register',
          payload: { email, password, nickName },
        })
          .then(() => {
            Toast.hide();
            Toast.info('Registered successfully');
            router.push({
              pathname: '/account',
            });
          })
          .catch(Toast.fail);
      }
    });
  };

  public renderTitle = () => (
    <NavBar
      mode="light"
      icon={<Icon type="left" className="titleIcon" />}
      onLeftClick={router.goBack}
      key="title"
    >
      Registration
    </NavBar>
  );

  public validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    const { confirmDirty } = this.state;
    if (value && confirmDirty) {
      form.validateFields(['passwordAgain'], { force: true });
    }
    callback();
  };

  public compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback("The two passwords don't match");
    } else {
      callback();
    }
  };

  public renderButton = () => (
    <div key="button">
      <WingBlank size="lg">
        <Button type="primary" className="inlineButton" onClick={this.signup}>
          Sign Up
        </Button>
      </WingBlank>
    </div>
  );

  public handleOnErrorClick = (filedName: string) => {
    const { form } = this.props;
    const { getFieldError } = form;
    Toast.hide();
    Toast.fail(getFieldError(filedName), 3, null, false);
  };

  public renderForm = () => {
    const { form } = this.props;
    const { getFieldProps, getFieldError } = form;
    return (
      <ScrollWrap key="form" wrapId="scrollList">
        <WhiteSpace size="xl" />
        <List>
          <InputItem
            {...getFieldProps('email', {
              rules: [
                { required: true, message: 'Email is required' },
                // { type: 'email', message: 'Email is incorrect' },
                { pattern: EMAIL_REGEX, message: 'Email is incorrect' },
              ],
              validateTrigger: ['onBlur'],
            })}
            clear={true}
            error={getFieldError('email')}
            onErrorClick={() => this.handleOnErrorClick('email')}
          >
            <span className={getFieldError('email') ? 'error' : ''}>Email</span>
          </InputItem>
          <InputItem
            {...getFieldProps('nickName', {
              rules: [{ required: true, message: 'Nickname is required' }],
              validateTrigger: ['onBlur'],
            })}
            clear={true}
            error={getFieldError('nickName')}
            onErrorClick={() => this.handleOnErrorClick('nickName')}
          >
            <span className={getFieldError('nickName') ? 'error' : ''}>Nickname</span>
          </InputItem>
          <InputItem
            type="password"
            {...getFieldProps('password', {
              rules: [
                { required: true, message: 'Password is required' },
                // {
                //   pattern: PASSWROD_REGEX,
                //   message: 'Please include letters, numbers, and characters',
                // },
                {
                  validator: this.validateToNextPassword,
                },
              ],
              validateTrigger: ['onBlur'],
            })}
            clear={true}
            error={getFieldError('password')}
            onErrorClick={() => this.handleOnErrorClick('password')}
            labelNumber={10}
          >
            <span className={getFieldError('password') ? 'error' : ''}>Password</span>
          </InputItem>
          <InputItem
            type="password"
            {...getFieldProps('passwordAgain', {
              rules: [
                { required: true, message: 'Please enter the password again' },
                {
                  validator: this.compareToFirstPassword,
                },
              ],
              validateTrigger: ['onBlur'],
            })}
            clear={true}
            error={getFieldError('passwordAgain')}
            onErrorClick={() => this.handleOnErrorClick('passwordAgain')}
            labelNumber={10}
          >
            <span className={getFieldError('passwordAgain') ? 'error' : ''}>Confirm Password</span>
          </InputItem>
        </List>

        <WhiteSpace size="xl" />
        {this.renderButton()}
      </ScrollWrap>
    );
  };

  public render() {
    return [this.renderTitle(), this.renderForm()];
  }
}

const Wrapper = createForm()(Index);
export default Wrapper;
