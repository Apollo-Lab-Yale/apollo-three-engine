import * as THREE from 'three';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes';
import { distance_to_origin } from "./utils_draw_parametric_functions.js";

export class ImplicitFunctionGrapher {
    constructor(
        engine,
        func,
        cubes_num,
        domain_size,
        color = 0x00ffff,
    ) {
        this.engine = engine;
        this.func = func;
        this.cubes_num = cubes_num;
        this.domain_size = domain_size;
        this.color = color;
        this.marching_cubes = new MarchingCubes(cubes_num);
        this.marching_cubes.isolation = 0.0; // Need to add this line

        // Create a clipping plane at the specified height
        const clip_height = distance_to_origin(engine.camera) / 2;
        const clipping_plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), clip_height);
        engine.renderer.clippingPlanes = [clipping_plane];

        this.marching_cubes.material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide, // Make back faces visible
            clippingPlanes: [clipping_plane]  // Apply clipping plane
        });
        engine.scene.add(this.marching_cubes);
    }

    update_funciton_plot() {
        const half_size = this.domain_size / 2;
        for (let x = 0; x < this.cubes_num; x++) {
            for (let y = 0; y < this.cubes_num; y++) {
                for (let z = 0; z < this.cubes_num; z++) {
                    const fx = (x / (this.cubes_num - 1)) * this.domain_size - half_size;
                    console.log(fx);
                    const fy = (y / (this.cubes_num - 1)) * this.domain_size - half_size;
                    const fz = (z / (this.cubes_num - 1)) * this.domain_size - half_size;

                    const value = this.func(fx, fy, fz);
                    this.marching_cubes.setCell(x, y, z, value);
                }
            }
        }

        this.marching_cubes.update();
        this.marching_cubes.scale.set(this.domain_size, this.domain_size, this.domain_size);
    }
}