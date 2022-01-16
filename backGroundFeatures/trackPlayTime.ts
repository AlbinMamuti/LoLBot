
import DiscordJs from 'discord.js'
import timePlayed from '../models/timePlayed';
import colors from 'colors';

const PlayerInGame = new Map<String, DiscordJs.Activity>();
const _DEBUG_ = true;

/**
 * Function to track League Ingame time for Discord Users who subscribed for this Feature
 * @param presence : DiscordJS.Presence 
 * @returns void
 */
export async function track(presence: DiscordJs.Presence) {
    const userId = presence.userId;
    if (!presence.guild) return;
    const guildId = presence.guild.id;
    if (!isInLeagueClient(presence.activities)) return;

    _DEBUG_ && console.group(colors.cyan('In Track: Entered Function track'))

    if (!isInGame(presence.activities)) {
        _DEBUG_ && console.group(colors.cyan(`In Track: user ${presence.user?.username} is not in a Game`))
        if (PlayerInGame.has(userId)) { //already in list, so Game has ended now
            _DEBUG_ && console.group(colors.cyan('In Track:'), 'Player is in PlayerInGame')
            const game: DiscordJs.Activity | undefined = PlayerInGame.get(userId);
            //_DEBUG_ && console.log(colors.cyan('In Track: const game: '), game)
            if (!game || !game.timestamps || !game.timestamps.start) {
                _DEBUG_ && console.warn(colors.cyan('In Track:'), ' Crash');
                _DEBUG_ && console.groupEnd();
                _DEBUG_ && console.groupEnd();
                _DEBUG_ && console.groupEnd();
                return;
            }
            const start: Date = game.timestamps.start;
            const end: Date = new Date();
            const gameDuration = end.getTime() - start.getTime();
            await saveGameDuration(gameDuration, userId, guildId);
            PlayerInGame.delete(userId);
            _DEBUG_ && console.log(colors.cyan('In Track: Player deleted and added to DB'))
            _DEBUG_ && console.groupEnd();
        }
        _DEBUG_ && console.groupEnd()
    }
    else {
        _DEBUG_ && console.group(colors.cyan(`In Track: ${presence.user?.username} is ingame`))
        if (!PlayerInGame.has(userId)) {
            const lolActivity = presence.activities.find(activity => activity.name === 'League of Legends');
            if (!lolActivity) {
                _DEBUG_ && console.error(colors.cyan('In Track:'), ' Error in function track file: trackPlayTime.ts, Line 26: Player is ingame but no Activity shows up!');
                return;
            }

            PlayerInGame.set(userId, lolActivity);
            _DEBUG_ && console.log(colors.cyan('In Track: Player has been added to PlayerInGame'))
        }
        _DEBUG_ && console.groupEnd()
    }
    _DEBUG_ && console.groupEnd()
    _DEBUG_ && console.groupEnd()
    _DEBUG_ && console.groupEnd()
}




/**
 * Saves gameDuration for specific user
 * @param gameDuration 
 * @param userId 
 * @param guildId 
 */
async function saveGameDuration(gameDuration: number, userId: String, guildId: String) {
    _DEBUG_ && console.group(colors.cyan('Entered saveGameDuration with args'), gameDuration, userId, guildId)
    await timePlayed.findByIdAndUpdate({
        _id: userId,
    }, {
        _id: userId,
        _guildId: guildId,
        $inc: {
            _timePlayedMS: gameDuration,
        },
        _sinceTimeStamp: Date.now(),
    }, {
        upsert: true,
    });
    _DEBUG_ && console.group(colors.cyan('updated value in DB'))
}

function isInGame(activities: Array<DiscordJs.Activity>) {
    let inGame = false;
    activities.forEach(activity => {
        if (activity.name === 'League of Legends' && activity.state === 'In Game')
            inGame = true;
    })
    return inGame;
}

export function isInLeagueClient(activities: Array<DiscordJs.Activity>) {
    let inClient = false;
    activities.forEach(activity => {
        if (activity.name === 'League of Legends')
            inClient = true;
    })
    return inClient;
}