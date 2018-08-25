module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const GoodsDetailsSchema = new Schema({
    name: { type: String },
    subTitle: { type: String },
    price: { type: String },
    oldPrice: { type: String },
    amount: { type: Number },
    saleAmount: { type: Number },
    classifyValue: { type: Array },
    sliderView: { type: Boolean },
    titleUrl: { type: String },
    detailsUrl: { type: Array },
    goodsId: { type: String },
    sell: { type: Boolean }
  });

  return mongoose.model('GoodsDetails', GoodsDetailsSchema);
}