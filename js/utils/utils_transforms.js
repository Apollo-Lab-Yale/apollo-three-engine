/**
 * Author: Danny Rakita
 * Description: For CPSC-487-587 3D Spatial Modeling and Computing at Yale University
 */

import * as THREE from 'three';
import {z_up_set_object_position, z_up_set_object_rotation_from_quaternion} from "./utils_three.js";
import {unroll_matrix_to_list} from "./utils_math.js";
import {convert_scalar_vector_to_wxyz_quaternion} from "./utils_quaternion.js";

/**
 * Sets the pose of an object using an SE3 transformation matrix.
 *
 * @param {Object} engine - The rendering engine.
 * @param {number} object_idx - The index of the object.
 * @param {Array<Array<number>>} SE3_matrix - The SE3 transformation matrix.
 */
export function set_object_pose_from_SE3_matrix(engine, object_idx, SE3_matrix) {
    let s = SE3_matrix;
    let m = new THREE.Matrix4(s[0][0], s[0][1], s[0][2], s[0][3],
        s[1][0], s[1][1], s[1][2], s[1][3],
        s[2][0], s[2][1], s[2][2], s[2][3],
        s[3][0], s[3][1], s[3][2], s[3][3]);

    let q = new THREE.Quaternion();
    q.setFromRotationMatrix(m);
    z_up_set_object_rotation_from_quaternion(engine.mesh_objects[object_idx], q.w, q.x, q.y, q.z);
    z_up_set_object_rotation_from_quaternion(engine.mesh_object_wireframes[object_idx], q.w, q.x, q.y, q.z);

    z_up_set_object_position(engine.mesh_objects[object_idx], s[0][3], s[1][3], s[2][3]);
    z_up_set_object_position(engine.mesh_object_wireframes[object_idx], s[0][3], s[1][3], s[2][3]);
}

/**
 * Sets the pose of an object using an SO3 rotation matrix and a position vector.
 *
 * @param {Object} engine - The rendering engine.
 * @param {number} object_idx - The index of the object.
 * @param {Array<Array<number>>} SO3_matrix - The SO3 rotation matrix.
 * @param {Array<Array<number>>} position - The position vector.
 */
export function set_object_pose_from_SO3_matrix_and_position(engine, object_idx, SO3_matrix, position) {
    set_object_orientation_from_SO3_matrix(engine, object_idx, SO3_matrix);
    set_object_position_3D(engine, object_idx, position);
}

/**
 * Sets the pose of an object using a quaternion (in wxyz form) and a position vector.
 *
 * @param {Object} engine - The rendering engine.
 * @param {number} object_idx - The index of the object.
 * @param {Array<number>} wxyz_quaternion - The quaternion in wxyz form.
 * @param {Array<Array<number>>} position - The position vector.
 */
export function set_object_pose_from_wxyz_quaternion_and_position(engine, object_idx, wxyz_quaternion, position) {
    set_object_orientation_from_wxyz_quaternion(engine, object_idx, wxyz_quaternion);
    set_object_position_3D(engine, object_idx, position);
}

/**
 * Sets the pose of an object using a scalar-vector quaternion and a position vector.
 *
 * @param {Object} engine - The rendering engine.
 * @param {number} object_idx - The index of the object.
 * @param {Array} scalar_vector_quaternion - The quaternion in scalar-vector form.
 * @param {Array<Array<number>>} position - The position vector.
 */
export function set_object_pose_from_scalar_vector_quaternion_and_position(engine, object_idx, scalar_vector_quaternion, position) {
    set_object_orientation_from_scalar_vector_quaternion(engine, object_idx, scalar_vector_quaternion);
    set_object_position_3D(engine, object_idx, position);
}

/**
 * Sets the pose of an object using an SE2 transformation matrix.
 *
 * @param {Object} engine - The rendering engine.
 * @param {number} object_idx - The index of the object.
 * @param {Array<Array<number>>} SE2_matrix - The SE2 transformation matrix.
 */
export function set_object_pose_from_SE2_matrix(engine, object_idx, SE2_matrix) {
    let SE3_matrix = [[SE2_matrix[0][0], SE2_matrix[0][1], 0, SE2_matrix[0][2]],
                             [SE2_matrix[1][0], SE2_matrix[1][1], 0, SE2_matrix[1][2]],
                             [0, 0, 1, 0.01],
                             [0,0,0,1]];

    set_object_pose_from_SE3_matrix(engine, object_idx, SE3_matrix);
}

/**
 * Sets the pose of an object using an SO2 rotation matrix and a position vector.
 *
 * @param {Object} engine - The rendering engine.
 * @param {number} object_idx - The index of the object.
 * @param {Array<Array<number>>} SO2_matrix - The SO2 rotation matrix.
 * @param {Array<Array<number>>} position - The position vector.
 */
export function set_object_pose_from_SO2_matrix_and_position(engine, object_idx, SO2_matrix, position) {
    set_object_orientation_from_SO2_matrix(engine, object_idx, SO2_matrix);
    set_object_position_2D(engine, object_idx, position);
}

/**
 * Sets the orientation of an object using a quaternion (in wxyz form).
 *
 * @param {Object} engine - The rendering engine.
 * @param {number} object_idx - The index of the object.
 * @param {Array<number>} wxyz_quaternion - The quaternion in wxyz form.
 */
export function set_object_orientation_from_wxyz_quaternion(engine, object_idx, wxyz_quaternion) {
    let q = wxyz_quaternion;

    z_up_set_object_rotation_from_quaternion(engine.mesh_objects[object_idx], q[0], q[1], q[2], q[3]);
    z_up_set_object_rotation_from_quaternion(engine.mesh_object_wireframes[object_idx], q[0], q[1], q[2], q[3]);
}

/**
 * Sets the orientation of an object using a scalar-vector quaternion.
 *
 * @param {Object} engine - The rendering engine.
 * @param {number} object_idx - The index of the object.
 * @param {Array} scalar_vector_quaternion - The quaternion in scalar-vector form.
 */
export function set_object_orientation_from_scalar_vector_quaternion(engine, object_idx, scalar_vector_quaternion) {
    let wxyz_quaternion = convert_scalar_vector_to_wxyz_quaternion(scalar_vector_quaternion);
    set_object_orientation_from_wxyz_quaternion(engine, object_idx, wxyz_quaternion);
}

/**
 * Sets the orientation of an object using an SO3 rotation matrix.
 *
 * @param {Object} engine - The rendering engine.
 * @param {number} object_idx - The index of the object.
 * @param {Array<Array<number>>} SO3_matrix - The SO3 rotation matrix.
 */
export function set_object_orientation_from_SO3_matrix(engine, object_idx, SO3_matrix) {
    let s = SO3_matrix;
    let m = new THREE.Matrix4(
        s[0][0], s[0][1], s[0][2], 0,
        s[1][0], s[1][1], s[1][2], 0,
        s[2][0], s[2][1], s[2][2], 0,
        0, 0, 0, 1
    );

    let q = new THREE.Quaternion();
    q.setFromRotationMatrix(m);
    z_up_set_object_rotation_from_quaternion(engine.mesh_objects[object_idx], q.w, q.x, q.y, q.z);
    z_up_set_object_rotation_from_quaternion(engine.mesh_object_wireframes[object_idx], q.w, q.x, q.y, q.z);
}

/**
 * Sets the orientation of an object using an SO2 rotation matrix.
 *
 * @param {Object} engine - The rendering engine.
 * @param {number} object_idx - The index of the object.
 * @param {Array<Array<number>>} SO2_matrix - The SO2 rotation matrix.
 */
export function set_object_orientation_from_SO2_matrix(engine, object_idx, SO2_matrix) {
    let s = SO2_matrix;
    let SO3_matrix = [
        [ s[0][0], s[0][1], 0 ],
        [ s[1][0], s[1][1], 0 ],
        [0, 0, 1] ];
    set_object_orientation_from_SO3_matrix(engine, object_idx, SO3_matrix);
}

/**
 * Sets the orientation of an object using a U1 complex number.
 *
 * @param {Object} engine - The rendering engine.
 * @param {number} object_idx - The index of the object.
 * @param {Array<Array<number>>} complex_number - The complex number representing the rotation.
 */
export function set_object_orientation_from_U1_complex_number(engine, object_idx, complex_number) {
    let c = unroll_matrix_to_list(complex_number);
    let angle = Math.atan2(c[1], c[0]);
    let SO2_matrix = [ [Math.cos(angle), -Math.sin(angle)], [Math.sin(angle), Math.cos(angle)] ];
    set_object_orientation_from_SO2_matrix(engine, object_idx, SO2_matrix);
}

/**
 * Sets the 3D position of an object.
 *
 * @param {Object} engine - The rendering engine.
 * @param {number} object_idx - The index of the object.
 * @param {Array<Array<number>>} position - The position vector.
 */
export function set_object_position_3D(engine, object_idx, position) {
    let p = unroll_matrix_to_list(position);

    z_up_set_object_position(engine.mesh_objects[object_idx], p[0], p[1], p[2]);
    z_up_set_object_position(engine.mesh_object_wireframes[object_idx], p[0], p[1], p[2]);
}

/**
 * Sets the 2D position of an object.
 *
 * @param {Object} engine - The rendering engine.
 * @param {number} object_idx - The index of the object.
 * @param {Array<Array<number>>} position - The position vector.
 */
export function set_object_position_2D(engine, object_idx, position) {
    position = unroll_matrix_to_list(position);

    z_up_set_object_position(engine.mesh_objects[object_idx], position[0], position[1], 0.001);
    z_up_set_object_position(engine.mesh_object_wireframes[object_idx], position[0], position[1], 0.001);
}