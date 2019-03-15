'use strict';

const Controller = require('egg').Controller;
const qiniu = require('qiniu');
const fs = require('fs')

class WebtaroController extends Controller {

  async getWechatMes() {
    const ctx = this.ctx;
    console.log(ctx.request.body);
    fs.writeFileSync('chatMes.txt', ctx.request.body)
    ctx.body = 'ok'
  }

  // 主页面获取商品列表
  async getGoods() {
    const ctx = this.ctx;
    const index = '' + ctx.request.body.index;
    // 取到链接传输过来的盒子之后连接到数据库
    const Goods = ctx.model.Goods;
    const getGoods = await Goods.find({ classifyValue: index }); // 这个数据库查找可能会出现bug

    ctx.body = getGoods;
  }

  // 商品详情页面获取详情
  async getGoodDetails() {
    const ctx = this.ctx;
    const goodId = ctx.request.body.goodId;
    const GoodsDetails = ctx.model.GoodsDetails;
    // 根据传输过来的 goodId 查找商品详情！
    const goodsDetails = await GoodsDetails.find({ goodsId: goodId });

    ctx.body = goodsDetails;
  }

  // 登录接口，从微信服务器获取
  async onLogin() {
    const ctx = this.ctx;
    const code = ctx.request.body.code;
    const userInfo = ctx.request.body.userInfo;
    console.log(code);
    console.log(userInfo);
    const appid = 'wx96491a51058b7949'
    const secret = '149a7463a8e9e13f0b53758490af496a'

    const result = await ctx.curl('https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + code + '&grant_type=authorization_code', {
      dataType: 'json',
      timeout: 3000
    })
    const openid = result.data.openid;
    userInfo.openId = openid;

    // 连接 User 数据库
    const User = ctx.model.User;

    const user = new User({
      nickName: userInfo.nickName,
      gender: userInfo.gender,
      language: userInfo.language,
      city: userInfo.city,
      province: userInfo.province,
      country: userInfo.country,
      avatarUrl: userInfo.avatarUrl,
      openId: userInfo.openId,
      cart: userInfo.cart,
      address: userInfo.address,
      orderList: userInfo.orderList
    })

    await user.save();

    ctx.body = openid;
  }

  // 购买操作 - 待开发，无接口
  async sellHandle() {
    const ctx = this.ctx;
    const sellNum = ctx.request.body.sellNum;
    const goodDetails = ctx.request.body.goodDetails;

    ctx.body = 'ok';
  }

  // 加入购物车操作
  async shoppingCart() {
    const ctx = this.ctx;
    const goodDetail = ctx.request.body.goodDetail;
    const openId = ctx.request.body.openId;
    const shoppingNum = ctx.request.body.shoppingNum;
    let goodStatus = false;
    goodDetail.shoppingNum = shoppingNum;
    goodDetail.Itemstatus = 1;
    goodDetail.goodcheckStatus = true;

    const User = ctx.model.User;

    let userInfo = await User.findOne({ openId: openId });
    let cartInfo = userInfo.cart;
    for (let i = 0; i < cartInfo.length; i++) {
      if (cartInfo[i].goodsId === goodDetail.goodsId) {
        goodStatus = true;
        break;
      }
    }

    if (goodStatus) {
      ctx.body = 100;
    } else {
      await User.updateOne({ openId: openId }, { $push: { cart: goodDetail } });
      ctx.body = 200;
    }

  }

  // 购物车删除商品
  async deleteUserCart() {
    const ctx = this.ctx;
    const openId = ctx.request.body.openId;
    const goodsId = ctx.request.body.goodsId;

    const User = ctx.model.User;

    await User.updateOne({ openId: openId }, { $pull: { cart: { goodsId: goodsId } } });

    let userInfo = await User.findOne({ openId: openId });
    let cart = userInfo.cart;

    ctx.body = cart
  }

  // 购物车编辑商品
  async editUserCart() {
    const ctx = this.ctx;
    const openId = ctx.request.body.openId;
    const goodsId = ctx.request.body.goodsId;
    const kindof = ctx.request.body.kindof;

    const User = ctx.model.User;

    if (kindof === 'add') {
      await User.updateOne({ openId: openId, 'cart.goodsId': goodsId }, { $inc: { 'cart.$.shoppingNum': 1 } });
    } else {
      await User.updateOne({ openId: openId, 'cart.goodsId': goodsId }, { $inc: { 'cart.$.shoppingNum': -1 } });
    }

    ctx.body = 'ok';
  }

  // 获取用户个人信息
  async getUserInfo() {
    const ctx = this.ctx;
    const openId = ctx.request.query.openId;

    const User = ctx.model.User;
    let userInfo = await User.findOne({ openId: openId });

    ctx.body = userInfo;
  }
}

module.exports = WebtaroController;
