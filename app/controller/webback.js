'use strict';

const Controller = require('egg').Controller;
const qiniu = require('qiniu');

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
    // const sliderView = goodsList.sliderView;
    const goodsId = new Date().getTime();
    // 连接到 Goods 数据库
    const Goods = ctx.model.Goods;
    // // 连接到 Slider 数据库
    // const Slider = ctx.model.Slider;
    // // 建立 slider 表 并存储
    // const slider = new Slider({
    //   name: goodsList.name,
    //   subTitle: goodsList.subTitle,
    //   price: goodsList.price,
    //   oldPrice: goodsList.oldPrice,
    //   classifyValue: goodsList.classifyValue,
    //   sliderUrl: goodsList.sliderUrl,
    //   titleUrl: goodsList.titleUrl,
    //   goodsId: goodsId,
    //   sell: true
    // })
    // 建立 goods 表 并存入
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
    // 判断保存的数据是否是轮播图
    // if (sliderView) {
    //   await slider.save();
    // } else {
    //   await goods.save();
    // }
    // 连接到 GoodsDetails 数据库
    const GoodsDetails = ctx.model.GoodsDetails;
    // 建立 GoodsDetails 表 并存入
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

  async gettableGoods() {
    const ctx = this.ctx;
    // 连接数据库表
    const GoodsDetails = ctx.model.GoodsDetails;
    const tableGoods = await GoodsDetails.find();
    ctx.body = tableGoods;
  }

  async deleteGood() {
    const ctx = this.ctx;
    const goodsId = ctx.request.body.goodsId;
    const sliderView = ctx.request.body.sliderView;
    // 连接各个数据库
    const GoodsDetails = ctx.model.GoodsDetails;
    const Goods = ctx.model.Goods;
    const Slider = ctx.model.Slider;
    await GoodsDetails.remove({ goodsId: goodsId }).exec();
    if (sliderView) {
      await Slider.remove({ goodsId: goodsId }, (err) => {
        if (!err) {
          console.log('轮播删除成功！');
        }
      })
    } else {
      await Goods.remove({ goodsId: goodsId }, (err) => {
        if (!err) {
          console.log('商品删除成功！')
        }
      })
    }
    ctx.body = 'ok'
  }

  // 订单管理获取订单
  async getOrder() {
    const ctx = this.ctx;
    const Order = ctx.model.Order;
    const getOrder = await Order.find();
    ctx.body = getOrder;
  }

  // 订单发货
  async ship() {
    const ctx = this.ctx;
    const out_trade_no = ctx.request.body.out_trade_no;

    const Order = ctx.model.Order;
    await Order.updateOne({ out_trade_no: out_trade_no }, { status: '待收货' });

    ctx.body = '发货成功';
  }

  // 删除订单
  async deleteOrders() {
    const ctx = this.ctx;
    const out_trade_no = ctx.request.body.out_trade_no;

    const Order = ctx.model.Order;
    await Order.remove({ out_trade_no: out_trade_no });

    ctx.body = '删除订单成功';
  }

}

module.exports = WebbackController;
