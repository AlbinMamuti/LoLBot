import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { getPlayer, getRanked } from "../riotApi/router";
export default {

    category: 'League of Legends User',
    description: 'Get the League of Legends User you type and the server',

    expectedArgs: '<server> <username>',
    minArgs: 2,
    slash: 'both',
    callback: async ({ interaction, message, args }) => {
        const userData = await getPlayer(args[0], args[1])
        if (!userData)
            return `The ${args[1]} could not be found on ${args[0].toLocaleUpperCase()} Server`
        const parsedData = userData.data
        //console.log(parsedData)
        const RankData = await getRanked(args[0], userData.data.id)
        const parsedRank = RankData?.data
        console.log(parsedRank)
        let rankedString = ''
        for (let i = 0; i < parsedRank.length; i++) {

            if (parsedRank[i].queueType === 'RANKED_SOLO_5x5') {
                let temp = parsedRank[i].tier.charAt(0).toUpperCase() + parsedRank[i].tier.slice(1).toLocaleLowerCase()
                rankedString += "Solo/Duo: " + temp + " " + parsedRank[i].rank
                let kda = `${parsedRank[i].wins}W / ${parsedRank[i].losses}L`
                rankedString += ` ${kda} \n`
            }
            else if (parsedRank[i].queueType === 'RANKED_FLEX_SR') {
                let temp = parsedRank[i].tier.charAt(0).toUpperCase() + parsedRank[i].tier.slice(1).toLocaleLowerCase()
                rankedString += "Flex: " + temp + " " + parsedRank[i].rank
                let kda = `${parsedRank[i].wins}W / ${parsedRank[i].losses}L `
                rankedString += ` ${kda} \n`
            }
        }
        //rankedString = rankedString.charAt(0).toLocaleUpperCase() + rankedString.slice(1)
        //console.log(rankedString)
        const avaterURL = `https://ddragon.leagueoflegends.com/cdn/11.24.1/img/profileicon/${parsedData.profileIconId}.png`
        const ret = new MessageEmbed()
            .setThumbnail(avaterURL)
            .setDescription(`Summoner: ${parsedData.name}\nLevel: ${parsedData.summonerLevel}\n ${rankedString}`)
            .setColor('AQUA')
            .setAuthor(parsedData.name)
        return ret;

    }


} as ICommand