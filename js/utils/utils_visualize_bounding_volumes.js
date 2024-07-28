import {add_matrix_matrix, transpose} from "./utils_math.js";
import * as THREE from 'three';

export function get_bounding_sphere_radius(boundingConfig, i) {
    if (boundingConfig.full_bounding_spheres && boundingConfig.full_bounding_spheres[i]) {
        return boundingConfig.full_bounding_spheres[i].radius;
    } else {
        return 0;
    }
}

export function get_bounding_sphere_offset(boundingConfig, i) {
    if (boundingConfig.full_bounding_spheres && boundingConfig.full_bounding_spheres[i]) {
        return boundingConfig.full_bounding_spheres[i].offset_xyz;
    } else {
        return [0, 0, 0];
    }
}

export function get_obb_half_extents(boundingConfig, i) {
    if (boundingConfig.full_obbs && boundingConfig.full_obbs[i]) {
        return boundingConfig.full_obbs[i].half_extents;
    } else {
        return [0, 0, 0];
    }
}

export function get_obb_RPY(boundingConfig, i) {
    if (boundingConfig.full_obbs && boundingConfig.full_obbs[i]) {
        return boundingConfig.full_obbs[i].offset_rpy;
    } else {
        return [0, 0, 0];
    }
}

export function get_obb_offset(boundingConfig, i) {
    if (boundingConfig.full_obbs && boundingConfig.full_obbs[i]) {
        return boundingConfig.full_obbs[i].offset_xyz;
    } else {
        return [0, 0, 0];
    }
}

function get_RPY_from_matrix(rotationMatrix) {
    // Create a Matrix4 object and set its elements from the rotation matrix
    let matrix = new THREE.Matrix4();
    matrix.set(
        rotationMatrix[0], rotationMatrix[3], rotationMatrix[6], 0,
        rotationMatrix[1], rotationMatrix[4], rotationMatrix[7], 0,
        rotationMatrix[2], rotationMatrix[5], rotationMatrix[8], 0,
        0, 0, 0, 1
    );

    // Create a Quaternion from the Matrix4
    let quaternion = new THREE.Quaternion();
    quaternion.setFromRotationMatrix(matrix);

    // Convert the Quaternion to Euler angles
    let euler = new THREE.Euler();
    euler.setFromQuaternion(quaternion, 'XYZ'); // 'XYZ' order for roll, pitch, yaw

    // Extract the RPY values
    let roll = euler.x;
    let pitch = euler.y;
    let yaw = euler.z;

    return [roll, pitch, yaw];
}

function matrix_to_quaternion(R) {
    let flat_matrix = [
        R[0][0], R[0][1], R[0][2],
        R[1][0], R[1][1], R[1][2],
        R[2][0], R[2][1], R[2][2]
    ];

    // Create a Matrix4 object and set its elements from the rotation matrix
    let matrix = new THREE.Matrix4();
    matrix.set(
        flat_matrix[0], flat_matrix[3], flat_matrix[6], 0,
        flat_matrix[1], flat_matrix[4], flat_matrix[7], 0,
        flat_matrix[2], flat_matrix[5], flat_matrix[8], 0,
        0, 0, 0, 1
    );

    // Create a Quaternion from the Matrix4
    let quaternion = new THREE.Quaternion();
    quaternion.setFromRotationMatrix(matrix);
    return quaternion;
}

function apply_global_rotation(box, axis, angle) {
    const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);

    // Convert the position to world coordinates
    box.updateMatrixWorld(true);
    const position = new THREE.Vector3().setFromMatrixPosition(box.matrixWorld);

    // Apply the rotation
    position.applyQuaternion(quaternion);

    // Update the box's position and rotation
    box.position.copy(position);
    box.applyQuaternion(quaternion);
}

export function draw_obb(engine, boundingConfig, i, R, t) {
    let center_point = add_matrix_matrix(t, get_obb_offset(boundingConfig, i));
    let half_extents = get_obb_half_extents(boundingConfig, i);
    let offset_rpy = get_obb_RPY(boundingConfig, i);

    let quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(offset_rpy[0], offset_rpy[1], offset_rpy[2]));

    let quaternion1 = matrix_to_quaternion(transpose(R));

    let combined_quaternion = new THREE.Quaternion();
    combined_quaternion.multiplyQuaternions(quaternion1, quaternion);

    let box = engine.draw_debug_box(t, half_extents, combined_quaternion);
    apply_global_rotation(box, new THREE.Vector3(1, 0, 0), - Math.PI / 2);
}
