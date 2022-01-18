import { ICommand } from "wokcommands";
import {IGuildSub, SubModel} from "../models/subscription";

export default {
    category: 'League Of Legends Accout management',
    description: 'Activate Subscription from LolBot Live ingame Features',

    slash: 'both',
    //THIS NEEDS EDIT: FOR EVERY GUILD WE SHOULD ENABLE OR DISABLE SUBSCIBPTION
    callback: async ({ message, interaction, user, guild }) => {
        if (!user || !guild)
            return '404 Error'
            const d : IGuildSub |null = await SubModel.findOne({
                "_guildId": guild.id,
                "_allSubscriptions._idDiscord": user.id
            })
            if(!d || d === null){
                const doc : IGuildSub | null = await SubModel
                .findOne({
                    "_guildId": guild.id,
                })
                
                if(!doc ||doc === null) {
                    console.warn(`Doc is missing in DB`); 
                    return '404 Error'
                }
                doc._allSubscriptions.push({
                    _idDiscord : user.id,
                    _subscription : true,
                    _guildId : guild.id,
                })
                await doc.save()
                return 'Your Subscription has begun, if you want to end it use /disableSubscription';
            }
            d._allSubscriptions.forEach(entry => {
                if(entry._idDiscord === user.id)
                    entry._subscription = true;
            })
            await d.save();
        return 'Your Subscription has begun, if you want to end it use /disableSubscription';
    }

} as ICommand