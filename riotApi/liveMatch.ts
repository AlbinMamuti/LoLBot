import { MessageEmbed } from "discord.js";
import { getAllRankeds, getChampionById, getMapById } from "./router";

export async function getLiveMatchEmbed(liveMatch: any, server: String, summonerName: String) {
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
    const ret = new MessageEmbed()
        .setDescription(`${description}`)
        .setColor('AQUA')
        .setAuthor({
            name: `Live Match Played by ${summonerName} on ${map}`
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