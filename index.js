import express from "express";
import { Model } from "./model.js";
import bodyParser from "body-parser";
import cors from "cors";
//Start App
let app = express();
//configure bodyparser to hande the post requests
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(cors());

//Assign port
var port = process.env.PORT || 7575;
// Welcome message
app.get("/", (req, res) => {
  res.send("Welcome to Express");
});

app.post("/addJobs", (req, res) => {
  console.log(req.body);
  try {
    // console.log(
    //   !req.body.name ||
    //     !req.body.latitude ||
    //     !req.body.longitude ||
    //     !req.body.phoneNumber
    // );
    if (
      !req.body.name ||
      !String(req.body.latitude) ||
      !String(req.body.longitude) ||
      !req.body.phoneNumber ||
      !String(req.body.fees) ||
      !String(req.body.services)
    ) {
      return res.json({ succes: false, message: "parameters missing" });
    }

    let phoneRegex = /^\d{13}$/;
    if (req.body.phoneNumber.length != 13 && !phoneRegex.test(phoneRegex)) {
      return res.json({ succes: false, message: "phoneNumber invalid" });
    }

    let obj = {
      name: req.body.name,
      fees: req.body.fees || "",
      phoneNumber: req.body.phoneNumber,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      services: req.body.services || "",
    };
    let model = new Model(obj);
    model.save((err) => {
      if (err) {
        res.json({
          succes: false,
          message: "unable to save data",
        });

        return 0;
      }
    });
    res.json({ succes: true, message: "added Jobs" });
    return 1;
  } catch {
    (err) => {
      res.json({ succes: false, message: "Error in querry" });
      return 0;
    };
  }
});

app.post("/getJobs", (req, res) => {
  Model.find({}, (err, result) => {
    if (err) {
      res.json({ succes: false, message: "retrival failed" });
    } else {
      let obj = [];
      for (let i = 0; i < result.length; i++) {
        obj = [...obj, result[i]];
      }
      res.json(obj);
    }
  });
});

// Launch app to the specified port
app.listen(port, function () {
  console.log("Running FirstRest on Port " + port);
});
