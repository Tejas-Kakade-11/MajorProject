const mongoose = require("mongoose");
const initData = require("./data");

const Listing = require("../models/listing");

let MONGO_URL = "mongodb://127.0.0.1:27017/wandarlust";

main().then(()=>{
    console.log("connection success");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

// initialise the database

const initDB = async ()=>{
    await Listing.deleteMany({});

    initData.data = initData.data.map((obj)=>({
        ...obj,
        owner:"6684f33dba60dc09df26a873",
    }));
    await Listing.insertMany(initData.data);

    console.log("data was initialize");
};
initDB();
