import { MessageEmbed, UserFlags } from "discord.js";
import { ICommand } from "wokcommands";
import { getLiveGame, getMapConstant, getMatchData, getMatchPlayers, getPlayer, getRanked } from "../riotApi/router";
export default {
    category: 'League of Legends Match',
    description: 'Get the live Match of a Summoner on specified server',

    expectedArgs: '<server> <username>',
    minArgs: 2,
    slash: 'both',
    callback: async ({interaction,message,args}) => {
        const msgObj = interaction ? interaction : message;
        const userData = await getPlayer(args[0], args[1])
        if (!userData)
            return `The ${args[1]} could not be found on ${args[0].toLocaleUpperCase()} Server`
        const parsedData = userData.data
        const puuid = parsedData.puuid
        const liveMatch = await getLiveGame(args[0],puuid);

    },
} as ICommand

function getEmbed(liveMatch:any, summonerName:String) {
    const players = liveMatch.data.participants;
    let myTeam:Array<Player> = []
    let enemyTeam:Array<Player> = []


    
}

interface Player {

}