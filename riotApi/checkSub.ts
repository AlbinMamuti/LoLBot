import { Client, User } from "discord.js";
import { IGuildSub, SubModel } from "../models/subscription";


export async function initialSetup(client: Client) {
    console.log("Entered initialSetup")
    const allGuildsOAuth = await client.guilds.fetch();
    const allGuilds = await Promise.all(allGuildsOAuth.map(entry => entry.fetch()))
    
    const usersMap:Map<String,User[]> = new Map();

    await Promise.all(allGuilds.map(async guild => {
        console.group(`For Guild with id ${guild.name} fetching users`);
        const users = await guild.members.fetch();
        const d : IGuildSub | null = await SubModel.findOne({
            "_guildId": guild.id,
        })
        //console.log(d)
        users.forEach((user) => {
            const userId = user.id
            const maybeIn = d?._allSubscriptions.filter(docObj => {
                docObj._idDiscord === userId
            })
            if(!(!maybeIn || maybeIn.length === 0))
                return;
            console.log(user.nickname, user.id, ": Was missing now beein inserted")
            d?._allSubscriptions.push({
                _guildId: guild.id,
                _idDiscord: userId,
                _subscription: false,
            })
        })
        //console.log(d, "Ready to safe")
        await d?.save();
    }))
    console.groupEnd();
    console.log("Exiting initialSetup")
}