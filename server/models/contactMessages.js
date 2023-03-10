const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const findOrCreate = require("mongoose-find-or-create");

const ContactMessagesSchema = new Schema({
  people: {
    type: Array,
    required: true,
  },
  messages: {
    type: Array,
    default: [],
  },
});
ContactMessagesSchema.plugin(findOrCreate);

module.exports = mongoose.model("ContactMessages", ContactMessagesSchema);
