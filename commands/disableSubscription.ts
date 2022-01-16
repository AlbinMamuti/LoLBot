import { ICommand } from "wokcommands";
import {IGuildSub, SubModel} from "../models/subscription";

export default {
    category: 'League Of Legends Accout management',
    description: 'Remove Subscription from LolBot Live ingame Features',

    slash: 'both',
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
                return 
            }
            doc._allSubscriptions.push({
                _idDiscord : user.id,
                _subscription : false,
                _guildId : guild.id,
            })
            doc.save()
            return
        }
        d._allSubscriptions.forEach(entry => {
            if(entry._idDiscord === user.id)
                entry._subscription = false;
        })
        d.save();
        return 'Your Subscription has ended and all of your Data is deleted, use /enableSubscription to subscribe again';
    }

} as ICommand