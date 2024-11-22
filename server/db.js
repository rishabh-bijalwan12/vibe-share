require('dotenv').config();
const mongoose = require('mongoose');

const dbUrl = process.env.MONGO_DB_URL;

const db = mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("DB Connected");
}).catch((err) => {
    console.error("Db Not Connected:", err);
});

module.exports = db;
