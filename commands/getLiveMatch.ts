import { MessageEmbed, UserFlags } from "discord.js";
import { ICommand } from "wokcommands";
import { getMapConstant, getMatchData, getMatchPlayers, getPlayer, getRanked } from "../riotApi/router";
export default {
    category: 'League of Legends Match',
    description: 'Get the live Match of a Summoner on specified server',

    expectedArgs: '<server> <username>',
    minArgs: 2,
    slash: 'both',
    callback: ({args}) => {

    },
} as ICommand