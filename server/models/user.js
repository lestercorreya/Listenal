const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const findOrCreate = require("mongoose-find-or-create");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  contacts: {
    type: Array,
    default: [],
  },
  groups: {
    type: Array,
    default: [],
  },
});
userSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", userSchema);
