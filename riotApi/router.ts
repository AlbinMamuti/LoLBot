import fetch from 'node-fetch'
import dotenv from 'dotenv'
import https from 'https'
import axios from 'axios'
//import champions from './champion.json'
import summonerNameSchema from '../models/usernames'
import maps from './maps.json'
import { CurrentGameInfo, LeagueEntryDTO } from './ApiInterfaces/ApiInterfaces'

dotenv.config()
const getVersion = async () => { try { return (await axios.get('https://ddragon.leagueoflegends.com/api/versions.json')).data[0] } catch (err) { } };
//const currVersion = await getVersion();
let currVersion: string
let champions: any
const getChampions = async () => { try { return await axios.get(`http://ddragon.leagueoflegends.com/cdn/${currVersion}/data/en_US/champion.json`) } catch (err) { console.log(err) } };
//const champions = await getChampions();

export async function getSummonerNameByDiscordId(discordId: String) {
    const lolName = await summonerNameSchema.findById({ _id: discordId });
    //console.log(lolName);
    return lolName;
}

export async function getChampionById(championId: string) {
    if (!currVersion)
        currVersion = await getVersion()
    if (!champions) {
        champions = (await getChampions())?.data;
    }
    var championsObj: string
    for (championsObj in champions.data) {
        //@ts-ignore
        const id: String = champions.data[championsObj]['key']
        const idNumber: number = +id
        const championIdNumber: number = +championId
        //@ts-ignore
        const name: String = champions.data[championsObj]['id']
        if (idNumber === championIdNumber) {
            return name
        }
    }
    return ' '
}
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
    catch (err: any) {
        console.group("ERROR GETALLRANKDES:\n")
        console.error(err.config.url, "\n", err.response)
        console.groupEnd()
    }
}

export async function getLiveGame(server: String, summonerPUUID: String,) {
    try {
        const responseData = await axios.get(calcAdress(server, summonerPUUID, 'liveMatch'))
        return responseData
    } catch (err: any) {
        console.group("ERROR GETLIVEGAMES:\n")
        console.error(err.config.url, "\n", err.response.status)
        console.groupEnd()
    }
}

export function getMapById(searchMapId: number) {
    const resp = maps.find((entry: any) => { entry.mapId === searchMapId })
    return resp
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
    catch (err: any) {
        console.group("ERROR GETMATCHPLAYERS:\n")
        console.error(err.config.url, "\n", err.response.status)
        console.groupEnd()
    }
}
export async function getMatchData(matchID: String) {
    try {
        const responseData = await axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/${matchID}?api_key=${process.env.RIOTAPIKEY}`)
        return responseData
    } catch (err: any) {
        console.group("ERROR GETMATCHDATA:\n")
        console.error(err.config.url, "\n", err.response.status)
        console.groupEnd()
    }
}

export async function getRanked(server: String, summonerID: String,) {
    try {
        const responseData = await axios.get(calcAdress(server, summonerID, 'rank'))
        return responseData
    } catch (err: any) {
        console.group("ERROR GETRANKED:\n")
        console.error(err.config.url, "\n", err.response.status)
        console.groupEnd()
    }
}
export async function getPlayer(server: String, summonerName: String,) {
    try {
        const responseData = await axios.get(calcAdress(server, summonerName, 'summoner'))
        return responseData
    } catch (err: any) {
        console.group("ERROR GETPLAYER:\n")
        console.error(err.config.url, "\n", err.response.status)
        console.groupEnd()
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