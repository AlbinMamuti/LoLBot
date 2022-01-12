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

const subscriptionSchema = new Schema({

    _id: reqString,

    _idDiscord: reqString,

    _subscription: reqBool,

    _guildId: reqString,
})

const name = 'subscriptionBot'
export default mongoose.models[name] || mongoose.model(name, subscriptionSchema, name)
