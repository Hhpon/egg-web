'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.webback.test);
  router.post('/getWechatMes', controller.webtaro.getWechatMes);
  router.post('/toRePay', controller.webtaro.toRePay);
  router.post('/signAgain', controller.webtaro.signAgain);
  router.post('/checkOrder', controller.webtaro.checkOrder);
  router.post('/closeOrder', controller.webtaro.closeOrder);
  router.post('/addOrder', controller.webtaro.addOrder);
  router.post('/getOrderDetail', controller.webtaro.getOrderDetail);
  router.post('/changeOrderStatus', controller.webtaro.changeOrderStatus);
  router.post('/deleteOrder', controller.webtaro.deleteOrder);
  router.post('/getOrders', controller.webtaro.getOrders);
  router.get('/gettoken', controller.webback.gettoken);
  router.post('/uploadMes', controller.webback.uploadMes);
  router.get('/gettableGoods', controller.webback.gettableGoods);
  router.post('/deleteGood', controller.webback.deleteGood);
  router.post('/getGoods', controller.webtaro.getGoods);
  router.post('/getGoodDetails', controller.webtaro.getGoodDetails);
  router.post('/onLogin', controller.webtaro.onLogin);
  router.post('/sellHandle', controller.webtaro.sellHandle);
  router.post('/shoppingCart', controller.webtaro.shoppingCart);
  router.post('/deleteUserCart', controller.webtaro.deleteUserCart);
  router.post('/editUserCart', controller.webtaro.editUserCart);
  router.get('/getUserInfo', controller.webtaro.getUserInfo);
};
