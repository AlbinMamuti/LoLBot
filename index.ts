import DiscordJS, { Activity, Intents, Presence } from 'discord.js'
import dotenv from 'dotenv'
import WOKCommands from 'wokcommands'
import mongoose from 'mongoose'
import path from 'path'
import { getLiveGame, getPlayer, getSummonerNameByDiscordId } from './riotApi/router'
import { getLiveMatchEmbed } from './riotApi/liveMatch'
import { checkAndSend, reactionPlayerDetails } from './backGroundFeatures/liveMatchData'
import { track } from './backGroundFeatures/trackPlayTime'
import colors from 'colors'
import { installEmojis } from './riotApi/getEmojis'
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
    console.log(colors.cyan('The Bot is ready'))
    new WOKCommands(client, {
        commandDir: path.join(__dirname, 'commands'),
        //featureDir: path.join(__dirname, 'features'),
        typeScript: true,
        testServers: ['924639148659331103', '833052793866551316'],
        botOwners: ['272691075959750656'],
        mongoUri: process.env.MONGO_DB_ADRESS,
    })
    const Channel = (client.channels.cache.get('925528643571179550') as DiscordJS.TextBasedChannel)
    //console.log(Channel);
    const msg = await Channel.messages.fetch('931947219370795058');
    //console.log(msg);
    //console.log(Channel.messages.cache.values());

    //install emojis
    //installEmojis(client);
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
    await checkAndSend(newPresence);
    //console.log(newPresence.activities)
    track(newPresence)
})



client.on('messageReactionAdd', async (reaction, user) => {
    if (!(reaction instanceof DiscordJS.MessageReaction)){
        console.log('first')
        return;
    }
    else if(user.bot){
        console.log('second')
        return;
    }
    reactionPlayerDetails(reaction)
})

client.login(process.env.TOKEN)