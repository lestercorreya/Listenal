const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const findOrCreate = require("mongoose-find-or-create");

const GroupMessagesSchema = new Schema({
  conversationId: {
    type: String,
    required: true,
  },
  messages: {
    type: Array,
    default: [],
  },
});
GroupMessagesSchema.plugin(findOrCreate);

module.exports = mongoose.model("GroupMessages", GroupMessagesSchema);
