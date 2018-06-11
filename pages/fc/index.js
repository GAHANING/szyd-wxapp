const {
  ecardApi, zqApi, fcApi, uirApi, weixinApi, appId, Roles,
} = require('../../utils/utils.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  goToHost: function (event) {

    wx.navigateTo({
      url: `./host/host?host=${event.currentTarget.dataset.host}`,
    });
  },

  goToVm: function (event) {
    console.log(event.currentTarget.dataset.vm.name);
    wx.navigateTo({
      url: `./vm/vm?colony=${event.currentTarget.dataset.vm.name}`,
    });
  },

  onLoad: function () {
    var vm = [];
    var that = this;
    var host = [];
    Promise.all([fcApi.setlist()]).then(vm=>{
      console.log(vm[0]);
      that.setData({
        datas:vm[0]
      })
    });
  },
});