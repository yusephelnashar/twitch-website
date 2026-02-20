import * as THREE from "three";

export class Platform {
    private model : THREE.Group = new THREE.Group();
    private vertexShaderSrc : string = (document.getElementById("platformVShader") as HTMLScriptElement).textContent;
    private fragmentShaderSrc : string = (document.getElementById("platformFShader") as HTMLScriptElement).textContent;
    private canvasSize = new THREE.Vector2(document.getElementById("game-canvas")?.clientWidth, document.getElementById("game-canvas")?.clientWidth);

    constructor(x : number, y : number, z : number, width : number, height : number, depth : number) {
        const boxGeo = new THREE.BoxGeometry(width, height, depth, 50, 50, 50);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: {value: 0.0},
                playerPosition: {value: new THREE.Vector3(0.0, 0.0, 0.0)},
                resolution: {value: this.canvasSize}
            },

            vertexShader: this.vertexShaderSrc,
            fragmentShader: this.fragmentShaderSrc,
        })
        
        const plane = new THREE.Mesh(boxGeo, material);
        this.model.add(plane);
        this.model.position.set(x, y, z);
    }

    public getModel() : THREE.Group {
        return this.model;
    }

    public getObjects() : Array<THREE.Object3D> {
        const returnArray : Array<THREE.Object3D> = new Array();

        this.getModel().traverse((object : THREE.Object3D) => {
            returnArray.push(object);
        })

        return returnArray;
    }
}
