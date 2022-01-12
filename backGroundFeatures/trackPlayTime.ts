
import DiscordJs from 'discord.js'
import timePlayed from '../models/timePlayed';

const PlayerInGame = new Map<String, DiscordJs.Activity>();

export async function track(presence: DiscordJs.Presence) {
    const userId = presence.userId;
    if (!presence.guild) return;
    const guildId = presence.guild.id;
    console.log('Current PlayerInGame: ', PlayerInGame);
    console.group('Entered Function track')
    if (!isInGame(presence.activities)) {
        console.group(`user ${presence.user?.username} is not in a Game`)
        if (PlayerInGame.has(userId)) { //already in list, so Game has ended now
            console.group('Player is in PlayerInGame')
            const game: DiscordJs.Activity | undefined = PlayerInGame.get(userId);
            console.log('const game: ', game)
            if (!game || !game.timestamps || !game.timestamps.start) {
                console.log('Crash');
                console.groupEnd();
                console.groupEnd();
                console.groupEnd();
                return;
            }
            const start: Date = game.timestamps.start;
            const end: Date = new Date();
            const gameDuration = end.getTime() - start.getTime();
            await saveGameDuration(gameDuration, userId, guildId);
            PlayerInGame.delete(userId);
            console.log('Player deleted and added to DB')
            console.groupEnd();
        }
        console.groupEnd()
    }
    else {
        console.group(`${presence.user?.username} is ingame`)
        if (!PlayerInGame.has(userId)) {
            const lolActivity = presence.activities.find(activity => activity.name === 'League of Legends');
            if (!lolActivity) {
                console.error('Error in function track file: trackPlayTime.ts, Line 26: Player is ingame but no Activity shows up!');
                return;
            }

            PlayerInGame.set(userId, lolActivity);
            console.log('Player has been added to PlayerInGame')
        }
        console.groupEnd()
    }
    console.groupEnd()
}

async function saveGameDuration(gameDuration: number, userId: String, guildId: String) {
    console.log('Entered saveGameDuration with args', gameDuration, userId, guildId)
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
    console.log('updated value')
}

function isInGame(activities: Array<DiscordJs.Activity>) {
    let inGame = false;
    activities.forEach(activity => {
        if (activity.name === 'League of Legends' && activity.state === 'In Game')
            inGame = true;
    })
    return inGame;
}