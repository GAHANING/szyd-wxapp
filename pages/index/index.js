
const {
  ecardApi, zqApi, fcApi, uirApi, weixinApi, appId, Roles,
} = require('../../utils/utils.js');

Page({
  data: {
    isUirManager: false,
    loadingOpenId: true,

    bills: [],
    zq: {
      firmCount: '-',
      newsCount: '-',
    },
    fc: {
      vmCount: '-',
      clusterCount: '-',
      hostCount: '-',
    },
    ecard: {
      shops: [],
      devices: [],
    },
    isFcSupervisor: false,
    isEcardSupervisor: false,
  },

  initPage() {
    wx.showLoading({
      title: '正在加载',
      mask: true,
    });


    // 获取各个系统的数据
    // 为确保所有promise都能resolve，必须添加catch
    Promise.all([
      ecardApi.dailyBills(1).catch(() => []),
      ecardApi.shops().catch(() => []),
      zqApi.firmCount().catch(() => 0),
      zqApi.newsCount().catch(() => 0),
      fcApi.vmCount().catch(() => 0),
      fcApi.clusters().catch(() => 0),
      fcApi.hostCount().catch(() => 0),
      weixinApi.getOpenId().catch(() => ''),
    ]).then(([
      bills,
      shops,
      firmCount,
      newsCount,
      vmCount,
      clusters,
      hostCount,
    ]) => {
      wx.hideLoading();

      // 按日期降序排列
      bills.sort((a, b) => {
        if (a.accDate > b.accDate) return -1;
        else if (a.accDate < b.accDate) return 1;
        return 0;
      });

      this.setData({
        bills,
        zq: {
          firmCount,
          newsCount,
        },
        fc: {
          vmCount,
          clusterCount: clusters.length,
          hostCount,
        },
        ecard: {
          shops,
        },
      });
    }).catch((error) => {
      wx.hideLoading();
    });

    // 获取用户OpenId及权限
    weixinApi.getOpenId().then(openId => {
      // 设置权限
      uirApi.getUser(appId, openId).then((uir) => {
        if (uir && uir.roles && uir.roles.length) {
          this.setData({
            isFcSupervisor: uir.roles.includes(Roles.FcSupervisor),
            isEcardSupervisor: uir.roles.includes(Roles.EcardSupervisor),
          });
        }
      });
    });
  },

  onLoad() {
    this.initPage();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  },

  onPullDownRefresh() {
    this.initPage();
    wx.stopPullDownRefresh();
  },

  toApply() {
    wx.showLoading({
      title: '正在加载',
      mask: true,
    });
    weixinApi.getOpenId().then((openid) => {
      wx.hideLoading();
      wx.navigateToMiniProgram({
        appId: 'wx63b32180ec6de471',
        path: `pages/index/apply?appName=数字云大&appId=${appId}&userId=${openid}&remark=申请权限`,
        extraData: {},
      });
    });
  },
});
