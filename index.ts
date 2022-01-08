import DiscordJS, { Activity, Intents } from 'discord.js'
import dotenv from 'dotenv'
import WOKCommands from 'wokcommands'
import mongoose from 'mongoose'
import path from 'path'
import { getLiveGame, getPlayer, getSummonerNameByDiscordId } from './riotApi/router'
import { getLiveMatchEmbed } from './riotApi/liveMatch'
dotenv.config()

var LeagueUserCache: Array<LeaguePlayer> = []

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_PRESENCES
    ]
})

client.on('ready', async () => {
    console.log('The Bot is ready')
    new WOKCommands(client, {
        commandDir: path.join(__dirname, 'commands'),
        //featureDir: path.join(__dirname, 'features'),
        typeScript: true,
        testServers: ['924639148659331103', '833052793866551316'],
        botOwners: ['272691075959750656'],
        mongoUri: process.env.MONGO_DB_ADRESS,
    })

})

client.on('messageCreate', (message) => {
    if (message.content === 'ping')
        message.reply({
            content: 'Pong',
        })
})



const delay: number = 600000

//Function to automatically report to the DiscordUser their ingame
//live Data on a League of Legends Game, it will only work if they
//added their SummonerName or told the LolBot their SummonerName
client.on('presenceUpdate', async (oldPresence, newPresence) => {

    //some if's so we dont spam every time
    if (newPresence.activities.length === 0)
        return
    let activity: DiscordJS.Activity | null = null;
    newPresence.activities.forEach(element => {
        if (element.name === 'League of Legends' && element.state === 'In Game')
            activity = element
    })
    const guild = newPresence.guild;
    if (!guild) return
    const textChannel = guild.channels.cache.find((channel) => { return channel.type === 'GUILD_TEXT' }) as DiscordJS.TextChannel
    if (!textChannel) return
    const response = await getSummonerNameByDiscordId(newPresence.userId);

    //check if user is in db to get Summoner name, if not
    //notify user to register summoner name
    //console.log(textChannel)
    if (!response) {
        textChannel.send({
            content: `Hey <@${newPresence.userId}>, please use the command /connectSummonerName <server> <summonerName> to inform \n me about your Summoner Name. In the Future it might be helpful ;)`
        })
        return
    }
    if (activity == null || activity === null)
        return //check if player is in a game if not return

    //cooldown for each individual Member / League Player, we cache every single one and look if there creation
    //timestamp + delay is lower then Date.now()    
    const temp: Array<LeaguePlayer> = (LeagueUserCache.filter(Player => {
        Player.userId === newPresence.userId
    }))
    if (temp.length === 0)
        return
    const playerDelay = temp[0]
    if (playerDelay.timeStamp + delay > Date.now())
        return //return if cooldown is not finished 

    //delete player from cache
    LeagueUserCache = LeagueUserCache.filter(element => { return element.userId !== newPresence.userId })

    const summonerName = response._summonerName;
    const server = response._server;

    //fetch Player data
    const userData = await getPlayer(server, summonerName);
    if (!userData)
        return
    const parsedData = userData.data
    const id = parsedData.id
    //fetch liveGame data if there is already a liveGame
    const liveMatch = await getLiveGame(server, id);
    if (!liveMatch)
        return

    //cache current suspect for cooldown     
    const LP: LeaguePlayer = {
        userId: newPresence.userId,
        timeStamp: Date.now()
    }
    LeagueUserCache.push(LP)

    //getLiveMatchEmbed creates the Embed with the Data
    const responseEmbed = await getLiveMatchEmbed(liveMatch.data, server, summonerName);
    textChannel.send({
        embeds: [responseEmbed],

    })











})

client.login(process.env.TOKEN)

interface LeaguePlayer {
    userId: String,
    timeStamp: number,

}