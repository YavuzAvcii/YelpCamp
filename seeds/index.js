const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
const axios = require("axios");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Database connected");
});

async function imageApiCall() {
  try {
    const res = await axios.get(
      "https://api.unsplash.com/photos/random?client_id=zCUD8zCk2p3u1LVxS8J41nieJQ848k-K_eQcV0M1xwA",
      {
        params: {
          collections: 1114848,
        },
      }
    );
    return res.data.urls.small;
  } catch (e) {
    console.log("ERROR OCCURED WHILE MAKING API CALL FOR IMG", e);
  }
}

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  try {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
      const random1000 = Math.floor(Math.random() * 1000);
      const price = Math.floor(Math.random() * 20) + 10;
      const camp = new Campground({
        author: "64c688812048d2e66a7a4817",
        location: `${cities[random1000].city}, ${cities[random1000].state}`,
        geometry: {
          type: "Point",
          coordinates: [
            cities[random1000].longitude,
            cities[random1000].latitude,
          ],
        },
        title: `${sample(descriptors)} ${sample(places)}`,
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis iusto repellat quod vel unde vero nulla beatae ipsam earum qui ab, asperiores quos dicta praesentium suscipit perspiciatis excepturi possimus aut?",
        price,
        images: [
          {
            url: "https://res.cloudinary.com/dxuruf2hz/image/upload/v1692533972/YelpCamp/g4i93c75pqp0tjhl4dca.png",
            filename: "YelpCamp/g4i93c75pqp0tjhl4dca",
          },
          {
            url: "https://res.cloudinary.com/dxuruf2hz/image/upload/v1692623138/YelpCamp/gegzpyao0sqyousxbxau.png",
            filename: "YelpCamp/gegzpyao0sqyousxbxau",
          },
        ],
      });
      console.log(camp);
      await camp.save();
    }
  } catch (e) {
    console.log("ERROR", e);
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
