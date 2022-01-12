import mongoose from "mongoose";
import { Schema } from "mongoose";

const reqString = {
    type: String,
    required: true,
}

const reqBool = {
    type: Boolean,
    required: true,
}
const reqNumber = {
    type: Number,
    required: true,
}
const reqDate = {
    type: Date,
    required: true,
}


const timePlayed = new Schema({

    _id: reqString,

    _guildId: reqString,

    _timePlayedMS: reqNumber,

    _sinceTimeStamp: reqDate,
})

const name = 'timePlayedSince'
export default mongoose.models[name] || mongoose.model(name, timePlayed, name)
