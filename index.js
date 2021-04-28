import express from "express";
import { Model } from "./model.js";
import bodyParser from "body-parser";
import {jaro_winkler} from "./strcmp.js";
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
  return res.send("Welcome to Express");
});

app.post("/addJobs", (req, res) => {
  try {
    // console.log(
    //   !req.body.name ||
    //     !req.body.latitude ||
    //     !req.body.longitude ||
    //     !req.body.phoneNumber
    // );
    //console.log(req);
    if (
      !req.body.name ||
      typeof req.body.latitude != "number" ||
      typeof req.body.longitude != "number" ||
      !req.body.phoneNumber ||
      typeof req.body.fees != "number" ||
      !req.body.services
    ) {
      return res
        .status(400)
        .json({ succes: false, message: "parameters missing" });
    }

    // let phoneRegex = /^\d{13}$/;
    // if (req.body.phoneNumber.length != 13 && !phoneRegex.test(phoneRegex)) {
    //   return res
    //     .status(400)
    //     .json({ succes: false, message: "phoneNumber invalid" });
    // }
    //console.log(req.body);

    const lat = req.body.latitude;
    const lon = req.body.longitude;

    let obj = {
      name: req.body.name,
      fees: req.body.fees || "",
      phoneNumber: req.body.phoneNumber,
      services: req.body.services || "",
      imageUrl: req.body.imageUrl || "",
      tags:req.body.tags || [],
      location: {
        type: "Point",
        coordinates: [lon, lat],
      },
    };

    console.log(obj);
    let model = new Model(obj);
    model.save((err) => {
      if (err) {
        return res.status(400).json({
          succes: false,
          message: "unable to save data",
          err: err,
        });
      }
      return res.status(200).json({ succes: true, message: "added Job" });
    });
  } catch {
    (err) => {
      return res
        .status(400)
        .json({ succes: false, message: "Error in query" });
    };
  }
});

// const sortByLoc = (a, b) => {
//   var dist = (a.latitude - b.latitude) ** 2 + (a.longitude - b.longitude);
//   return Math.sqrt(dist);
// };

const checkSimilarInTags=(tags, search)=>{
  for(let i=0;i<tags.length;i++){
    if(jaro_winkler.distance(tags[i],search)){
      return true;
    }
  }
  return false;
}

app.post("/getJobs", (req, res) => {
  if (req.body.longitude && req.body.latitude) {
    var maxDist = req.body.maxDist || 5000;
    Model.aggregate(
      [
        {$geoNear: {
          near: {
            type: "Point",
            coordinates: [req.body.longitude, req.body.latitude],
          },
          distanceField: "dist.calculated",
          maxDistance: maxDist,
          spherical: true,
        }},
      ],
      (err, data) => {
        if (err) {
          return res
            .status(400)
            .json({ succes: false, message: "an error occured", err:err });
        }
        if(req.body.searchTerm){
          var searchTerm=req.body.searchTerm.toLowerCase();
          var results=data.filter(itm=>{
            //console.log(jaro_winkler.distance(itm.name.toLowerCase(),searchTerm),jaro_winkler.distance(itm.services.toLowerCase(),searchTerm))
            if(jaro_winkler.distance(itm.name.toLowerCase(),searchTerm) >= 0.75 || jaro_winkler.distance(itm.services.toLowerCase(),searchTerm) >= 0.75){
              return true;
            }
            
            return checkSimilarInTags(itm.tags || [], searchTerm);
          })
          //console.log(results);
          return res.json(results);
        }
        return res.json(data);
      }
    );
  }
  else{
    Model.find({}, (err, result) => {
      if (err) {
        return res.json({ succes: false, message: "retrival failed" });
      } else {
        let obj = [];
        for (let i = 0; i < result.length; i++) {
          obj = [...obj, result[i]];
        }
        if(req.body.searchTerm){
          var searchTerm=req.body.searchTerm.toLowerCase();
          var results=obj.filter(itm=>{
            if(jaro_winkler.distance(itm.name.toLowerCase(),searchTerm) >= 0.75 || jaro_winkler.distance(itm.services.toLowerCase(),searchTerm) >= 0.75){
              return true;
            }
            return false;
          })
          return res.json(results);
        }
        return res.json(obj);
      }
    });
  }
});

app.delete("/deleteAllJobs", (req, res) => {
  if (req.body.APIkey === "deleteEveryThing") {
    Model.deleteMany({}, () => {
      res.json({ succes: true, message: "All Data Deleted." });
    });
  } else {
    res.json({ succes: false, message: "API Key missing" });
  }
});

// Launch app to the specified port
app.listen(port, function () {
  console.log("Running FirstRest on Port " + port);
});
