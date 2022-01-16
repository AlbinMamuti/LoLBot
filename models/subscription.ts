import mongoose from "mongoose";
import { Schema,Document , Types} from "mongoose";

const reqString = {
    type: String,
    required: true,
}

const reqBool = {
    type: Boolean,
    required: true,
}

const subscriptionSchema = new Schema<ISubscription>({

    _idDiscord: reqString,

    _subscription: reqBool,

    _guildId: reqString,
})

const guildSubSchema = new Schema<IGuildSub> ({
    _guildId: reqString, //GuildId
    _allSubscriptions: [subscriptionSchema],
})

const name = 'subscriptionBot'
export const SubModel = mongoose.models[name] as mongoose.Model<IGuildSub> || mongoose.model<IGuildSub>(name,guildSubSchema,name);


interface ISubscription{
    _idDiscord: string,
    _subscription: boolean
    _guildId: string
}
export interface IGuildSub extends mongoose.Document{
    _guildId: string
    _allSubscriptions: Types.DocumentArray<ISubscription>,
        
}