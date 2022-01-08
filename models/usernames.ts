import mongoose from "mongoose";
import { Schema } from "mongoose";

const reqString = {
    type: String,
    required: true,
}

const usernameSchema = new Schema({
    _id: reqString,

    _idDiscord: reqString,

    _summonerName: reqString,

    _server: reqString
})

const name = 'summonerNameDict'
export default mongoose.models[name] || mongoose.model(name, usernameSchema, name)
