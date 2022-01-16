import { Client, Emoji, Guild, MessageEmbed } from "discord.js";
import { ChampionMasteryDTO, CurrentGameParticipant, LeagueEntryDTO, SummonerDTO } from "./ApiInterfaces/ApiInterfaces";
import { getChampionById, getChampionMasteryByBothID, getPlayer, getPlayerEncId, getRanked } from "./router";

export async function createEmbedPlayer (participant:CurrentGameParticipant, guild:Guild|null) :Promise<MessageEmbed>{
    const embed = new MessageEmbed()

    const SummonerDTO:SummonerDTO = (await getPlayerEncId('euw', participant.summonerId))?.data;
    if(!SummonerDTO){
        embed.setDescription('There was an Error, please try again');
        return embed;
    }
    const ChampionMasteryDTO:ChampionMasteryDTO = (await getChampionMasteryByBothID('euw',SummonerDTO.id, participant.championId.valueOf()))?.data;
    //console.log(ChampionMasteryDTO)
    const RankData:LeagueEntryDTO[] = (await getRanked('euw',SummonerDTO.id))?.data;
    const SR_Rankeds = RankData.filter((entry) => {
        entry.queueType === 'RANKED_SOLO_5x5' || entry.queueType === 'RANKED_TEAM_5x5'
    })
    const championName = await getChampionById(ChampionMasteryDTO.championId.toString());
    embed.setThumbnail(
        `http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg`
    )
    embed.setTitle(`Details for Summoner ${SummonerDTO.name}`)
    let descriptionString = 
        `Summoner: ${SummonerDTO.name}\n`
        + `Level: ${SummonerDTO.summonerLevel}\n`;
    for(const entry of SR_Rankeds){
        const emoji = getRankEmoji(guild);
        if(entry.queueType === 'RANKED_SOLO_5x5'){
            let temp = entry.tier.charAt(0).toUpperCase() + entry.tier.slice(1).toLocaleLowerCase()
            let rankedString = "Solo/Duo: "+ `${emoji} ` + temp + " " + entry.rank
            let kda = `${entry.wins}W / ${entry.losses}L`
            rankedString += ` ${kda} \n`
            descriptionString += rankedString 
        }
        else if(entry.queueType === 'RANKED_TEAM_5x5'){    
            let temp = entry.tier.charAt(0).toUpperCase() + entry.tier.slice(1).toLocaleLowerCase()
            let rankedString = "Solo/Duo: " +`${emoji} ` + temp + " " + entry.rank
            let kda = `${entry.wins}W / ${entry.losses}L`
            rankedString += ` ${kda} \n`
            descriptionString += rankedString     
        }
    }
    const emoji = await getEmoji(ChampionMasteryDTO.championLevel.valueOf(),guild); //CHANGE THIS
    //console.log(emoji)
    embed.setDescription(descriptionString);
    const levelString = `${emoji} ${ChampionMasteryDTO.championPoints}`;
    embed.addField(`${championName}`, levelString)

    return embed
}

async function getRankEmoji(guild: Guild | null){
    const tiers = ['Bronze','Challenger', 'Diamond', 'Gold', 'Grandmaster','Iron','Master','Platinum','Silver']
    if(!guild) return ""
    const guildEmojis = await guild.emojis.fetch();
    let ret = " "
    guildEmojis.forEach(emoji => {
        if(emoji.name && tiers.includes(emoji.name)){
            ret = `<:${emoji.name}:${emoji.id}>`
        }
    })
    return ret;
}

async function getEmoji(level: number,guild: Guild | null){
    if(!guild) return " ";
    const guildEmojis = await guild.emojis.fetch()
    //console.log('In getEmoji: ')
    let ret = " "    
    guildEmojis.forEach(emoji => {
        //console.log(emoji.name, emoji.name?.slice(0,-1))
        if(emoji.name && emoji.name.slice(0,-1) === 'CM_Level_'){

           const index = Number(emoji.name.slice(-1))
           // console.warn(index);
           if(index === level)
                ret = `<:${emoji.name}:${emoji.id}>`
       }
    })
    return ret
}


interface MapMap {

}