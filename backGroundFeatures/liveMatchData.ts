import DiscordJs from "discord.js";
import subscription from "../models/subscription";
import { getLiveMatchEmbed } from "../riotApi/liveMatch";
import {
  getLiveGame,
  getPlayer,
  getSummonerNameByDiscordId,
} from "../riotApi/router";
//Function to automatically report to the DiscordUser their ingame
//live Data on a League of Legends Game, it will only work if they
//added their SummonerName or told the LolBot their SummonerName

//var ApplicatedUsers: Array<ApplicatedLeaguePlayers> = [];

var LeagueUserCache: Array<LeaguePlayer> = [
  { userId: "1", timeStamp: 999999999999999999999999 },
];
const delay: number = 120000;

/**
 * A Function that checks if a certain player is in a League of Legends Summoners
 * Rift Game and produces a MessageEmbed with ingame Live Data
 * @param newPresence : DiscordJs newPresence
 * @returns MessageEmbeds Discord.js
 */

export async function checkAndSend(newPresence: DiscordJs.Presence) {
  if (!newPresence.guild)
    return

  if (newPresence.activities.length === 0) return;
  console.log(newPresence.activities)
  let activity: DiscordJs.Activity | null = null;
  newPresence.activities.forEach((element) => {
    if (element.name === "League of Legends" && element.state === "In Game")
      activity = element;
  });
  if (activity == null || activity === null) return; //check if player is in a game if not return
  if (!(await isSub(newPresence.userId, newPresence.guild.id))) //check if User is subscripted
    return;

  const guild = newPresence.guild;
  if (!guild) return;
  const textChannel = guild.channels.cache.find((channel) => {
    return channel.type === "GUILD_TEXT";
  }) as DiscordJs.TextChannel;
  if (!textChannel) return;
  const response = await getSummonerNameByDiscordId(newPresence.userId);

  //check if user is in db to get Summoner name, if not
  //notify user to register summoner name
  if (!response) {
    textChannel.send({
      content: `Hey <@${newPresence.userId}>, please use the command /connectSummonerName <server> <summonerName> to inform \n me about your Summoner Name. In the Future it might be helpful ;)`,
    });
    return;
  }


  //cooldown for each individual Member / League Player, we cache every single one and look if there creation
  //timestamp + delay is lower then Date.now()
  //console.log('---------- working --------')
  const temp: Array<LeaguePlayer> = LeagueUserCache.filter((Player) => {
    Player.userId === newPresence.userId;
  });
  if (temp.length !== 0) {
    const playerDelay = temp[0];
    if (playerDelay.timeStamp + delay > Date.now()) return; //return if cooldown is not finished
  }
  //delete player from cache
  LeagueUserCache = LeagueUserCache.filter((element) => {
    return element.userId !== newPresence.userId;
  });

  const summonerName = response._summonerName;
  const server = response._server;

  //fetch Player data
  const userData = await getPlayer(server, summonerName);
  if (!userData) return;
  const parsedData = userData.data;
  const id = parsedData.id;
  //console.log(id)
  //fetch liveGame data if there is already a liveGame
  const liveMatch = await getLiveGame(server, id);
  if (!liveMatch) return;
  //console.log('--------------')
  //cache current suspect for cooldown
  const LP: LeaguePlayer = {
    userId: newPresence.userId,
    timeStamp: Date.now(),
  };
  LeagueUserCache.push(LP);

  //getLiveMatchEmbed creates the Embed with the Data
  const responseEmbed = await getLiveMatchEmbed(
    liveMatch.data,
    server,
    summonerName
  );
  textChannel.send({
    embeds: [responseEmbed],
  });
}

//console.log(isSub('272691075959750656', '924639148659331103'));

async function isSub(userId: String, guildId: String): Promise<Boolean> {

  const user = await subscription.find({
    _id: userId,
    _guildId: guildId,
  });
  //console.log(user);
  if (!user || user.length === 0) {
    subscription.create({   // create new Entry with default sub to False, can be done async without await
      _id: userId,
      _idDiscord: userId,
      _subscription: false,
      _guildId: guildId,
    });
    return false;
  }
  console.log(user);
  return user[0]._subscription;
}


interface LeaguePlayer {
  userId: String;
  timeStamp: number;
}

//interface for DiscordUsers who dont want to get
//information of the LeagueBot, kind of like a Subscription
interface ApplicatedLeaguePlayers {
  userId: String;
  guildId: String;
  subscription: Boolean;
}
