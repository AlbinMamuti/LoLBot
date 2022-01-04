import { MessageEmbed, UserFlags } from "discord.js";
import { ICommand } from "wokcommands";
import { getMapConstant, getMatchData, getMatchPlayers, getPlayer, getRanked } from "../riotApi/router";
export default {
    category: 'League of Legends Match',
    description: 'Get the last Match a Summoner has played some server',

    expectedArgs: '<server> <username>',
    minArgs: 2,
    slash: 'both',
    callback: async ({ interaction, message, args }) => {
        const userData = await getPlayer(args[0], args[1])
        if (!userData)
            return `The ${args[1]} could not be found on ${args[0].toLocaleUpperCase()} Server`
        const parsedData = userData.data
        const puuid = parsedData.puuid
        const MatchIds = await getMatchPlayers(args[0], puuid)
        if (!MatchIds)
            return '404'
        const lastMatch = await getMatchData(MatchIds.data[0])
        if (!lastMatch)
            return '404'
        const lastMatchData = lastMatch.data
        const gameType = lastMatchData.info.gameType;

        let myTeamId = 0
        let arrayOfSummonerNames = []
        let arrayMyTeam: Array<Player> = []
        let arrayEnemyTeam: Array<Player> = []
        const maxUserNameLength = 16
        const maxChampionNameLength = 16
        let win = false

        lastMatchData.info.participants.forEach((element: any) => {
            //console.log('keke')
            arrayOfSummonerNames.push(element.summonerName)
            if (element.summonerName.toLocaleLowerCase() === args[1].toLocaleLowerCase()) {
                myTeamId = element.teamId;
                win = element.win;
            }
        })

        if (!myTeamId)
            return 'Error in formatting, could not find Team Id'

        lastMatchData.info.participants.forEach((element: any) => {
            if (element.teamId === myTeamId)
                arrayMyTeam.push({
                    name: element.summonerName,
                    kills: element.kills,
                    deaths: element.deaths,
                    assists: element.assists,
                    championPlayed: element.championName,
                })
            else
                arrayEnemyTeam.push({
                    name: element.summonerName,
                    kills: element.kills,
                    deaths: element.deaths,
                    assists: element.assists,
                    championPlayed: element.championName,
                })
        })
        const mapConst = await getMapConstant();

        let descriptionString: String = "```asciidoc\n"
        descriptionString +=
            `= Summoner${" ".repeat(maxUserNameLength - 8)}Champion${" ".repeat(maxChampionNameLength - 8)} K / D / A =\n\n`
        descriptionString +=
            `= Your Team   ${win ? 'WIN' : 'LOSS'} =\n\n`
        arrayMyTeam.forEach((element) => {
            descriptionString +=
                `  ${element.name + (element.name.toLocaleLowerCase() === args[1].toLocaleLowerCase() ? ' <--' : '')}${" ".repeat(maxUserNameLength - element.name.length - (element.name.toLocaleLowerCase() === args[1].toLocaleLowerCase() ? 4 : 0))}${element.championPlayed}${" ".repeat(maxChampionNameLength - element.championPlayed.length)}${numberConverter(element.kills)} / ${numberConverter(element.deaths)} / ${numberConverter(element.assists)}\n`
        })
        descriptionString += '\n'
        descriptionString +=
            `= Enemy Team   ${win ? 'LOSS' : 'WIN'} =\n\n`
        arrayEnemyTeam.forEach((element) => {
            descriptionString +=
                `  ${element.name}${" ".repeat(maxUserNameLength - element.name.length)}${element.championPlayed}${" ".repeat(maxChampionNameLength - element.championPlayed.length)}${numberConverter(element.kills)} / ${numberConverter(element.deaths)} / ${numberConverter(element.assists)}\n`
        })
        descriptionString += '```'
        let mapName = ""
        mapConst.data.forEach((element: any) => {
            if (element.mapId === lastMatchData.info.mapId)
                mapName = element.mapName
        })

        const ret = new MessageEmbed()
            .setDescription(`${descriptionString}`)
            .setColor('AQUA')
            .setAuthor({
                name: `Last Matched played from ${args[1]} on ${mapName}`
            })
        return ret;

    }


} as ICommand

const numberConverter = (number: Number) => {
    if (number < 10)
        return ` ${number}`
    return `${number}`
}

interface Player {
    name: String
    kills: Number
    deaths: Number
    assists: Number
    championPlayed: String
}