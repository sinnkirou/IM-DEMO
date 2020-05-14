import ContactList from '@/components/ContactList';
import { IAppState } from '@/models/app';
import { connect } from 'dva';
import React from 'react';

interface IProps extends IConnectProps {
  app: IAppState;
}

@connect(({ app }) => ({ app }))
class Index extends React.Component<IProps> {
  public render() {
    const {
      app: { contacts },
    } = this.props;
    return <ContactList contacts={contacts} />;
  }
}

export default Index;
