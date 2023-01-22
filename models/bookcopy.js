const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const { Schema } = mongoose;

const BookCopySchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
    default: "Maintenance",
  },
  due_back: { type: Date, default: Date.now },
});

BookCopySchema.virtual("url").get(function() {
  return `/catalog/bookcopies/${this._id}`;
});

BookCopySchema.virtual("due_date_formatted").get(function() {
  return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model("BookCopy", BookCopySchema);