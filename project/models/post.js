const mongoose = require('mongoose');
var moment = require('moment');
const Schema = mongoose.Schema;
//const AuthorSchema = require('./author');
const Comment = new Schema();
Comment.add({ // 
    title: { type: String, index: true },
    date: Date,
    body: String,
    comments: [Comment]
});

const PostSchema = new Schema({
    title: { type: String, required: true },
    author: { type: Schema.ObjectId, ref: 'Author', required: true },
    //author: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required:true },
    summary: { type: String, required: true },
    //date: { type: Date, default: Date.now() },
    createdAt: {
        type: String,
        default: moment(new Date()).format("MMM DD, YYYY") // "Sun, 3PM 17"
    },
    buf: Buffer,
    slug: { type: String, lowercase: true, trim: true },
    isbn: { type: String, required: false },
    genre: [{ type: Schema.ObjectId, ref: 'Genre' }],
    posts: [PostSchema],
    comments: [Comment],
    hidden: Boolean,
    meta: { votes: Number, favs: Number },
});
// Virtual for this post instance URL.
PostSchema.virtual('url').get(function() {
    return '/posts/' + this._id;
});
PostSchema.path('date')
    .default(function() {
        return new Date();
    })
    .set(function(v) {
        return v === 'now' ? new Date() : v;
    });

PostSchema.pre('save', function(next, done) {
    /* global emailAuthor */
    emailAuthor(done);
    next();
});

// NOTE: methods must be added to the schema before compiling it with mongoose.model()
PostSchema.methods.findCreator = function(callback) {
    return this.db.model('User').findById(this.creator, callback);
};
PostSchema.statics.findByTitle = function(title, callback) {
    return this.find({ title: title }, callback);
};
PostSchema.methods.expressiveQuery = function(creator, date, callback) {
    return this.find('author', creator).where('date').gte(date).run(callback);
};

function slugGenerator(options) {
    options = options || {};
    const key = options.key || 'title';
    return function slugGenerator(schema) {
        schema.path(key).set(function(v) {
            this.slug = v.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/-+/g, '');
            return v;
        });
    };
};
PostSchema.plugin(slugGenerator());

// Export model.
module.exports = mongoose.model('Post', PostSchema);