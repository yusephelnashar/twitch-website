import * as tmi from "tmi.js";
import {Game} from "./games/game";

export class Twitch {
    private client : tmi.Client | null = null;
    private inputStream : HTMLInputElement;
    private inputKeyword : HTMLInputElement;
    private connectButton : HTMLButtonElement;
    private connectButtonDebounce : number = Date.now();
    private keywordDebounce : number = Date.now();
    private static prevStreamerName : string | null = null;
    private static timeContainer : HTMLDivElement = document.getElementsByClassName("time-container").item(0) as HTMLDivElement;

    constructor() {
        this.inputStream = document.getElementById("input-stream") as HTMLInputElement;
        this.inputKeyword = document.getElementById("input-keyword") as HTMLInputElement;
        this.connectButton = document.getElementById("connect-button") as HTMLButtonElement;

        this.initEventListeners();
    }

    private initEventListeners() : void {
        this.connectButton.addEventListener("click", () => this.handleConnect());
        this.inputKeyword.addEventListener("input", () => {
            this.keywordDebounce = Date.now();

            setTimeout(() => {
                if ((Date.now() - this.keywordDebounce) >= 1000) {
                    localStorage.setItem("keyword", this.inputKeyword.value);
                    
                    this.inputKeyword.classList.add("keyword-set");
                    setTimeout(() => {
                        this.inputKeyword.classList.remove("keyword-set");
                    }, 1000)
                }
            }, 1000)
        })
    }

    public static displayTime(time : number) : void {
        Twitch.timeContainer.innerHTML = `Time: ${time} seconds.`;
        Twitch.timeContainer.classList.add("time-display");

        setTimeout(() => {
            Twitch.timeContainer.classList.remove("time-display");
            game.resetDebounce();
        }, 5000)
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
            this.inputStream.classList.add("invalid-input-animate");

            setTimeout(() => {
                this.inputStream.classList.remove("invalid-input-animate");
            }, 250)

            return;
        }

        if (streamerName == Twitch.prevStreamerName) {
            return;
        }

        if (this.client) {
            await this.client.disconnect();
        }

        this.client = new tmi.Client({
            channels: [streamerName]
        });

        this.client.on("message", (channel: string, tags: tmi.ChatUserstate, message: string, self: boolean) : void => {
            const regex : RegExp = new RegExp(`(${localStorage.getItem("keyword")})`);

            if (regex.test(message.toLowerCase())) {
                game.spawnObstacle();
            }
        });

        try {
            await this.client.connect();

            Twitch.prevStreamerName = streamerName;
            this.inputStream.classList.add("valid-input-animate");

            setTimeout(() => {
                this.inputStream.classList.remove("valid-input-animate");
            }, 250)
        } catch (error) {
            this.inputStream.classList.add("invalid-input-animate");
            
            setTimeout(() => {
                this.inputStream.classList.remove("invalid-input-animate");
            }, 250)
        }
    }
}

const game : Game = new Game();
new Twitch();
