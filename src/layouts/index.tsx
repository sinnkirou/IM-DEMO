import '@/utils/hd';
import React, { useMemo } from 'react';
import BasicLayout from './BasicLayout';

const Layout = props => {
  const { location } = props;

  const LayoutComponent = useMemo(
    () => {
      const blankPathnames = [];

      if (blankPathnames.some(pathname => location.pathname.includes(pathname))) {
        return props.children;
      }
      return <BasicLayout {...props} />;
    },
    [location.pathname]
  );

  return LayoutComponent;
};

export default Layout;
