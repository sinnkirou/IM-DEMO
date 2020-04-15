import React from 'react';

interface IProps {
  type: string,
  className?: string,
  [propName: string]: any;
}

const Index = (props: IProps) => {
  const { type, className, ...rest } = props;
  return <i className={`iconfont icon-${type} ${className || ''}`} {...rest} />;
};
export default Index;
