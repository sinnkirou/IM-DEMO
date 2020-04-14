import { connect } from 'dva';
import React, { PureComponent } from 'react';

@connect()
class Index extends PureComponent<{
  [propName: string]: any;
}> {


  public render() {
    return <div>Chat</div>;
  }
}

export default Index;
