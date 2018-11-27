'use strict';

const Controller = require('egg').Controller;
const qiniu = require('qiniu');

class WebtaroController extends Controller {

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

        const appid = 'wx96491a51058b7949'
        const secret = '23ce20c8b940ba1da3a1dfded659a0d6'

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
        let orderListsInfo = userInfo.orderLists;
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

    // 购物车页面获取商品路由
    async getorderLists() {
        const ctx = this.ctx;
        const openId = ctx.request.body.openId;

        const User = ctx.model.User;
        let userInfo = await User.findOne({ openId: openId });
        let orderLists = userInfo.orderLists;

        ctx.body = orderLists
    }

    // 购物车删除商品
    async deleteUserOrderList() {
        const ctx = this.ctx;
        const openId = ctx.request.body.openId;
        const goodsId = ctx.request.body.goodsId;

        const User = ctx.model.User;

        await User.updateOne({ openId: openId }, { $pull: { orderLists: { goodsId: goodsId } } });

        let userInfo = await User.findOne({ openId: openId });
        let orderLists = userInfo.orderLists;

        ctx.body = orderLists
    }

    // 购物车编辑商品
    async editUserOrderList() {
        const ctx = this.ctx;
        const openId = ctx.request.body.openId;
        const goodsId = ctx.request.body.goodsId;
        const kindof = ctx.request.body.kindof;

        const User = ctx.model.User;

        if (kindof === 'add') {
            await User.updateOne({ openId: openId, 'orderLists.goodsId': goodsId }, { $inc: { 'orderLists.$.shoppingNum': 1 } });
        } else {
            await User.updateOne({ openId: openId, 'orderLists.goodsId': goodsId }, { $inc: { 'orderLists.$.shoppingNum': -1 } });
        }

        ctx.body = 'ok';
    }

    // 获取用户个人信息
    async getUserinfo() {
        const ctx = this.ctx;
        const openId = ctx.request.query.openId;

        const User = ctx.model.User;
        let userInfo = await User.findOne({ openId: openId });

        ctx.body = userInfo;
    }
}

module.exports = WebtaroController;
