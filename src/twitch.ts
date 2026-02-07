import * as tmi from "tmi.js";

class Twitch {
    private client : tmi.Client | null = null;
    private inputStream : HTMLInputElement;
    private connectButton : HTMLButtonElement;
    private connectButtonDebounce : number = Date.now();
    private static prevStreamerName : string | null = null;

    constructor() {
        this.inputStream = document.getElementById("input-stream") as HTMLInputElement;
        this.connectButton = document.getElementById("connect-button") as HTMLButtonElement;

        this.initEventListeners();
    }

    private initEventListeners() : void {
        this.connectButton.addEventListener("click", () => this.handleConnect());
    }

    private async handleConnect() : Promise<void> {
        if ((Date.now() - this.connectButtonDebounce) < 300) return;

        this.connectButtonDebounce = Date.now();
        this.connectButton.classList.add("click-animate");
        
        setTimeout(() => {
            this.connectButton.classList.remove("click-animate");
        }, 250)

        const streamerName : string = this.inputStream.value.trim().toLowerCase();

        // Change later on to UI
        if (!streamerName) {
            alert("Enter a streamer name!");
            return;
        }

        if (streamerName == Twitch.prevStreamerName) {
            alert("Already connected to streamer!");
            return;
        }

        if (this.client) {
            await this.client.disconnect();
            console.log("Disconnected!");
        }

        this.client = new tmi.Client({
            channels: [streamerName]
        });

        this.client.on("message", (channel: string, tags: tmi.ChatUserstate, message: string, self: boolean) : void => {
            console.log(`${tags.username} said ${message}`);
        });

        try {
            await this.client.connect();
            Twitch.prevStreamerName = streamerName;
            console.log("Connected!");
        } catch (error) {
            console.error("Could not connect to Twitch: ", error);
        }
    }
}

new Twitch();
