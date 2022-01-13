import DiscordJS, { Activity, Intents, Presence } from 'discord.js'
import dotenv from 'dotenv'
import WOKCommands from 'wokcommands'
import mongoose from 'mongoose'
import path from 'path'
import { getLiveGame, getPlayer, getSummonerNameByDiscordId } from './riotApi/router'
import { getLiveMatchEmbed } from './riotApi/liveMatch'
import { checkAndSend } from './backGroundFeatures/liveMatchData'
import { track } from './backGroundFeatures/trackPlayTime'
dotenv.config()

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


//TODO : ONLY FOR RANK/NORMAL SUMMONERS RIFT OR ELSE BREAKS 
//TODO : STOP SPOTIFY CHANGES OR EVERYTHING ELSE!!! new cache prob

//Function to automatically report to the DiscordUser their ingame
//live Data on a League of Legends Game, it will only work if they
//added their SummonerName or told the LolBot their SummonerName
client.on('presenceUpdate', async (oldPresence, newPresence) => {
    checkAndSend(newPresence);
    //console.log(newPresence.activities)
    track(newPresence)
})

client.login(process.env.TOKEN)