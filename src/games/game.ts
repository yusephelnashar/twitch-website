import * as THREE from "three";
import * as Player from "./player"
import * as Platform from "./platform"
import * as Obstacle from "./obstacle";
import * as Twitch from "../twitch";

const loader : THREE.TextureLoader = new THREE.TextureLoader();
const playerTextureUrl = new URL("./images/player.png", import.meta.url).href;
const playerTexture = loader.load(playerTextureUrl);

export class Game {
    private static player : Player.Player = new Player.Player(0, 4, -20, 4, 0xFF65FF, playerTexture);
    private static platform : Platform.Platform = new Platform.Platform(0, 0, 0, 500, 0.5, 500);
    private static keyMap : Map<string, boolean> = new Map();

    private static canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    private static width : number = Game.canvas ? Game.canvas.clientWidth : 0;
    private static height : number = Game.canvas ? Game.canvas.clientHeight : 0;
    
    private scene : THREE.Scene;
    private camera : THREE.PerspectiveCamera;
    private renderer : THREE.WebGLRenderer;
    private clock : THREE.Clock = new THREE.Clock();

    constructor() {
        Game.canvas.addEventListener("focus", () => {
            Game.canvas.classList.add("focus-animate");

            setTimeout(() => {
                Game.canvas.classList.remove("focus-animate");
            }, 1000)
        })

        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(70, Game.width / Game.height, 0.1, 1000);
        this.camera.position.set(0, 50, 0);
        this.camera.rotateX(-45 * (Math.PI / 180));
        this.camera.aspect = Game.width / Game.height;
        this.camera.updateProjectionMatrix();
        
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
        this.scene.add(Game.platform.getModel());
    }

    private initEvents() : void {
        document.addEventListener("keydown", (event : KeyboardEvent) : void => {
            if (!(document.activeElement === Game.canvas)) return;
            Game.keyMap.set(event.key, true);
        })

        document.addEventListener("keyup", (event : KeyboardEvent) : void => {
            Game.keyMap.delete(event.key);
        })
    }

    public spawnObstacle() : void {
        const min = new THREE.Vector3().setComponent(0, Player.Player.borderMin.x);
        const max = new THREE.Vector3().setComponent(0, Player.Player.borderMax.x);
        const lerped = min.lerp(max, Math.random());

        Obstacle.Obstacle.obstacles.push(new Obstacle.Obstacle(lerped.x));
        
        Obstacle.Obstacle.obstacles.forEach((value : Obstacle.Obstacle, index : number) => {
            this.scene.add(value.getModel());
        })
    }

    public animate = () : void => {
        const dt = this.clock.getDelta() / (1 / 60);
        Game.player.update(Game.keyMap, dt);

        for (const object of Game.platform.getObjects()) {
            if (object instanceof THREE.Mesh) {
                object.material.uniforms.time.value = this.clock.getElapsedTime();
                object.material.uniforms.playerPosition.value = Game.player.getModel().position;
            }
        }

        Obstacle.Obstacle.obstacles.forEach((value : Obstacle.Obstacle) => {
            value.update(dt);
            value.getMesh().userData.inView = false;
        })

        this.renderer.render(this.scene, this.camera);

        Obstacle.Obstacle.obstacles.forEach((value : Obstacle.Obstacle, index : number) => {
            if (!value.getMesh().userData.inView) {
                Obstacle.Obstacle.obstacles.splice(index, 1);
            }
        })

        Obstacle.Obstacle.obstacles.forEach((value : Obstacle.Obstacle) => {
            if (value.collide(Game.player)) {
                console.log("COLLIDED!");
            }
        })
    }
}
