import { ICommand } from "wokcommands";
import subscription from "../models/subscription";

export default {
    category: 'League Of Legends Accout management',
    description: 'Activate Subscription from LolBot Live ingame Features',

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
            _subscription: true,
            _guildId: guild.id,
        }, {
            upsert: true,
        });
        return 'Your Subscription has begun, if you want to end it use /disableSubscription';
    }

} as ICommand