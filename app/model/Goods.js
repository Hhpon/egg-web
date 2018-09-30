module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const GoodSchema = new Schema({
    name: { type: String },
    subTitle: { type: String },
    price: { type: Number },
    oldPrice: { type: Number },
    classifyValue: { type: Array },
    sliderUrl: { type: String },
    titleUrl: { type: String },
    goodsId: { type: String },
    sell: { type: Boolean },
    sliderView: { type: Boolean }
  });

  return mongoose.model('Goods', GoodSchema);
}