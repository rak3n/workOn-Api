import mdb from "mongoose";
const uri =
  "mongodb+srv://admin:admin1234@cluster0.qtnrv.mongodb.net/workJobs?retryWrites=true&w=majority";
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};
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
  location: {
    type: Object,
    properties: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  imageUrl: String,
});

schema.index({ location: "2dsphere" });

var Model = mdb.model("model", schema, "availableJobs");

export { Model };
