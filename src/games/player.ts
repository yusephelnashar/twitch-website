import * as THREE from "three";

export class Player {
    private terminalVelocity : number = 0.25;
    private acceleration : number = 0.01;
    private friction : number = 0.025;

    private model : THREE.Group = new THREE.Group();
    private velocity : THREE.Vector3 = new THREE.Vector3();

    private radius : number;

    constructor(x : number, y : number, z : number, radius : number, color : number, texture : THREE.Texture<HTMLImageElement>) {
        this.radius = radius;
        this.initModel(color, texture);
        this.model.position.set(x, y, z);
    }

    private initModel(color : number, texture : THREE.Texture<HTMLImageElement>) : void {
        const sphereGeo = new THREE.SphereGeometry(this.radius);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            map: texture
        });

        const sphere = new THREE.Mesh(sphereGeo, material);
        this.model.add(sphere);
    }

    public update(keyMap : Map<string, boolean>, dt : number) : void {
        const moveDirection = new THREE.Vector3();

        if (keyMap.get("w") && !keyMap.get("s")) {
            moveDirection.setComponent(2, -1);
        } else if (keyMap.get("s") && !keyMap.get("w")) {
            moveDirection.setComponent(2, 1);
        }

        if (keyMap.get("a") && !keyMap.get("d")) {
            moveDirection.setComponent(0, -1);
        } else if (keyMap.get("d") && !keyMap.get("a")) {
            moveDirection.setComponent(0, 1);
        }

        moveDirection.normalize();

        if (moveDirection.length() > 0) {
            this.velocity.add(moveDirection.multiplyScalar(this.acceleration * dt));
        }

        this.velocity.multiplyScalar(1 - (this.friction * dt));

        this.velocity.clamp(
            new THREE.Vector3(-this.terminalVelocity, 0, -this.terminalVelocity),
            new THREE.Vector3(this.terminalVelocity, 0, this.terminalVelocity)
        );

        const quaternion : THREE.Quaternion = new THREE.Quaternion();
        const angle = this.velocity.length() / this.radius;

        const rotationMatrix = new THREE.Vector3(this.velocity.z, 0, -this.velocity.x).normalize();
        quaternion.setFromAxisAngle(rotationMatrix, angle);
        
        this.model.quaternion.premultiply(quaternion);
        this.model.position.add(this.velocity);
    }

    public getModel() : THREE.Group {
        return this.model;
    }

    public getAcceleration() : number {
        return this.acceleration;
    }
}
