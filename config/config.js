// https://umijs.org/config/
import path from 'path';
import theme from '../src/theme';

export default {
  // add for transfer to umi
  plugins: [
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: true,
        dynamicImport: {
          loadingComponent: './components/PageLoading/index',
          webpackChunkName: true,
        },
        title: {
          defaultTitle: 'SRT IM DEMO',
        },
        dll: false,
        pwa: {
          workboxPluginMode: 'InjectManifest',
          workboxOptions: {
            importWorkboxFrom: 'local',
          },
        },
        hd: {
          px2rem: {
            rootValue: 100,
            minPixelValue: 2,
          },
        },
        routes: {
          exclude: [],
        },
        hardSource: false,
      },
    ],
  ],
  //   exportStatic: {},
  // 路由配置
  // routes: pageRoutes,
  // Theme for antd-mobile
  // https://github.com/ant-design/ant-design-mobile/blob/master/components/style/themes/default.less
  theme: {
    'brand-primary': theme.primaryColor,
    'brand-second': theme.secondColor,
    'font-size-base': theme.baseFontSize,
  },
  //   ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  cssnano: {
    mergeRules: false,
  },
  targets: {
    android: 5,
    ios: 7,
    chrome: 58,
    ie: 9,
  },
  outputPath: './deploy/dist',
  hash: true,
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
  context: {
    IM_URL: 'http://192.168.198.212:6888',
    BASE_URL: 'http://192.168.198.212:6889',
    WS_URL: 'ws://192.168.198.212:7901/ws',
    UPLOAD: {
      maxLen: 5,
      maxSize: 40 * 1024 * 1024,
    },
  },
};
