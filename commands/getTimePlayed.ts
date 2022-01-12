import { ICommand } from "wokcommands";
import subscription from "../models/subscription";
import timePlayed from "../models/timePlayed";

export default {
    category: 'League Of Legends Accout Information',
    description: 'retrieves Information about how many hours this User played League of Legends',
    expectedArgs: '<userName>',
    minArgs: 1,
    slash: 'both',

    callback: async ({ message, interaction, user, guild, client, args }) => {
        if (!user || !guild)
            return '404 Error'
        const userId = args[0].slice(3, args[0].length - 1);
        //console.log(userId);
        const playerObj = await timePlayed.findById({ _id: userId })
        if (!playerObj) {
            timePlayed.create({
                _id: userId,
                _guildId: guild.id,
                _timePlayedMS: 0,
                _sinceTimeStamp: Date.now(),
            })
            return `${args[0]} has not played League of Legends since i'm active :(`
        }
        return `<@${playerObj._id}> has played ${msToTime(playerObj._timePlayedMS)} (hh:mm:ss) of League of Legends!`
    }

} as ICommand
function msToTime(s: number) {
    // Pad to 2 or 3 digits, default is 2
    var pad = (n: number, z = 2) => ('00' + n).slice(-z);
    return pad(s / 3.6e6 | 0) + ':' + pad((s % 3.6e6) / 6e4 | 0) + ':' + pad((s % 6e4) / 1000 | 0);
}
