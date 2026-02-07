import * as THREE from "three";
import * as Player from "./player"

const loader : THREE.TextureLoader = new THREE.TextureLoader();
const playerTextureUrl = new URL("./images/player.png", import.meta.url).href;
const playerTexture = loader.load(playerTextureUrl);

class Game {
    private static player : Player.Player = new Player.Player(0, 0, -20, 4, 0xFF65FF, playerTexture);
    private static keyMap : Map<string, boolean> = new Map();

    private static canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    private static width : number = Game.canvas ? Game.canvas.clientWidth : 0;
    private static height : number = Game.canvas ? Game.canvas.clientHeight : 0;
    
    private scene : THREE.Scene;
    private camera : THREE.Camera;
    private renderer : THREE.WebGLRenderer;
    private clock : THREE.Clock = new THREE.Clock();

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, Game.width / Game.height, 0.1, 1000);
        this.camera.position.set(0, 50, 0);
        this.camera.rotateX(-45 * (Math.PI / 180));
        
        this.renderer = new THREE.WebGLRenderer({ canvas: Game.canvas });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(Game.width, Game.height);

        this.initEvents();
        this.initGame();

        this.renderer.setAnimationLoop(() => this.animate());
    }

    private initGame() : void {
        const light = new THREE.HemisphereLight(0xB1E1FF);

        this.scene.add(light);
        this.scene.add(Game.player.getModel());
    }

    private initEvents() : void {
        document.addEventListener("keydown", (event : KeyboardEvent) : void => {
            Game.keyMap.set(event.key, true);
        })

        document.addEventListener("keyup", (event : KeyboardEvent) : void => {
            Game.keyMap.delete(event.key);
        })
    }

    public animate = () : void => {
        const dt = this.clock.getDelta() / (1 / 60);
        Game.player.update(Game.keyMap, dt);

        this.renderer.render(this.scene, this.camera);
    }
}

const game : Game = new Game();
