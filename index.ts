import DiscordJS, { Intents } from 'discord.js'
import dotenv from 'dotenv'
import WOKCommands from 'wokcommands'
import mongoose from 'mongoose'
import path from 'path'
import { getPlayer } from './riotApi/router'
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
        //mongoUri: process.env.MONGO_DB_ADRESS,
    })
})

client.on('messageCreate', (message) => {
    if (message.content === 'ping')
        message.reply({
            content: 'Pong',
        })
    //getPlayer('euw', 'Knochen MC')
})

client.login(process.env.TOKEN)