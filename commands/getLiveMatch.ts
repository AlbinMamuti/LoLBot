import { MessageEmbed, UserFlags } from "discord.js";
import { ICommand } from "wokcommands";
import { getAllRankeds, getLiveGame, getMapConstant, getMatchData, getMatchPlayers, getPlayer, getRanked } from "../riotApi/router";
export default {
    category: 'League of Legends Match',
    description: 'Get the live Match of a Summoner on specified server',

    expectedArgs: '<server> <username>',
    minArgs: 2,
    slash: 'both',
    callback: async ({ interaction, message, args }) => {
        const msgObj = interaction ? interaction : message;
        const userData = await getPlayer(args[0], args[1])
        if (!userData)
            return `The ${args[1]} could not be found on ${args[0].toLocaleUpperCase()} Server`
        const parsedData = userData.data
        console.log(parsedData)
        const id = parsedData.id
        //console.log(puuid)
        const liveMatch = await getLiveGame(args[0], id);
        //console.log(liveMatch)
        if (interaction)
            interaction.reply('working')
        else
            message.reply('working')

        return getEmbed(liveMatch.data, args[0], args[1]);
    },
} as ICommand

async function getEmbed(liveMatch: any, server: String, summonerName: String) {
    console.log(liveMatch)
    //const players = liveMatch.CurrentGameInfo.participants;
    let myTeam: Array<Player> = []
    let enemyTeam: Array<Player> = []
    let allPlayers: Array<String> = []
    let teamIdMe: String;
    liveMatch.participants.forEach((element: any) => {
        if (element.summonerName.toLocaleLowerCase() === summonerName.toLocaleLowerCase())
            teamIdMe = element.teamId;
    });
    liveMatch.participants.forEach((element: any) => {
        if (element.teamId === myTeam)
            myTeam.push({
                name: element.summonerName,
                puuid: element.summonerID,
                championPlayed: element.championName,
                wins: element.wins,
                losses: element.losses,
                soloRank: '',
                flexRank: ''
            })
        else
            enemyTeam.push({
                name: element.summonerName,
                puuid: element.summonerId,
                championPlayed: element.championName,
                wins: element.wins,
                losses: element.losses,
                soloRank: '',
                flexRank: ''
            })
    });
    myTeam.forEach((element: Player) => {
        allPlayers.push(element.puuid)
    })
    enemyTeam.forEach((element: Player) => {
        allPlayers.push(element.puuid)
    })
    console.log('before')
    const RankInfoArray = await getAllRankeds(server, allPlayers)
    console.log('after')
    let RankInfoData = []
    RankInfoArray?.forEach((element: any) => {

    })
    const mapeId = liveMatch.mapeId



    let description: String = "```asciidoc\n"
    description += `\n`
    for (let i = 0; i < 5; i++) {
        console.log(myTeam[i])
        description += `  ${allPlayers[i] + (myTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? ' <--' : '')}${" ".repeat(16 - myTeam[i].name.length - (myTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? 4 : 0))}`; //PlayerName with indication who is who

        description += `${myTeam[i].championPlayed}${" ".repeat(16 - myTeam[i].championPlayed.length)}`;
        const tempString: String = trimRank(myTeam[i])
        description += `${tempString}${" ".repeat(10 - tempString.length)}`;
        description += `${myTeam[i].wins}/${myTeam[i].losses}`
    }
    description += `\n`
    for (let i = 0; i < 5; i++) {
        description += `  ${allPlayers[i + 5] + (enemyTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? ' <--' : '')}${" ".repeat(16 - enemyTeam[i].name.length - (enemyTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? 4 : 0))}`; //PlayerName with indication who is who

        description += `${enemyTeam[i].championPlayed}${" ".repeat(16 - enemyTeam[i].championPlayed.length)}`;
        const tempString: String = trimRank(enemyTeam[i])
        description += `${tempString}${" ".repeat(10 - tempString.length)}`;
        description += `${enemyTeam[i].wins}/${enemyTeam[i].losses}`
    }
    description += "```"
    const ret = new MessageEmbed()
        .setDescription(`${description}`)
        .setColor('AQUA')
        .setAuthor({
            name: `Live Match Played by ${summonerName}`
        })
    return ret;
}

/**
 * 
 * @param input:LeagueEntryDTO
 */
function trimRank(input: any) {
    let temp = input.tier.charAt(0).toUpperCase()
        + input.tier.slice(1).toLocaleLowerCase();
    const ret = "Solo/Duo: " + temp + " " + input.rank
    return ret
}

interface Player {
    name: String
    puuid: String
    championPlayed: String
    wins: Number
    losses: Number
    soloRank: String
    flexRank: String
}