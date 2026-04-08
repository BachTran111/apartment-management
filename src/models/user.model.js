import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const connection = mongoose.connection;
const AutoIncrement = AutoIncrementFactory(connection);

const userSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "USER" },
});

userSchema.plugin(AutoIncrement, { inc_field: "user_id" });

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
