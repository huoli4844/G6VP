import { utils } from '@antv/gi-sdk';

const { getSiteContext } = utils;
// GI 默认使用离线数据模式的站点
const GI_DEPOLY_OFFLINE_SITE = [
  'graphinsight.antv.vision',
  'graphinsight.antgroup.com',
  'localhost',
  '127.0.0.1',
  'gi-external-pre.alipay.com',
  'antv-insight-pre.alipay.com',
  'insight.antv.antgroup.com',
];

// 内网部署站点
const GI_DEPOLY_INC_SITE = [
  'antv-insight-pre.alipay.com',
  'insight.antv.antgroup.com',
  // 本地联调 host 配置
  // 'local.dev.alipay.com'
];

/** 是否是开发环境 */
//@ts-ignore
export const IS_DEV_ENV = process.env.NODE_ENV === 'development';

const INC_SERVICE_URL = 'https://rplus.alipay.com/api/function/gi';

export const GI_SITE = {
  get IS_OFFLINE() {
    const GI_SITE_ENV = localStorage.getItem('GI_SITE_ENV');
    if (!GI_SITE_ENV) {
      return GI_DEPOLY_OFFLINE_SITE.includes(window.location.hostname); //初始化的时候，根据部署白名单
    }
    return GI_SITE_ENV === 'ONLINE' ? false : true;
  },
  get IS_INC_SITE() {
    return GI_DEPOLY_INC_SITE.includes(window.location.hostname);
  },
  get SERVICE_URL() {
    console.log(window.location)
    const { hostname, protocol } = window.location;
    const { GI_SITE_ID = 'DEFAULT' } = getSiteContext();
    const port = 7001;
    let online = `${protocol}//${hostname}:${port}`;
    if (GI_SITE_ID === 'DEFAULT' && GI_SITE.IS_INC_SITE) {
      online = INC_SERVICE_URL;
    } else if (!IS_DEV_ENV){
      online = window.location.origin + window.location.pathname;
      if (online.endsWith('/')) {
        online = online.slice(0, -1);
      }
    }

    return GI_SITE.IS_OFFLINE
      ? INC_SERVICE_URL
      : online;
  },
};

export const GI_QR_URL =
  'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*AC9gR462u1wAAAAAAAAAAAAADmJ7AQ/original';
export const G6VP_QR_URL =
  'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*H5-ERLOWTqIAAAAAAAAAAAAADmJ7AQ/original';
export const QR_URL = GI_SITE.IS_OFFLINE ? G6VP_QR_URL : GI_QR_URL;
