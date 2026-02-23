import * as THREE from "three";
import * as Player from "./player";

export class Obstacle {
    public static obstacles : Array<Obstacle> = new Array();

    private model : THREE.Group = new THREE.Group();
    private mesh : THREE.Mesh;

    private boundingBox : THREE.Box3 = new THREE.Box3();
    private velocity : THREE.Vector3 = new THREE.Vector3(0, 0, 1.5);

    constructor(x : number, width : number = 4, height : number = 4, depth : number = 8) {
        this.mesh = this.initModel(width, height, depth);
        this.model.position.set(x, 5, -265);
        this.model.updateMatrixWorld();
        this.boundingBox.setFromObject(this.model);
    }

    private initModel(width : number, height : number, depth : number) : THREE.Mesh {
        const boxGeo = new THREE.BoxGeometry(width, height, depth);
        const color : THREE.Color = new THREE.Color().setRGB(Math.random(), Math.random(), Math.random());
        const material = new THREE.MeshPhongMaterial({
            color: color
        });

        const obstacle = new THREE.Mesh(boxGeo, material);

        obstacle.onBeforeRender = () => {
            obstacle.userData.inView = true;
        }

        this.model.add(obstacle);
        return obstacle;
    }

    public getModel() : THREE.Group {
        return this.model;
    }

    public getMesh() : THREE.Mesh {
        return this.mesh;
    }

    public collide(player : Player.Player) : boolean {
        const playerBox : THREE.Box3 = player.getBoundingBox();

        if (this.boundingBox.intersectsBox(playerBox)) {
            return true;
        }

        return false;
    }

    public update(dt : number) : void {
        this.model.position.add(this.velocity.clone().multiplyScalar(dt));
        this.model.updateMatrixWorld();
        this.boundingBox.setFromObject(this.model);
    }
}
