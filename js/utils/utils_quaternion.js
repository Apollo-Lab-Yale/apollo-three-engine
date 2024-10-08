/**
 * Author: Danny Rakita
 * Description: For CPSC-487-587 3D Spatial Modeling and Computing at Yale University
 */

import {add_matrix_matrix, cross_product, dot_product, mul_matrix_scalar, unroll_matrix_to_list} from "./utils_math.js";

/**
 * Adds two quaternions in wxyz form.
 *
 * @param {Array<number>} q1 - The first quaternion in wxyz form.
 * @param {Array<number>} q2 - The second quaternion in wxyz form.
 * @returns {Array<number>} - The resulting quaternion after addition.
 */
export function add_wxyz_quaternions(q1, q2) {
    return [q1[0]+q2[0], q1[1]+q2[1], q1[2]+q2[2], q1[3]+q2[3]];
}

/**
 * Multiplies two quaternions in scalar-vector form.
 *
 * @param {Array} q1 - The first quaternion in scalar-vector form.
 * @param {Array} q2 - The second quaternion in scalar-vector form.
 * @returns {Array} - The resulting quaternion after multiplication.
 */
export function mul_scalar_vector_quaternions(q1, q2) {
    let v1 = q1[1];
    let v2 = q2[1];

    // console.log(v1, v2, dot_product(v1, v2));
    let d = v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
    let new_w = (q1[0]*q2[0]) - d;
    // let new_w = -d;

    let a = mul_matrix_scalar(v1, q2[0]);
    let b = mul_matrix_scalar(v2, q1[0]);
    let c = cross_product(v1, v2);

    let new_v = add_matrix_matrix(add_matrix_matrix(a, b), c);

    return [new_w, new_v];
}

/**
 * Multiplies two quaternions in wxyz form.
 *
 * @param {Array<number>} q1 - The first quaternion in wxyz form.
 * @param {Array<number>} q2 - The second quaternion in wxyz form.
 * @returns {Array<number>} - The resulting quaternion after multiplication.
 */
export function mul_wxyz_quaternions(q1, q2) {
    let v1 = [q1[1], q1[2], q1[3]];
    let v2 = [q2[1], q2[2], q2[3]];

    let qq1 = [q1[0], v1];
    let qq2 = [q2[0], v2];

    let res = mul_scalar_vector_quaternions(qq1, qq2);
    let v = unroll_matrix_to_list(res[1]);
    return [res[0], v[0], v[1], v[2]];
}

/**
 * Converts a quaternion from wxyz form to scalar-vector form.
 *
 * @param {Array<number>} q - The quaternion in wxyz form.
 * @returns {Array} - The quaternion in scalar-vector form.
 */
export function convert_wxyz_to_scalar_vector_quaternion(q) {
    let w = q[0];
    let v = [ [q[1]], [q[2]], [q[3]] ];

    return [w, v];
}

/**
 * Converts a quaternion from scalar-vector form to wxyz form.
 *
 * @param {Array} q - The quaternion in scalar-vector form.
 * @returns {Array<number>} - The quaternion in wxyz form.
 */
export function convert_scalar_vector_to_wxyz_quaternion(q) {
    let w = q[0];
    let vlist = unroll_matrix_to_list(q[1]);

    return [w, vlist[0], vlist[1], vlist[2]];
}

/**
 * Computes the conjugate of a quaternion in wxyz form.
 *
 * @param {Array<number>} q - The quaternion in wxyz form.
 * @returns {Array<number>} - The conjugated quaternion in wxyz form.
 */
export function quaternion_conj_wxyz(q) {
    return [q[0], -q[1], -q[2], -q[3]];
}

/**
 * Computes the conjugate of a quaternion in scalar-vector form.
 *
 * @param {Array} q - The quaternion in scalar-vector form.
 * @returns {Array} - The conjugated quaternion in scalar-vector form.
 */
export function quaternion_conj_scalar_vector(q) {
    let qq = convert_scalar_vector_to_wxyz_quaternion(q);
    let res = quaternion_conj_wxyz(qq);
    return convert_wxyz_to_scalar_vector_quaternion(res);
}

/**
 * Applies the sandwich product of a quaternion in wxyz form and a point.
 *
 * @param {Array<number>} q - The quaternion in wxyz form.
 * @param {Array<Array<number>>} p - The point as a 3D vector.
 * @returns {Array<Array<number>>} - The resulting point after the sandwich product.
 */
export function sandwich_product_wxyz_quaternion_and_point(q, p) {
    p = unroll_matrix_to_list(p);
    let pp = [0, p[0], p[1], p[2]];
    let res= mul_wxyz_quaternions(mul_wxyz_quaternions(q, pp), quaternion_conj_wxyz(q));
    return [[res[1]], [res[2]], [res[3]]];
}

/**
 * Applies the sandwich product of a quaternion in scalar-vector form and a point.
 *
 * @param {Array} q - The quaternion in scalar-vector form.
 * @param {Array<Array<number>>} p - The point as a 3D vector.
 * @returns {Array<Array<number>>} - The resulting point after the sandwich product.
 */
export function sandwich_product_scalar_vector_quaternion_and_point(q, p) {
    let qq = convert_scalar_vector_to_wxyz_quaternion(q);
    return sandwich_product_wxyz_quaternion_and_point(qq, p);
}