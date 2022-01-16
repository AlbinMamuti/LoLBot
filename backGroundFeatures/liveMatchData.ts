import DiscordJs from "discord.js";
import {IGuildSub, SubModel} from "../models/subscription";
import { CurrentGameInfo } from "../riotApi/ApiInterfaces/ApiInterfaces";
import { getLiveMatchEmbed } from "../riotApi/liveMatch";
import colors from 'colors';
import {
  getLiveGame,
  getPlayer,
  getSummonerNameByDiscordId,
} from "../riotApi/router";
import { isInLeagueClient } from "./trackPlayTime";
import { createEmbedPlayer } from "../riotApi/player";
//import { createEmbedPlayer } from "../riotApi/player";
//Function to automatically report to the DiscordUser their ingame
//live Data on a League of Legends Game, it will only work if they
//added their SummonerName or told the LolBot their SummonerName

//var ApplicatedUsers: Array<ApplicatedLeaguePlayers> = [];
var LiveGamesProccessed: Array<number> = [];
let ProcessdGamesMap: Map<string, CurrentGameInfo> = new Map();
ProcessdGamesMap.set('931947219370795058', {
  gameId: 5668424652,
  mapId: 11,
  gameMode: 'CLASSIC',
  gameType: 'CUSTOM_GAME',
  participants: [
    {
      teamId: 100,
      spell1Id: 1,
      spell2Id: 3,
      championId: 245,
      profileIconId: 4787,
      summonerName: 'Knochen MC',
      bot: false,
      summonerId: 'qDbDCA6JRy1UMfRyDm6w3ygDQx-hL7rbYrxZDB0hk0iRh0Q',
      gameCustomizationObjects: [],
      perks: undefined,
    }
  ],
  platformId: 'EUW1',
  bannedChampions: [],
  gameStartTime: 1642263542436,
  gameLength: 208
})

const _DEBUG_ = true;

export async function reactionPlayerDetails(msgReac: DiscordJs.MessageReaction) {
  _DEBUG_ && console.log(colors.bgYellow(`Entered ReactionPlayerDetails`))
  const LiveMatchData = ProcessdGamesMap.get(msgReac.message.id);
  if (!LiveMatchData){
    _DEBUG_ && console.log(colors.bgYellow(`LiveGame has not been processed yet, weird`))
    return
  }
  if (msgReac.emoji.name === null){
    _DEBUG_ && console.log(colors.bgYellow(`Emopji name null`))
    return
  }
    
  const index = getIndexFromEmoji(msgReac.emoji.name)
  _DEBUG_ && console.log(colors.bgYellow(`Index of Emoji, ${index}`))
  const participant = LiveMatchData?.participants[index-1];
  _DEBUG_ && console.log(colors.bgYellow(`Participant, ${participant}`))
  if(!participant) return 
  const embed = await createEmbedPlayer(participant,msgReac.message.guild);
  _DEBUG_ && console.log(colors.bgYellow(`Got embed, ${embed}`))
  const TC = msgReac.message.channel;

  TC.send({
    embeds : [embed]
  })
  //const embed = createEmbedPlayer(participant);
  return;
}

/**
 * A Function that checks if a certain player is in a League of Legends Summoners
 * Rift Game and produces a MessageEmbed with ingame Live Data
 * @param newPresence : DiscordJs newPresence
 * @returns MessageEmbeds Discord.js
 */

export async function checkAndSend(newPresence: DiscordJs.Presence) {

  if (!isInLeagueClient(newPresence.activities)) return;

  _DEBUG_ && console.log(colors.magenta(`In checkAndSend: Entered checkAndSend with ${newPresence.user?.username}`))
  const prenup = await preCheck(newPresence);
  if (!prenup) {
    console.log(colors.magenta(`Exited preCheck with no succes!`));
    return;
  }
  console.log(colors.magenta(`Exited precheck with success!`))
  const guild = newPresence.guild;
  const response = await getSummonerNameByDiscordId(newPresence.userId);
  const textChannel = guild?.channels.cache.find((channel) => {
    return channel.type === "GUILD_TEXT";
  }) as DiscordJs.TextChannel;
  if (!textChannel) return;
  const summonerName = response._summonerName;
  const server = response._server;

  //fetch Player data
  _DEBUG_ && console.group(colors.magenta(`In checkAndSend: Ready to Fetch data for LiveMatchEmbed`))
  const userData = await getPlayer(server, summonerName);
  _DEBUG_ && console.log("-");
  if (!userData?.data) { _DEBUG_ && console.groupEnd(); return };
  const parsedData = userData.data;
  const id = parsedData.id;
  //console.log(id)
  //fetch liveGame data if there is already a liveGame
  const liveMatch = await getLiveGame(server, id);
  if (!liveMatch) { _DEBUG_ && console.groupEnd(); return };
  //console.log("LIVEMATCH DATA\n", liveMatch.data);
  //console.log(" ");
  //console.log('--------------')

  //check if game was already processed!
  const alreadyProccessed = LiveGamesProccessed.find(ell => ell === liveMatch.data.gameId);
  if (alreadyProccessed) {
    _DEBUG_ && console.groupEnd();
    return //game was allready processed!
  }
  //getLiveMatchEmbed creates the Embed with the Data
  const responseEmbed = await getLiveMatchEmbed(
    liveMatch.data,
    server,
    summonerName
  );
  const messageSendByBot = await textChannel.send({
    embeds: [responseEmbed],
  });
  const liveMatchData: CurrentGameInfo = liveMatch.data;
  LiveGamesProccessed.push(liveMatchData.gameId.valueOf());
  ProcessdGamesMap.set(messageSendByBot.id, liveMatchData);
  //_DEBUG_ && console.group(liveMatch.data);
  //_DEBUG_ && console.groupEnd();

  _DEBUG_ && console.log(colors.magenta(`In checkAndSend: Game with id ${liveMatchData.gameId} added to Processed`));
  _DEBUG_ && console.log(colors.magenta(`Awaiting for 60 min Reaction for more Player Data as requested`))

  await addReact(messageSendByBot);
  /*    const filter = (reaction:any, user:any) => user.id === newPresence.userId
     messageSendByBot.awaitReactions({filter,max:10, time: 1000*60})
      .then() */

  _DEBUG_ && console.log(colors.magenta('In checkAndSend: Exiting: Succes for LiveMatchEmbed'));
  _DEBUG_ && console.groupEnd();
  _DEBUG_ && console.groupEnd()
  _DEBUG_ && console.groupEnd()
  _DEBUG_ && console.groupEnd()
}

async function isSub(userId: String, guildId: String): Promise<Boolean> {

  const user: IGuildSub | null = await SubModel.findOne({
    "_guildId": guildId,
    "_allSubscriptions._idDiscord": userId,
  });
  
  if (!user || user === null) {
    return false
  }
  //console.log(colors.magenta(`${user}`));
  let ret = false;
  user._allSubscriptions.forEach(entry => {
    if(entry._idDiscord === userId)
      ret = entry._subscription
  })
  return ret;
}

async function preCheck(newPresence: DiscordJs.Presence) {
  _DEBUG_ && console.log(colors.magenta(`Entered preCheck`))
  if (!newPresence.guild)
    return false;

  if (newPresence.activities.length === 0) return false;

  let activity: DiscordJs.Activity | null = null;
  newPresence.activities.forEach((element) => {
    if (element.name === "League of Legends" && element.state === "In Game")
      activity = element;
  });
  if (activity == null || activity === null) return false; //check if player is in a game if not return
  if (!(await isSub(newPresence.userId, newPresence.guild.id))) //check if User is subscripted
    return false;
  _DEBUG_ && console.log(colors.magenta('In checkAndSend: LiveGamesProccessed State:'), LiveGamesProccessed);
  const guild = newPresence.guild;
  if (!guild) return false;
  const textChannel = guild.channels.cache.find((channel) => {
    return channel.type === "GUILD_TEXT";
  }) as DiscordJs.TextChannel;
  if (!textChannel) return false;
  const response = await getSummonerNameByDiscordId(newPresence.userId);

  //check if user is in db to get Summoner name, if not
  //notify user to register summoner name
  if (!response) {
    textChannel.send({
      content: `Hey <@${newPresence.userId}>, please use the command /connectSummonerName <server> <summonerName> to inform \n me about your Summoner Name. In the Future it might be helpful ;)`,
    });
    return false;
  }
  _DEBUG_ && console.log(colors.magenta('In preCheck: all checks passed, ready to proceed'));
  return true;
}

async function addReact(messageSendByBot: DiscordJs.Message) {
  messageSendByBot.react('1️⃣').then(r => {
    messageSendByBot.react('2️⃣').then(r => {
      messageSendByBot.react('3️⃣').then(r => {
        messageSendByBot.react('4️⃣').then(r => {
          messageSendByBot.react('5️⃣').then(r => {
            messageSendByBot.react('6️⃣').then(r => {
              messageSendByBot.react('7️⃣').then(r => {
                messageSendByBot.react('8️⃣').then(r => {
                  messageSendByBot.react('9️⃣').then(r => {
                    messageSendByBot.react('🔟')
                  })
                })
              })
            })
          })
        })
      })
    })
  })
}

function getIndexFromEmoji(emojiName: string) {
  switch (emojiName) {
    case '1️⃣': return 1
    case '2️⃣': return 2
    case '3️⃣': return 3
    case '4️⃣': return 4
    case '5️⃣': return 5
    case '6️⃣': return 6
    case '7️⃣': return 7
    case '8️⃣': return 8
    case '9️⃣': return 9
    case '🔟': return 10
    default: return -1
  }
}
