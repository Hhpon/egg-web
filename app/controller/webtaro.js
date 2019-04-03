'use strict';

const Controller = require('egg').Controller;
const qiniu = require('qiniu');
const md5 = require('../service/md5');

class WebtaroController extends Controller {

  // 微信接口统一下单API收取微信回调支付结果通知
  async getWechatMes() {
    const ctx = this.ctx;
    console.log(ctx.request.body);
    if (ctx.request.body !== null) {
      const result = '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>'
      ctx.body = result;
    } else {
      ctx.body = 'fail';
    }
  }

  // 统一下单API
  async toRePay() {
    const ctx = this.ctx;
    const openid = ctx.request.body.openId;
    const appid = ctx.request.body.appId;
    const mch_id = ctx.request.body.mch_id;
    const nonce_str = Math.random().toString(36).substr(2, 15);
    const body = ctx.request.body.body;
    const out_trade_no = ctx.request.body.out_trade_no;
    const total_fee = ctx.request.body.total_fee;
    const spbill_create_ip = ctx.request.body.spbill_create_ip;
    const notify_url = ctx.request.body.notify_url;
    const trade_type = ctx.request.body.trade_type;

    // 处理前端传来的数据，生成签名sign
    const signString = `appid=${appid}&body=${body}&mch_id=${mch_id}&nonce_str=${nonce_str}&notify_url=${notify_url}&openid=${openid}&out_trade_no=${out_trade_no}&spbill_create_ip=${spbill_create_ip}&total_fee=${total_fee}&trade_type=${trade_type}&key=sxpyangpeng2018sxpyangpeng201818`
    const sign = md5.md5(signString).toUpperCase();

    const rePayMes = {
      openid: openid,                                 //用户openid
      appid: appid,                                   //小程序appid
      mch_id: mch_id,                                 //商户号
      nonce_str: nonce_str,                           //随机字符串
      sign: sign,                                     //签名
      body: body,                                     //商品描述
      out_trade_no: out_trade_no,                     //商户订单号
      total_fee: total_fee,                           //标价金额
      spbill_create_ip: spbill_create_ip,             //终端IP
      notify_url: notify_url,                         //通知地址（外网可访问）
      trade_type: trade_type                          //交易类型（小程序填'JSAPI'）
    }

    // 将json转换成xml格式才能传到微信后台
    function json2xml(obj) {
      return _json2xml('xml', obj).replace('<xml>', '<xml>');

      function _json2xml(key, obj) {
        var xml = '';
        if (Array.isArray(obj)) {
          for (var i = 0; i < obj.length; ++i) {
            xml += _json2xml(key, obj[i]);
          }
          return xml;
        } else if (typeof obj === 'object') {
          for (var _key in obj) {
            xml += _json2xml(_key, obj[_key]);
          }
          return _concat(key, xml);
        } else {
          return _concat(key, obj);
        }
      }

      function _concat(key, item) {
        return '<' + key + '>' + item + '</' + key + '>';
      }
    }

    const xmlAsStr = json2xml(rePayMes);

    // 将数据传递到微信后台获取prepay_id
    const rePay = await ctx.curl('https://api.mch.weixin.qq.com/pay/unifiedorder', {
      method: 'POST',
      content: xmlAsStr.toString(),
      headers: {
        'content-type': 'text/html',
      },
    });

    ctx.body = rePay.data;
  }

  // 再次签名
  async signAgain() {
    const ctx = this.ctx;
    const prepay_id = ctx.request.body.prepay_id;
    const appid = ctx.request.body.appId;
    const timeStamp = ctx.request.body.timeStamp;
    const nonceStr = Math.random().toString(36).substr(2, 15);
    const signType = ctx.request.body.signType;

    // 再次签名(第一次签名是appid，第二次是appId，注意大小写)
    const signAgain = `appId=${appid}&nonceStr=${nonceStr}&package=prepay_id=${prepay_id}&signType=${signType}&timeStamp=${timeStamp}&key=sxpyangpeng2018sxpyangpeng201818`
    const paySign = md5.md5(signAgain).toUpperCase();

    const payData = {
      nonceStr: nonceStr,
      paySign: paySign,
      prepay_id: prepay_id,
      timeStamp: timeStamp
    }

    ctx.body = payData;
  }

  // 查询订单
  async checkOrder() {
    const ctx = this.ctx;
    const appid = ctx.request.body.appid;
    const mch_id = ctx.request.body.mch_id;
    const out_trade_no = ctx.request.body.out_trade_no;
    const nonce_str = Math.random().toString(36).substr(2, 15);

    const checkSign = `appid=${appid}&mch_id=${mch_id}&nonce_str=${nonce_str}&out_trade_no=${out_trade_no}&key=sxpyangpeng2018sxpyangpeng201818`
    const sign = md5.md5(checkSign).toUpperCase();

    const check = {
      appid: appid,
      mch_id: mch_id,
      out_trade_no: out_trade_no,
      nonce_str: nonce_str,
      sign: sign
    }

    // 将json转换成xml格式才能传到微信后台
    function json2xml(obj) {
      return _json2xml('xml', obj).replace('<xml>', '<xml>');

      function _json2xml(key, obj) {
        var xml = '';
        if (Array.isArray(obj)) {
          for (var i = 0; i < obj.length; ++i) {
            xml += _json2xml(key, obj[i]);
          }
          return xml;
        } else if (typeof obj === 'object') {
          for (var _key in obj) {
            xml += _json2xml(_key, obj[_key]);
          }
          return _concat(key, xml);
        } else {
          return _concat(key, obj);
        }
      }

      function _concat(key, item) {
        return '<' + key + '>' + item + '</' + key + '>';
      }
    }

    const xmlAsStr = json2xml(check);
    console.log(check);

    const checked = await ctx.curl('https://api.mch.weixin.qq.com/pay/orderquery', {
      method: 'POST',
      content: xmlAsStr.toString(),
      headers: {
        'content-type': 'text/html',
      },
    });
    ctx.body = checked.data;
  }


  // 添加订单
  async addOrder() {
    const ctx = this.ctx;
    const openId = ctx.request.body.openId;
    const address = ctx.request.body.address;
    const payGoods = ctx.request.body.payGoods;
    const out_trade_no = ctx.request.body.out_trade_no;
    const total_fee = ctx.request.body.total_fee;
    const status = ctx.request.body.status;

    const Order = ctx.model.Order;
    const order = new Order({
      openId: openId,
      address: address,
      payGoods: payGoods,
      out_trade_no: out_trade_no,
      total_fee: total_fee,
      status: status
    })

    await order.save();
    ctx.body = '生成订单成功！'
  }

  // 获取订单详情
  async getOrderDetail() {
    const ctx = this.ctx;
    const out_trade_no = ctx.request.body.out_trade_no;

    const Order = ctx.model.Order;
    const getOrderDetail = await Order.find({ out_trade_no: out_trade_no });

    ctx.body = getOrderDetail;
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
    const appid = 'wx083cd7624c4db2ec'
    const secret = 'cbd202762394dde17eacd80fbc71ebda'

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
      cart: userInfo.cart
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
