
declare interface SummonerDTO {
    accountId: String,
    profileIconId: Number,
    revisionDate: Number,
    name: String,
    id: String,
    puuid: String,
    summonerLevel: Number,
}
declare interface LeagueEntryDTO {
    leagueId: String,
    summonerId: String,
    summonerName: String,
    queueType: String,
    tier: String,
    rank: String,
    leaguePoints: Number,
    wins: Number,
    losses: Number,
    hotStreak: Boolean,
    veteran: Boolean,
    freshBlood: Boolean,
    inactive: Boolean,
    miniSeries: MiniSeriesDTO,
}
declare interface MiniSeriesDTO {
    losses: Number,
    progress: String,
    target: Number,
    wins: Number
}
declare interface CurrentGameInfo {
    gameId: Number,
    gameType: String,
    gameStartTime: Number,
    mapId: Number,
    gameLength: Number,
    platformId: String,
    gameMode: String,
    bannedChampions: Array<BannedChampion>,
    gameQueueConfigId: Observer,
    participants: Array<CurrentGameParticipant>
}
declare interface BannedChampion {
    pickturn: Number,
    championId: Number,
    teamId: Number,
}
declare interface Observer {
    encryptionKey: String,
}
declare interface CurrentGameParticipant {
    championId: Number,
    perks: Perks,
    profileIconId: Number,
    bot: Boolean,
    teamId: Number,
    summonerName: String,
    summonerId: String,
    spell1Id: Number,
    spell2Id: Number,
    gameCustomizationObjects: Array<GameCustomizationObject>
}
declare interface Perks {
    perkIds: Array<Number>,
    perkStyle: Number,
    perkSubStyle: Number
}
declare interface GameCustomizationObject {
    category: String,
    content: String,
}

export { SummonerDTO, LeagueEntryDTO, MiniSeriesDTO, CurrentGameInfo, CurrentGameParticipant, Perks, GameCustomizationObject, Observer, BannedChampion, }