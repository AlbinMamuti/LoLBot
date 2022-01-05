import { MessageEmbed, UserFlags } from "discord.js";
import { ICommand } from "wokcommands";
import { getAllRankeds, getLiveGame, getMapConstant, getMatchData, getMatchPlayers, getPlayer, getRanked } from "../riotApi/router";
export default {
    category: 'League of Legends Match',
    description: 'Get the live Match of a Summoner on specified server',

    expectedArgs: '<server> <username>',
    minArgs: 2,
    slash: 'both',
    callback: async ({channel, interaction, message, args }) => {
        const msgObj = interaction ? interaction : message;
        const userData = await getPlayer(args[0], args[1])
        if (!userData)
            return `The ${args[1]} could not be found on ${args[0].toLocaleUpperCase()} Server`
        const parsedData = userData.data
        //console.log(parsedData)
        const id = parsedData.id
        //console.log(puuid)
        const liveMatch = await getLiveGame(args[0], id);
        //console.log(liveMatch)
        if (interaction)
            interaction.reply('working')
        else
            message.reply('working')

        const response = await getEmbed(liveMatch.data, args[0], args[1]);
        channel.send(
            {
                embeds: [response] 
            }
        )
    },
} as ICommand

async function getEmbed(liveMatch: any, server: String, summonerName: String) {
    //console.log(liveMatch)
    //const players = liveMatch.CurrentGameInfo.participants;
    let myTeam: Array<Player> = []
    let enemyTeam: Array<Player> = []
    let allPlayers: Array<String> = []
    let teamIdMe: String;

    liveMatch.participants.forEach((element: any) => {
        if (element.summonerName.toLocaleLowerCase() === summonerName.toLocaleLowerCase())
            teamIdMe = element.teamId;
    });
    //console.log(liveMatch.participants)
    liveMatch.participants.forEach((element: any) => {      
        if (element.teamId === teamIdMe)
            myTeam.push({
                name: element.summonerName,
                puuid: element.summonerId,
                championPlayed: element.championId,
                wins: -1,
                losses: -1,
                soloRank: '',
                flexRank: ''
            })
        else
            enemyTeam.push({
                name: element.summonerName,
                puuid: element.summonerId,
                championPlayed: element.championId,
                wins: -1,
                losses: -1,
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
    //console.log('before')
    const RankInfoArray = await getAllRankeds(server, allPlayers)
    //console.log(RankInfoArray?.length)
    //console.log(myTeam)
    //console.log(enemyTeam)
    //let RankInfoData = []
    RankInfoArray?.forEach((element: any) => { //look for every Player 10 peoples 5 my Team 5 Enemy Team
        //console.log(element)
        const RankData = element.data
        //console.group(RankData)
        if(!RankData)
            return
        RankData.forEach((RANKINFO:any) => { //Search only for RANKED_SOLO_5x5
            if(RANKINFO.queueType === 'RANKED_SOLO_5x5'){
                //console.log(RANKINFO.summonerName)
                let concatTemp = myTeam.concat(enemyTeam);
                //console.group(RANKINFO.summonerName)
                const index = concatTemp.findIndex(a => {
                    //console.log(a.name, RANKINFO.summonerName)
                    if(a.name.toLocaleLowerCase() === RANKINFO.summonerName.toLocaleLowerCase())
                        return true
                    return false
                })
                
                //console.groupEnd()
                //console.log("The Index is: ",index)
                //if(index === -1){
                //    console.log("BAD REALLY BAD")
                //}
                
                //alter the object of team for RankInfo
                if(index < 5) {
                    //console.log(myTeam[index])
                    myTeam[index].soloRank = `${RANKINFO.tier.charAt(0) + RANKINFO.tier.slice(1).toLocaleLowerCase()} ${RANKINFO.rank}`
                    myTeam[index].wins = RANKINFO.wins
                    myTeam[index].losses = RANKINFO.losses
                }
                else{
                    //console.log(enemyTeam)
                    //console.log(enemyTeam[index-5])
                    enemyTeam[index-5].soloRank = `${RANKINFO.tier.charAt(0) + RANKINFO.tier.slice(1).toLocaleLowerCase()} ${RANKINFO.rank}`
                    enemyTeam[index-5].wins = RANKINFO.wins
                    enemyTeam[index-5].losses = RANKINFO.losses
                }
            }
        })
        //console.groupEnd()

    })
    //console.log()
    //console.log()
    console.log(myTeam) 
    console.log(enemyTeam)
    const mapeId = liveMatch.mapeId
    
    


    let description: String = "```asciidoc\n"
    description += `= Summoner${" ".repeat(18 - 8)}Champion${" ".repeat(1)}RankedSolo${" ".repeat(3)}K / D / A =\n\n`
    for (let i = 0; i < 5; i++) {
        //console.log(myTeam[i])
        description += `  ${myTeam[i].name + (myTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? ' <--' : '')}${" ".repeat(18 - myTeam[i].name.length - (myTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? 4 : 0))}`; //PlayerName with indication who is who

        const championPlayed: String = myTeam[i].championPlayed.toString()
        //console.log(championPlayed.toString().length)
        description += `${championPlayed}${" ".repeat(5 - championPlayed.length)}`;
        //console.log(description)
        const tempString: String = myTeam[i].soloRank
        //console.log(tempString)
        description += `${tempString}${" ".repeat(16 - tempString.length)}`;
        description += `${myTeam[i].wins}/${myTeam[i].losses}`
        description += `\n`
    }
    description += `\n`
    for (let i = 0; i < 5; i++) {
        description += `  ${enemyTeam[i].name + (enemyTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? ' <--' : '')}${" ".repeat(18 - enemyTeam[i].name.length - (enemyTeam[i].name.toLocaleLowerCase() === summonerName.toLocaleLowerCase() ? 4 : 0))}`; //PlayerName with indication who is who
        
        const championPlayed: String = enemyTeam[i].championPlayed.toString()
        console.log(championPlayed.length)
        description += `${championPlayed}${" ".repeat(5 - championPlayed.length)}`;

        const tempString: String = enemyTeam[i].soloRank
        description += `${tempString}${" ".repeat(16 - tempString.length)}`;
        description += `${enemyTeam[i].wins}/${enemyTeam[i].losses}`
        description += `\n`
    }
    
    description += "```"
    console.log(description)
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