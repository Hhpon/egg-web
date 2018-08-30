module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;

    const UserSchema = new Schema({
        nickName: { type: String },
        gender: { type: Number },
        language: { type: String },
        city: { type: String },
        province: { type: String },
        country: { type: String },
        avatarUrl: { type: String },
        openId: { type: String },
        orderLists: { type: Array }
    });

    return mongoose.model('User', UserSchema);
}