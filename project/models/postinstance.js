var mongoose = require('mongoose');
const { DateTime } = require('luxon'); //for date handling
var Schema = mongoose.Schema;
var PostInstanceSchema = new Schema({
    post: { type: Schema.ObjectId, ref: 'Post', required: true }, // Reference to the associated post (like FK)
    imprint: { type: String, required: false },
    status: { type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance', },
    due_back: { type: Date, default: Date.now },
});
// Virtual for this postinstance object's URL.
PostInstanceSchema.virtual('url').get(function() {
    return '/postinstances/' + this._id;
});
PostInstanceSchema.virtual('due_back_formatted').get(function() {
    return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});
PostInstanceSchema.virtual('due_back_yyyy_mm_dd').get(function() {
    return DateTime.fromJSDate(this.due_back).toISODate(); //format 'YYYY-MM-DD'
});
// Export model.
module.exports = mongoose.model('PostInstance', PostInstanceSchema);