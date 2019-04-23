'use strict';

const Controller = require('egg').Controller;
const qiniu = require('qiniu');
const nodemailer = require('nodemailer');

class HomeController extends Controller {

  async sendemail() {
    const ctx = this.ctx;
    let info = ctx.request.body.info;
    console.log(info);
    let username = info.username;
    let tel = info.tel;
    let result = info.result.toString();
    let transporter = nodemailer.createTransport({
      service: 'QQ',
      port: 465,
      auth: {
        user: '3231308323@qq.com',
        pass: 'zeoxqbiaadwpcifa',
      }
    });

    let mailOptions = {
      from: '"金盛会计" <3231308323@qq.com>',
      to: '624791164@qq.com',
      subject: '有新的订单',
      text: `${username}+${tel}+${result}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return
      }
    });
    ctx.body = 1
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

  async getGoods() {
    const ctx = this.ctx;
    const index = '' + ctx.request.body.index;
    // 取到链接传输过来的盒子之后连接到数据库
    const Goods = ctx.model.Goods;
    const getGoods = await Goods.find({ classifyValue: index }); // 这个数据库查找可能会出现bug

    ctx.body = getGoods;
  }

  async getGoodDetails() {
    const ctx = this.ctx;
    const goodId = ctx.request.body.goodId;
    const GoodsDetails = ctx.model.GoodsDetails;
    // 根据传输过来的 goodId 查找商品详情！
    const goodsDetails = await GoodsDetails.find({ goodsId: goodId });

    ctx.body = goodsDetails;
  }

  async onLogin() {
    const ctx = this.ctx;
    const code = ctx.request.body.code;
    const userInfo = ctx.request.body.userInfo;

    const appid = 'wx96491a51058b7949'
    const secret = 'e4e625fab4186ea849059dbdaaf5bf6d'

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

  async sellHandle() {
    const ctx = this.ctx;
    const sellNum = ctx.request.body.sellNum;
    const goodDetails = ctx.request.body.goodDetails;

    ctx.body = 'ok';
  }

  async shoppingCart() {
    const ctx = this.ctx;
    const goodDetail = ctx.request.body.goodDetail;
    const openId = ctx.request.body.openId;
    let goodStatus = false;
    goodDetail.status = 1;

    const User = ctx.model.User;

    let userInfo = await User.findOne({ openId: openId });
    let cartInfo = userInfo.cart;
    // cartInfo.forEach(element => {
    //   if (element.goodsId === goodDetail.goodsId) {
    //     goodStatus = true;
    //     break;
    //   }
    // });
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
}

module.exports = HomeController;
