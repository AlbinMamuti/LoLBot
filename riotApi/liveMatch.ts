import { MessageEmbed } from "discord.js";
import { CurrentGameInfo, LeagueEntryDTO } from "./ApiInterfaces/ApiInterfaces";
import { getAllRankeds, getChampionById, getMapById, getRankeds } from "./router";

export async function getLiveMatchEmbed(liveMatch: CurrentGameInfo, server: String, summonerName: String) {
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
        allPlayers.push(element.puuid)
    })
    enemyTeam.forEach((element: Player) => {
        allPlayers.push(element.puuid)
    })
    
    const RankInfoArray = await getRankeds(server, allPlayers)
    for (let i = 0; i < RankInfoArray.length - enemyTeam.length; i++) {
        if(!RankInfoArray[i]){
            const index = i - enemyTeam.length
            myTeam[index].soloRank = `unranked`
            myTeam[index].wins = 0
            myTeam[index].losses = 0
        }
        RankInfoArray[i].forEach((entry: LeagueEntryDTO) => {
            if (entry.queueType === 'RANKED_SOLO_5x5') {
                myTeam[i].soloRank = `${entry.tier.charAt(0) + entry.tier.slice(1).toLocaleLowerCase()} ${entry.rank}`
                myTeam[i].wins = entry.wins
                myTeam[i].losses = entry.losses
            }
        })
    }
    for (let i = RankInfoArray.length - myTeam.length; i < RankInfoArray.length; i++) {
        if(!RankInfoArray[i]){
            const index = i - enemyTeam.length
            enemyTeam[index].soloRank = `unranked`
            enemyTeam[index].wins = 0
            enemyTeam[index].losses = 0
        }
        RankInfoArray[i].forEach((entry: LeagueEntryDTO) => {
            if (entry.queueType === 'RANKED_SOLO_5x5') {
                const index = i - enemyTeam.length
                enemyTeam[index].soloRank = `${entry.tier.charAt(0) + entry.tier.slice(1).toLocaleLowerCase()} ${entry.rank}`
                enemyTeam[index].wins = entry.wins
                enemyTeam[index].losses = entry.losses
            }
        })
    }
    const map = getMapById(liveMatch.mapId.valueOf());


    let description: String = "```asciidoc\n"
    description += `= Summoner${" ".repeat(18 - 8)}Champion${" ".repeat(8)}RankedSolo${" ".repeat(6)}W/L =\n\n`
    for (let i = 0; i < myTeam.length; i++) {
        description += `  ${myTeam[i].name + (myTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? ' <' : '')}${" ".repeat(18 - myTeam[i].name.length - (myTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? 2 : 0))}`; //PlayerName with indication who is who
        //console.log(myTeam[i])
        const championPlayed: String = await getChampionById(myTeam[i].championPlayed.toString())
        description += `${championPlayed}${" ".repeat(16 - championPlayed.length)}`;

        const tempString: String = myTeam[i].soloRank
        description += `${tempString}${" ".repeat(16 - tempString.length)}`;
        description += `${myTeam[i].wins}/${myTeam[i].losses}`
        description += `\n`
    }
    description += `\n`
    for (let i = 0; i < enemyTeam.length; i++) {
        description += `  ${enemyTeam[i].name + (enemyTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? ' <' : '')}${" ".repeat(18 - enemyTeam[i].name.length - (enemyTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? 2 : 0))}`; //PlayerName with indication who is who
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
    const ret = new MessageEmbed()
        .setDescription(`${description}`)
        .setColor('AQUA')
        .setAuthor({
            name: `Live Match Played by ${summonerName}`
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