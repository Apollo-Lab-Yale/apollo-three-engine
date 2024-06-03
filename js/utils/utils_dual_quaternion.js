/**
 * Author: Danny Rakita
 * Description: For CPSC-487-587 3D Spatial Modeling and Computing at Yale University
 */

import {add_wxyz_quaternions, mul_wxyz_quaternions, quaternion_conj_wxyz} from "./utils_quaternion.js";
import {unroll_matrix_to_list} from "./utils_math.js";

export function mul_dual_quaternions(Q1, Q2) {
    let new_r = mul_wxyz_quaternions(Q1[0], Q2[0]);

    let new_d1 = mul_wxyz_quaternions(Q1[0], Q2[1]);
    let new_d2 = mul_wxyz_quaternions(Q1[1], Q2[0]);

    let new_d = add_wxyz_quaternions(new_d1, new_d2);

    return [new_r, new_d];
}

export function dual_quaternion_conj_star(Q) {
    return [ quaternion_conj_wxyz(Q[0]), quaternion_conj_wxyz(Q[1]) ];
}

export function dual_quaternion_conj_sharp(Q) {
    return [ quaternion_conj_wxyz(Q[0]), [ -Q[1][0], Q[1][1], Q[1][2], Q[1][3] ] ];
}

export function dual_quaternion_norm(Q) {
    let conj_star = dual_quaternion_conj_star(Q);
    return mul_dual_quaternions(Q, conj_star);
}

export function convert_3D_point_to_dual_quaternion(p) {
    p = unroll_matrix_to_list(p);
    return [[1,0,0,0], [0, p[0], p[1], p[2]]];
}

export function convert_dual_quaternion_to_3D_point(Q) {
    return [ [Q[1][1]], [Q[1][2]], [Q[1][3]] ];
}