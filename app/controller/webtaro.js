'use strict';

const Controller = require('egg').Controller;
const qiniu = require('qiniu');

class WebtaroController extends Controller {

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
            orderLists: userInfo.orderLists
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
        let orderListsInfo = userInfo.orderLists;
        // orderListsInfo.forEach(element => {
        //   if (element.goodsId === goodDetail.goodsId) {
        //     goodStatus = true;
        //     break;
        //   }
        // });
        for (let i = 0; i < orderListsInfo.length; i++) {
            if (orderListsInfo[i].goodsId === goodDetail.goodsId) {
                goodStatus = true;
                break;
            }
        }

        if (goodStatus) {
            ctx.body = 100;
        } else {
            await User.updateOne({ openId: openId }, { $push: { orderLists: goodDetail } });
            ctx.body = 200;
        }

    }

    async getorderLists() {
        const ctx = this.ctx;
        const openId = ctx.request.body.openId;

        const User = ctx.model.User;
        let userInfo =await User.findOne({openId: openId});
        let orderLists = userInfo.orderLists;

        ctx.body = orderLists
    }
}

module.exports = WebtaroController;
