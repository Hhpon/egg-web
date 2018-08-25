module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;

    const SliderSchema = new Schema({
        name: { type: String },
        subTitle: { type: String },
        price: { type: String },
        oldPrice: { type: String },
        classifyValue: { type: Array },
        sliderUrl: { type: String },
        titleUrl: { type: String },
        goodsId: { type: String },
        sell: { type: Boolean }
    });

    return mongoose.model('Slider', SliderSchema);
}