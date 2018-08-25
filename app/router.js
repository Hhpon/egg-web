'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/gettoken', controller.home.gettoken);
  router.post('/uploadMes', controller.home.uploadMes);
  router.get('/gettableGoods', controller.home.gettableGoods);
  router.post('/deleteGood', controller.home.deleteGood);
  router.post('/getGoods', controller.home.getGoods);
  router.post('/getGoodDetails', controller.home.getGoodDetails);
  router.post('/onLogin', controller.home.onLogin);
};
