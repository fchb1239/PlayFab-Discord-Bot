// You can find this by going to your playfab dashboard and simply looking in the URL: https://developer.playfab.com/en-us/MYPLAYFABID/players
const PlayFabId = "";
// https://docs.microsoft.com/en-us/gaming/playfab/gamemanager/secret-key-management
const X_SecretKey = "";
// Put in role IDs here, like so ["MyId1", "MyId2", "MyId3"];
const allowedRoles = [""];
// For example !ban, +ban, -ban, ?ban and so on
const prefix = "+";
// The Discord bot token, this is used to log in to the bot with
const token = "";

// The libraries that are required are discord.js and xhr2, install by running "npm install discord.js" and "npm install xhr2"
const { Client, GatewayIntentBits, } = require('discord.js');
var XMLHttpRequest = require('xhr2');

// The intents because discord is dumb
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

// When a message gets sent, this gets called
client.on('messageCreate', (message) => {

    // Idiot checker
    if(prefix == "" && message.author != client.user){
        message.channel.send("No prefix selected");
        return;
    }

    // Checks if the user who sent it is not this bot and if the message starts with your prefix
    if(message.author == client.user || !message.content.startsWith(prefix)){
        return;
    }


    // Checks if you have permissions to use the command
    let isAllowed = false;
    allowedRoles.forEach(function(item, index){
        if(message.member.roles.cache.has(item)){
            isAllowed = true;
        }
    });


    // The actual command
    if(isAllowed){
        console.log("Banning");
        try{
            var str = message.content.split(' ');

            const Http = new XMLHttpRequest();
            // When the request gets a response, unlike me trying to talk to females :()
            Http.onreadystatechange = function() {
                if(this.readyState == 4){
                    if (this.status == 200) {
                        console.log(this.responseText);
                        var json = JSON.parse(this.responseText);
                        message.channel.send("Successfully banned " + json.data.BanData[0].PlayFabId + " for \"" + json.data.BanData[0].Reason + "\".");
                    }
                    else{
                        console.log(this.responseText);
                        var json = JSON.parse(this.responseText);
                        message.channel.send("Error message: " + json.errorMessage);
                    }
                }
            }
    
            var ss = message.content.slice(message.content.indexOf(str[1]) + str[1].length);
            Http.open("POST", 'https://' + PlayFabId + '.playfabapi.com/Admin/BanUsers');
            var request = {
                "Bans": [
                    {
                        "DurationInHours": str[2],
                        "IPAddress": "",
                        "MACAddress": "",
                        "PlayFabId": str[1],
                        "Reason": ss.slice(ss.indexOf(ss.split(' ')[1]) + ss.split(' ')[1].length + 1)
                    }
                ]
            }
            console.log("Sending request");
            Http.setRequestHeader("X-SecretKey", X_SecretKey);
            Http.setRequestHeader("Content-Type", "application/json");
            Http.send(JSON.stringify(request));
        }
        catch (error){
            console.log(error);
            message.channel.send("Something went wrong.")
        }
    }
    else{
        console.log(message.author.id + " just tried banning someone, they don't have the correct role(s)");
    }
});


console.log("Attempting to log in");
client.login(token);