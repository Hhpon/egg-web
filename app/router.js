'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/gettoken', controller.webback.gettoken);
  router.post('/uploadMes', controller.webback.uploadMes);
  router.get('/gettableGoods', controller.webback.gettableGoods);
  router.post('/deleteGood', controller.webback.deleteGood);
  router.post('/getGoods', controller.webtaro.getGoods);
  router.post('/getGoodDetails', controller.webtaro.getGoodDetails);
  router.post('/onLogin', controller.webtaro.onLogin);
  router.post('/sellHandle', controller.webtaro.sellHandle);
  router.post('/shoppingCart', controller.webtaro.shoppingCart);
  router.post('/getorderLists', controller.webtaro.getorderLists);
  router.post('/deleteUserOrderList', controller.webtaro.deleteUserOrderList);
  router.post('/editUserOrderList', controller.webtaro.editUserOrderList);
};
