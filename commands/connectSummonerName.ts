import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { getPlayer, getRanked } from "../riotApi/router";
import summonerNameSchema from "../models/usernames"
export default {

    category: 'League of Legends User',
    description: 'Insert your Summoner Name so that I can help you git gud',

    expectedArgs: '<server> <summonerName>',
    minArgs: 2,
    slash: 'both',
    callback: async ({ interaction, message, args, user }) => {
        const msg = interaction ? interaction : message;
        //console.log(user.id.toString())
        const summonerName = (args.slice(1)).join(' ');
        await summonerNameSchema
            .findByIdAndUpdate({
                _id: user.id
            }, {
                _id: user.id,
                _idDiscord: user.id,
                _summonerName: summonerName,
                _server: 'euw'
            }, {
                upsert: true,
            })
        msg.reply(`Your Summoner Name has been updated to ${summonerName}`)
    }


} as ICommand