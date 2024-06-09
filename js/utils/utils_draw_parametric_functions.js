import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

export function draw_2d_function(engine, function_to_draw, domain = null, samples = null, color = 0x000000) {
    function update() {
        // Get viewing space dimensions
        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight;

        // If the domain is not preset, set it to fill the viewing space
        let curr_domain = domain;
        if (domain == null) {
            curr_domain = [-viewWidth / 2, viewWidth / 2];
        }

        // Set default sample number
        let curr_samples = samples;
        if (samples == null) {
            curr_samples = 10 * Math.ceil(curr_domain[1] - curr_domain[0]);
        }

        const step = (curr_domain[1] - curr_domain[0]) / curr_samples;
        let p1, p2;
        for (let i = 0; i < curr_samples; i++) {
            let x1 = curr_domain[0] + i * step;
            let x2 = curr_domain[0] + (i + 1) * step;

            p1 = [x1, function_to_draw(x1)];
            p2 = [x2, function_to_draw(x2)];

            engine.draw_debug_line(p1, p2, true, 0.01, color);
        }
    }
    update();

    // Return the update function
    return {
        update: update
    };
}


function createParameterization(function_to_draw, width_segments, height_segments, domain) {
    return new ParametricGeometry((u, v, target) => {
        const x = domain[0][0] + u * (domain[0][1] - domain[0][0]);
        const y = domain[1][0] + v * (domain[1][1] - domain[1][0]);
        const z = function_to_draw(x, y);
        target.set(x, z, y); // up direction is y
    }, width_segments, height_segments);
}

function calculateVisibleDomain(camera, z_dist) {
    const frustumHeight = Math.abs(2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * z_dist);
    const frustumWidth = Math.abs(frustumHeight * camera.aspect);
    const domainX = [-frustumWidth / 2, frustumWidth / 2];
    const domainY = [-frustumHeight / 2, frustumHeight / 2];
    return [domainX, domainY];
}

export function draw_3d_function(engine, function_to_draw, width_segments = null, height_segments = null, domain = null, color = 0x00ffff) {
    let mesh;

    function update() {
        let z_dist = engine.camera.position.z;

        // Calculate domain based on the camera frustum
        let curr_domain = domain;
        if (domain == null) {
            curr_domain = calculateVisibleDomain(engine.camera, z_dist);
        }

        // Set default sample number for widthSegments and heightSegments
        let curr_width_segments = width_segments;
        let curr_height_segments= height_segments;
        if (width_segments == null) {
            curr_width_segments = 10 * Math.ceil(curr_domain[0][1] - curr_domain[0][0]);
        }
        if (height_segments == null) {
            curr_height_segments = 10 * Math.ceil(curr_domain[0][1] - curr_domain[0][0]);
        }

        if (mesh) {
            engine.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        }

        const geometry = createParameterization(function_to_draw, curr_width_segments, curr_height_segments, curr_domain);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.5
        });
        mesh = new THREE.Mesh(geometry, material);

        engine.scene.add(mesh);
    }

    return {
        update: update
    };
}

