const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
    userid: { type: Number, required: true, unique: true },
    years: {
        type: Object,
        default: {}, // Default as an empty object
    },
});

module.exports = mongoose.model('report', ReportSchema);