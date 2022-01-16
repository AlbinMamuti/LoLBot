import { Client } from "discord.js";
import colors from 'colors'

export async function installEmojis(client: Client) {
    console.log(colors.bgCyan('Trying to install required emojis on all Guild'));
    const allGuildsOAuth = await client.guilds.fetch();
    const allGuilds = await Promise.all(allGuildsOAuth.map(entry => entry.fetch()))
    
    
    await Promise.all(allGuilds.map(async guild => {
        const guildEmojiManager = guild.emojis;
        const CM_LEVEL_EMOJIS: String[] = []
        const TIER_EMOJIS: String[] = []
        const tiers = ['Bronze','Challenger', 'Diamond', 'Gold', 'Grandmaster','Iron','Master','Platinum','Silver']
        const allEmojis = await guildEmojiManager.fetch().then(emojis => {
            emojis.forEach(emoji => {
                if(!emoji.name) return
                if(emoji.name?.slice(0,-1) === 'CM_Level_'){
                    CM_LEVEL_EMOJIS.push(emoji.name);
                }
                if(tiers.includes(emoji.name))
                    TIER_EMOJIS.push(emoji.name)
            })
        })

        
        for (let i = 1; i < 8; i++) {
            console.log(CM_LEVEL_EMOJIS.includes(`CM_LEVEL_${i}`))
            if(CM_LEVEL_EMOJIS.includes(`CM_LEVEL_${i}`)) continue
            
            const emoji = await guildEmojiManager.create(
                `./iamgeFiles/championMastery/Champion_Mastery_Level_${i}_Flair.png`,
                `CM_Level_${i}`
            )
            console.log(colors.bgCyan(`Emoji added: ${ emoji.name}`))
        }
        
        
        let i = 1;
        tiers.forEach(tier => {
            if(TIER_EMOJIS.includes(tier)) return
            
            guildEmojiManager.create(
                `./iamgeFiles/ranks/Emblem_${tier}_${i}_11zon.png`,
                `${tier}`
            ).then(emoji => console.log(colors.bgCyan(`Emoji added: ${ emoji.name}`)))
            .catch(err => console.log(err))
            i++;
        })
        
        
    }))
    //console.log(allGuilds)
    console.log(colors.bgCyan('Exiting installEmojis'));
}
function timeout(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}