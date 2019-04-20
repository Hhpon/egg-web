'use strict';

const Controller = require('egg').Controller;
const qiniu = require('qiniu');
const md5 = require('../service/md5');
const fs = require('fs');

class WebbackController extends Controller {

  async test() {
    const ctx = this.ctx;

    ctx.body = '该域名只能使用https访问哦！'
  }

  async gettoken() {
    const ctx = this.ctx;
    //设置上传的空间 bucket_name
    const options = {
      scope: 'mall',
    };
    //设置七牛密钥 最好时长更换！
    const accessKey = '9pWiqRBkqsixnO-5cEcg3_OIPqmo2c9mZqOm2J2l';
    const secretKey = 'hocHexD3aNDRipxIJvYSDA5O6Ubdi5JyLwy8tA4c';
    //鉴权对象 mac 
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    //根据设置的密钥及七牛node SDK 计算出Token!
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);

    ctx.body = uploadToken;
  }

  async uploadMes() {
    const ctx = this.ctx;
    const goodsList = ctx.request.body.goodsList;
    const goodsId = new Date().getTime();

    const Goods = ctx.model.Goods;

    const goods = new Goods({
      name: goodsList.name,
      subTitle: goodsList.subTitle,
      price: goodsList.price,
      oldPrice: goodsList.oldPrice,
      classifyValue: goodsList.classifyValue,
      sliderUrl: goodsList.sliderUrl,
      titleUrl: goodsList.titleUrl,
      goodsId: goodsId,
      sell: true,
      sliderView: goodsList.sliderView
    })
    await goods.save();

    const GoodsDetails = ctx.model.GoodsDetails;

    const goodsDetails = new GoodsDetails({
      name: goodsList.name,
      subTitle: goodsList.subTitle,
      price: goodsList.price,
      oldPrice: goodsList.oldPrice,
      amount: goodsList.amount,
      saleAmount: 0,
      classifyValue: goodsList.classifyValue,
      sliderView: goodsList.sliderView,
      titleUrl: goodsList.titleUrl,
      detailsUrl: goodsList.detailsUrl,
      goodsId: goodsId,
      sell: true
    })
    await goodsDetails.save();
    ctx.body = 'ok';
  }

  // 获取商品
  async gettableGoods() {
    const ctx = this.ctx;
    // 连接数据库表
    const GoodsDetails = ctx.model.GoodsDetails;
    const tableGoods = await GoodsDetails.find();
    ctx.body = tableGoods;
  }

  // 删除商品
  async deleteGood() {
    const ctx = this.ctx;
    const goodsId = ctx.request.body.goodsId;
    // 连接各个数据库
    const GoodsDetails = ctx.model.GoodsDetails;
    const Goods = ctx.model.Goods;
    await GoodsDetails.remove({ goodsId: goodsId });
    await Goods.remove({ goodsId: goodsId })
    ctx.body = '删除商品成功'
  }

  // 修改商品
  async updateGood() {
    const ctx = this.ctx;
    const goodList = ctx.request.body.goodList;
    const GoodsDetails = ctx.model.GoodsDetails;
    const Goods = ctx.model.Goods;

    await GoodsDetails.updateOne({ goodsId: goodList.goodsId }, {
      name: goodList.name,
      subTitle: goodList.subTitle,
      price: goodList.price,
      oldPrice: goodList.oldPrice,
      classifyValue: goodList.classifyValue
    });
    await Goods.updateOne({ goodsId: goodList.goodsId }, {
      name: goodList.name,
      subTitle: goodList.subTitle,
      price: goodList.price,
      oldPrice: goodList.oldPrice,
      classifyValue: goodList.classifyValue
    });
    ctx.body = "修改商品成功"
  }

  // 订单管理获取订单
  async getOrder() {
    const ctx = this.ctx;
    const Order = ctx.model.Order;
    const getOrder = await Order.find();
    ctx.body = getOrder;
  }

  // 修改订单状态
  async changeStatus() {
    const ctx = this.ctx;
    const out_trade_no = ctx.request.body.out_trade_no;
    const status = ctx.request.body.status;

    const Order = ctx.model.Order;
    await Order.updateOne({ out_trade_no: out_trade_no }, { status: status });

    ctx.body = 'ok';
  }

  // 删除订单
  async deleteOrders() {
    const ctx = this.ctx;
    const out_trade_no = ctx.request.body.out_trade_no;

    const Order = ctx.model.Order;
    await Order.remove({ out_trade_no: out_trade_no });

    ctx.body = '删除订单成功';
  }

  // 订单申请退款
  async refund() {
    const ctx = this.ctx;
    const appid = ctx.request.body.appid;
    const mch_id = ctx.request.body.mch_id;
    const out_trade_no = ctx.request.body.out_trade_no;
    const out_refund_no = ctx.request.body.out_refund_no;
    const total_fee = ctx.request.body.total_fee;
    const refund_fee = ctx.request.body.refund_fee;
    const nonce_str = Math.random().toString(36).substr(2, 15);

    const refundSign = `appid=${appid}&mch_id=${mch_id}&nonce_str=${nonce_str}&out_refund_no=${out_refund_no}&out_trade_no=${out_trade_no}&refund_fee=${refund_fee}&total_fee=${total_fee}&key=sxpyangpeng2018sxpyangpeng201818`
    const sign = md5.md5(refundSign).toUpperCase();

    const refund = {
      appid: appid,
      mch_id: mch_id,
      out_trade_no: out_trade_no,
      out_refund_no: out_refund_no,
      total_fee: total_fee,
      refund_fee: refund_fee,
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

    const xmlAsStr = json2xml(refund);
    console.log(refund);

    const refunded = await ctx.curl('https://api.mch.weixin.qq.com/secapi/pay/refund', {
      method: 'POST',
      content: xmlAsStr.toString(),
      cert: fs.readFileSync('./app/cert/apiclient_cert.pem'),
      key: fs.readFileSync('./app/cert/apiclient_key.pem'),
      headers: {
        'content-type': 'text/html',
      },
    });
    ctx.body = refunded.data;
  }


}

module.exports = WebbackController;
