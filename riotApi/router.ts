import fetch from 'node-fetch'
import dotenv from 'dotenv'
import https from 'https'
import axios from 'axios'
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
    addres += encodeURIComponent(summonerName.trim())
    addres += '?api_key=' + process.env.RIOTAPIKEY
    return addres
}