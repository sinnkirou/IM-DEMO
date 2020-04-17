import { Button, InputItem, List, Toast, WhiteSpace, WingBlank } from 'antd-mobile';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import React, { PureComponent } from 'react';
import router from 'umi/router';

@connect()
class Index extends PureComponent<{
  [propName: string]: any;
}> {

  public signIn = () => {
    const { form } = this.props;
    form.validateFields((error, value) => {
      if (!error) {
        Toast.loading('loading...', 25);
        const { dispatch } = this.props;
        const { email, password } = value;
        dispatch({
          type: 'app/signIn',
          payload: {
            email,
            password,
          },
        })
          .then(() => {
            dispatch({
              type: 'im/signin',
              payload: {
                callBack: (code)=>{
                  if(code.toString() === '0'){
                    Toast.hide();
                    dispatch({
                      type: 'im/LOGIN_ONCE',
                    });
                    router.push('/home');
                  }else {
                    Toast.hide();
                    Toast.fail('login failed, please try again.');
                  }
                }
              }
            });
          })
          .catch(Toast.fail);
      }
    });
  };

  public renderTitle = () => (
    <div key="title">
      <WhiteSpace size='xl' />
      <WingBlank size="lg">
        <span style={{ display: ' block', textAlign: 'center' }}>SRT IM DEMO</span>
      </WingBlank>
      <WhiteSpace size='xl' />
    </div>
  );

  public handleOnErrorClick = (filedName: string) => {
    const { form } = this.props;
    const { getFieldError } = form;
    Toast.hide();
    Toast.fail(getFieldError(filedName), 3, () => { }, false);
  };

  public renderForm = () => {
    const { form } = this.props;
    const { getFieldProps, getFieldError } = form;
    return (
      <div key="form">
        <WhiteSpace size="lg" />
        <List>
          <InputItem
            clear={true}
            {...getFieldProps('email', {
              rules: [
                { required: true, message: 'The email is required' },
                { type: 'email', message: 'The email is incorrect' },
              ],
              validateTrigger: ['onBlur'],
            })}
            error={getFieldError('email')}
            onErrorClick={() => this.handleOnErrorClick('email')}
          >
            <span className={getFieldError('email') ? 'error' : ''}>Email</span>
          </InputItem>
          <InputItem
            type="password"
            clear={true}
            {...getFieldProps('password', {
              rules: [{ required: true, message: 'The password is required' }],
              validateTrigger: ['onBlur'],
            })}
            error={getFieldError('password')}
            onErrorClick={() => this.handleOnErrorClick('password')}
          >
            <span className={getFieldError('password') ? 'error' : ''}>Password</span>
          </InputItem>
        </List>
        <WhiteSpace size="xl" />
        <WingBlank size="lg">
          <Button type="primary" onClick={this.signIn}>
            Sign In
          </Button>
        </WingBlank>
        <WhiteSpace size="xl" />
        <WingBlank size="lg">
          <Button
            onClick={() => {
              router.push('/account/register');
            }}
          >
            Register
          </Button>
        </WingBlank>
        <WhiteSpace size="xl" />
      </div>
    );
  };

  public render() {
    return [this.renderTitle(), this.renderForm()];
  }
}

const Wrapper = createForm()(Index);

export default Wrapper;
