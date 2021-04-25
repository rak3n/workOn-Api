import mdb from "mongoose";
const uri =
  "mongodb+srv://admin:admin1234@cluster0.qtnrv.mongodb.net/workJobs?retryWrites=true&w=majority";
const options = { useNewUrlParser: true, useUnifiedTopology: true };
const mongo = mdb.connect(uri, options);

mongo.then(
  () => {
    console.log("connected");
  },
  (error) => {
    console.log(error, "error");
  }
);

var schema = mdb.Schema({
  name: String,
  fees: Number,
  services: String,
  phoneNumber: String,
  latitude: Number,
  longitude: Number,
});

var Model = mdb.model("model", schema, "availableJobs");

export { Model };
