import { ICommand } from "wokcommands";
import subscription from "../models/subscription";

export default {
    category: 'League Of Legends Accout management',
    description: 'Remove Subscription from LolBot Live ingame Features',

    slash: 'both',
    callback: async ({ message, interaction, user, guild }) => {
        if (!user || !guild)
            return '404 Error'
        await subscription.findOneAndUpdate({
            _id: user.id,
            _guildId: guild.id
        }, {
            _id: user.id,
            _idDiscord: user.id,
            _subscription: false,
            _guildId: guild.id,
        }, {
            upsert: true,
        });
        return 'Your Subscription has ended and all of your Data is deleted, use /enableSubscription to subscribe again';
    }

} as ICommand