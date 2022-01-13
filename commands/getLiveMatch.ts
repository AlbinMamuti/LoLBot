import { MessageEmbed, UserFlags } from "discord.js";
import { ICommand } from "wokcommands";
import { getAllRankeds, getChampionById, getLiveGame, getMapById, getMapConstant, getMatchData, getMatchPlayers, getPlayer, getRanked } from "../riotApi/router";
export default {
    category: 'League of Legends Match',
    description: 'Get the live Match of a Summoner on specified server',

    expectedArgs: '<server> <username>',
    minArgs: 2,
    slash: 'both',

    callback: async ({ channel, interaction, message, args }) => {
        const userData = await getPlayer(args[0], args[1])
        if (!userData)
            return `The ${args[1]} could not be found on ${args[0].toLocaleUpperCase()} Server`
        const parsedData = userData.data
        const id = parsedData.id
        const liveMatch = await getLiveGame(args[0], id);
        if (!liveMatch) {
            return `The user ${args[1]} is currently not playing a Game`
        }
        /*         if (interaction)
                    interaction.reply('In a')
                else
                    message.reply('working') */
        //console.log(liveMatch.data)
        const response = await getEmbed(liveMatch.data, args[0], args[1]);
        //console.log(response)
        channel.send({
            embeds: [response],
        })
        return 'here you are'
    },
} as ICommand

async function getEmbed(liveMatch: any, server: String, summonerName: String) {
    let myTeam: Array<Player> = []
    let enemyTeam: Array<Player> = []
    let allPlayers: Array<String> = []
    let teamIdMe: String;
    liveMatch.participants.forEach((element: any) => {
        if (element.summonerName.toLocaleLowerCase() === summonerName.toLocaleLowerCase())
            teamIdMe = element.teamId;
    });
    liveMatch.participants.forEach((element: any) => {
        if (element.teamId === teamIdMe)
            myTeam.push({
                name: element.summonerName,
                puuid: element.summonerId,
                championPlayed: element.championId,
                wins: 0,
                losses: 0,
                soloRank: 'Unranked',
                flexRank: 'Unranked'
            })
        else
            enemyTeam.push({
                name: element.summonerName,
                puuid: element.summonerId,
                championPlayed: element.championId,
                wins: 0,
                losses: 0,
                soloRank: 'Unranked',
                flexRank: 'Unranked'
            })
    });
    myTeam.forEach((element: Player) => {
        //element.championPlayed = await getChampionById(element.championPlayed.toString())
        //console.log(element.championPlayed)
        allPlayers.push(element.puuid)
    })
    enemyTeam.forEach((element: Player) => {
        //element.championPlayed = await getChampionById(element.championPlayed.toString())
        //console.log(element.championPlayed)
        allPlayers.push(element.puuid)
    })
    const RankInfoArray = await getAllRankeds(server, allPlayers)

    RankInfoArray?.forEach((element: any) => { //look for every Player 10 peoples 5 my Team 5 Enemy Team
        const RankData = element.data
        if (!RankData) {
            return
        }
        RankData.forEach((RANKINFO: any) => { //Search only for RANKED_SOLO_5x5
            if (RANKINFO.queueType === 'RANKED_SOLO_5x5') {
                let concatTemp = myTeam.concat(enemyTeam);
                const index = concatTemp.findIndex(a => {
                    if (a.name.toLocaleLowerCase() === RANKINFO.summonerName.toLocaleLowerCase())
                        return true
                    return false
                })
                if (index === -1) {
                    return
                }
                if (index < 5) {
                    myTeam[index].soloRank = `${RANKINFO.tier.charAt(0) + RANKINFO.tier.slice(1).toLocaleLowerCase()} ${RANKINFO.rank}`
                    myTeam[index].wins = RANKINFO.wins
                    myTeam[index].losses = RANKINFO.losses
                }
                else {
                    enemyTeam[index - 5].soloRank = `${RANKINFO.tier.charAt(0) + RANKINFO.tier.slice(1).toLocaleLowerCase()} ${RANKINFO.rank}`
                    enemyTeam[index - 5].wins = RANKINFO.wins
                    enemyTeam[index - 5].losses = RANKINFO.losses
                }
            }
        })
    })
    const map = getMapById(liveMatch.mapeId)


    let description: String = "```asciidoc\n"
    description += `= Summoner${" ".repeat(18 - 8)}Champion${" ".repeat(8)}RankedSolo${" ".repeat(6)}W/L =\n\n`
    for (let i = 0; i < 5; i++) {
        description += `  ${myTeam[i].name + (myTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? ' <--' : '')}${" ".repeat(18 - myTeam[i].name.length - (myTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? 4 : 0))}`; //PlayerName with indication who is who
        //console.log(myTeam[i])
        const championPlayed: String = await getChampionById(myTeam[i].championPlayed.toString())
        description += `${championPlayed}${" ".repeat(16 - championPlayed.length)}`;

        const tempString: String = myTeam[i].soloRank
        description += `${tempString}${" ".repeat(16 - tempString.length)}`;
        description += `${myTeam[i].wins}/${myTeam[i].losses}`
        description += `\n`
    }
    description += `\n`
    for (let i = 0; i < 5; i++) {
        description += `  ${enemyTeam[i].name + (enemyTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? ' <--' : '')}${" ".repeat(18 - enemyTeam[i].name.length - (enemyTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? 4 : 0))}`; //PlayerName with indication who is who
        const championPlayed: String = await getChampionById(enemyTeam[i].championPlayed.toString())
        //console.log(championPlayed.length)
        description += `${championPlayed}${" ".repeat(16 - championPlayed.length)}`;
        const tempString: String = enemyTeam[i].soloRank
        description += `${tempString}${" ".repeat(16 - tempString.length)}`;
        description += `${enemyTeam[i].wins}/${enemyTeam[i].losses}`
        description += `\n`
    }
    description += "```"
    //console.log(description)
    const timeHHMMSS = (new Date().toTimeString()).split(' ')[0].slice(0, -3);
    const ret = new MessageEmbed()
        .setDescription(`${description}`)
        .setColor('AQUA')
        .setAuthor({
            name: `Live Match Played by ${summonerName} on ${map}`
        })
        .setFooter({
            text: `${timeHHMMSS}`
        })
    return ret;
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