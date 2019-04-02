module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const OrderSchema = new Schema({
    openId: { type: String },
    address: { type: Object },
    payGoods: { type: Array },
    out_trade_no: { type: String },
    total_fee: { type: Number }
  });

  return mongoose.model('Order', OrderSchema);
}