import BScroll from 'better-scroll';
import React, { PureComponent, } from 'react';

class Index extends PureComponent<{
  children: any,
  wrapId: string,
  wrapClass?: string,
  wrapStyle?: any,
  getRef?: (ref: any)=> void;
  [propName: string]: any;
}> {
  public myRef: any;
  public scroll: any;

  public componentDidMount() {
    const { wrapId, getRef } = this.props;
    if (getRef) {
      getRef(this.myRef);
    }
    this.scroll = new BScroll(document.getElementById(wrapId), {
      click: true,
      scrollY: true,
      mouseWheel: true,
    });
  }

  public render() {
    const { children, wrapId, wrapClass, wrapStyle } = this.props;
    return (
      <div
        style={{ overflow: 'hidden', height: 'inherit', flex: '1', ...wrapStyle }}
        id={wrapId}
        className={wrapClass}
        ref={ref => {
          this.myRef = ref;
        }}
      >
        <div className="wrap">{children}</div>
      </div>
    );
  }
}

export default Index;
