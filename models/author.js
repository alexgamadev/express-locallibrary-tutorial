const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const { Schema } = mongoose;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, minLength: 2, maxLength: 100 },
  family_name: { type: String, required: true, minLength: 2, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date }
});

AuthorSchema.virtual("full_name").get(function() {
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }
  return fullname;
});

AuthorSchema.virtual("url").get(function() {
  return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual("dob_formatted").get(function() {
  return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATETIME_MED) : 'N/A';
});

AuthorSchema.virtual("dod_formatted").get(function() {
  return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATETIME_MED) : 'N/A';
});

module.exports = mongoose.model("Author", AuthorSchema);