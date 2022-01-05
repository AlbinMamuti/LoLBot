import fetch from 'node-fetch'
import dotenv from 'dotenv'
import https from 'https'
import axios from 'axios'

dotenv.config()

export async function getAllRankeds(server: String, summoners: Array<String>) {
    if (summoners.length != 10)
        return null
    try {
        const [MePlayer1, MePlayer2, MePlayer3, MePlayer4, MePlayer5
            , EnemyPlayer1, EnemyPlayer2, EnemyPlayer3, EnemyPlayer4, EnemyPlayer5]
            = await axios.all(
                [
                    axios.get(calcAdress(server, summoners[0], 'rank')),
                    axios.get(calcAdress(server, summoners[1], 'rank')),
                    axios.get(calcAdress(server, summoners[2], 'rank')),
                    axios.get(calcAdress(server, summoners[3], 'rank')),
                    axios.get(calcAdress(server, summoners[4], 'rank')),
                    axios.get(calcAdress(server, summoners[5], 'rank')),
                    axios.get(calcAdress(server, summoners[6], 'rank')),
                    axios.get(calcAdress(server, summoners[7], 'rank')),
                    axios.get(calcAdress(server, summoners[8], 'rank')),
                    axios.get(calcAdress(server, summoners[9], 'rank')),
                ]
            );
        return [MePlayer1, MePlayer2, MePlayer3, MePlayer4, MePlayer5
            , EnemyPlayer1, EnemyPlayer2, EnemyPlayer3, EnemyPlayer4, EnemyPlayer5];
    }
    catch (err) {
        console.log(err);
    }
}

export async function getLiveGame(server: String, summonerPUUID: String,) {
    const responseData = await axios.get(calcAdress(server, summonerPUUID, 'liveMatch'))
    return responseData
}

export async function getMapConstant() {
    const responseData = await axios.get("https://static.developer.riotgames.com/docs/lol/maps.json")
    return responseData
}

export async function getMatchPlayers(server: String, summonerPUUID: String) {
    try {
        const responseData = await axios.get(calcAdressWeird(server, summonerPUUID))
        return responseData
    }
    catch (err) {
        console.log(err)
    }
}
export async function getMatchData(matchID: String) {
    try {
        const responseData = await axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/${matchID}?api_key=${process.env.RIOTAPIKEY}`)
        return responseData
    } catch (error) {
        console.log(error)
    }
}

export async function getRanked(server: String, summonerID: String,) {
    try {
        const responseData = await axios.get(calcAdress(server, summonerID, 'rank'))
        return responseData
    } catch (err) {
        console.log(err)
    }
}
export async function getPlayer(server: String, summonerName: String,) {
    try {
        const responseData = await axios.get(calcAdress(server, summonerName, 'summoner'))
        return responseData
    } catch (err) {
        console.log(err)
    }
}
function calcAdressWeird(server: String, summonerPUUID: String) {
    server.toLocaleLowerCase()
    let addres = "https://"
    switch (server) {
        case 'euw': addres += 'europe'; break;
        case 'na': addres += 'america'; break;
        default: return '';
    }
    addres += '.api.riotgames.com/lol/match/v5/matches/by-puuid/'
    addres += summonerPUUID
    addres += '/ids?start=0&count=20&api_key='
    addres += process.env.RIOTAPIKEY
    return addres
}

function calcAdress(server: String, summonerName: String, type: String) {
    server.toLocaleLowerCase()
    let addres = "https://"
    switch (server) {
        case 'br': addres += 'br1'; break;
        case 'eun': addres += 'eun'; break;
        case 'euw': addres += 'euw1'; break;
        case 'jp': addres += 'jp1'; break;
        case 'kr': addres += 'kr'; break;
        case 'la': addres += 'la1'; break;
        case 'na': addres += 'na1'; break;
        case 'oc': addres += 'oc1'; break;
        case 'tr': addres += 'tr1'; break;
        case 'ru': addres += 'ru'; break;
    }
    if (type === 'summoner')
        addres += '.api.riotgames.com/lol/summoner/v4/summoners/by-name/'
    else if (type === 'rank')
        addres += '.api.riotgames.com/lol/league/v4/entries/by-summoner/'
    else if (type === 'liveMatch')
        addres += '.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/'
    addres += encodeURIComponent(summonerName.toString())
    addres += '?api_key=' + process.env.RIOTAPIKEY
    return addres
}