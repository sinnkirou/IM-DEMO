import vwAndroid from 'umi-hd/lib/vw-no-android-hd';

// Fix document undefined when ssr. #2571
(()=> {
  if (typeof document !== 'undefined') {
    vwAndroid(100, 750);
    // hd solution for antd-mobile@2
    // ref: https://mobile.ant.design/docs/react/upgrade-notes-cn#%E9%AB%98%E6%B8%85%E6%96%B9%E6%A1%88
    document.documentElement.setAttribute('data-scale', 'true');
  }
})();

export const px2hd = (px: number = 20) => {
  const ONE_REM = parseInt(document.documentElement.style.fontSize, 10) || 100;
  const SCALE = ONE_REM / 100;
  return Number((px * SCALE).toFixed(1)); 
}