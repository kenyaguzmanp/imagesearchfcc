var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var searchTearmSchema = new Schema(
    {
        searchVal: String,
        searchDate: Date
    },
    {
        timestamps: true
    }
);

var ModelClass = mongoose.model('searchTerm', searchTearmSchema);

module.exports = ModelClass;