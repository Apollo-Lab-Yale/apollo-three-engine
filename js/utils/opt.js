/**
 * Author: Danny Rakita
 * Description: For CPSC-487-587 3D Spatial Modeling and Computing at Yale University
 */

/**
 * Shuffles the indices of the input array.
 *
 * @param {Array} array - The array whose indices are to be shuffled.
 * @returns {Array<number>} - The shuffled indices of the array.
 */
function shuffleIndicesOf (array) {
    var idx = [];
    for (var i = 0; i < array.length; i++) {
        idx.push(i);
    }
    for (var i = 0; i < array.length; i++) {
        var j = Math.floor(Math.random() * i);
        var tmp = idx[i];
        idx[i] = idx[j];
        idx[j] = tmp;
    }
    return idx;
};

/**
 * Minimizes a function using the Powell method.
 *
 * @param {function} fnc - The function to minimize.
 * @param {Array<number>} x0 - The initial guess for the function's argument.
 * @param {number} [max_iter=100] - The maximum number of iterations.
 * @returns {Object} - An object containing the minimized argument and function value.
 */
export function minimize_Powell(fnc, x0, max_iter=100) {
    var eps = 1e-2;

    var convergence = false;
    var x = x0.slice(); // make copy of initialization
    var alpha = 0.001; // scaling factor

    var pfx = Math.exp(10);
    var fx = fnc(x);
    var pidx = 1;
    let iter=0;
    while (!convergence & iter<max_iter) {

        var indicies = shuffleIndicesOf(x);
        convergence = true;

        // Perform update over all of the variables in random order
        for (var i = 0; i < indicies.length; i++) {

            x[indicies[i]] += 1e-6;
            var fxi = fnc(x);
            x[indicies[i]] -= 1e-6;
            var dx = (fxi - fx) / 1e-6;

            if (Math.abs(dx) > eps) {
                convergence = false;
            }

            x[indicies[i]] = x[indicies[i]] - alpha * dx;
            fx = fnc(x);

        }

        alpha = pfx > fx ? alpha * 1.1 : alpha * 0.7;
        pfx = fx;

        pidx--;
        if (pidx === 0) {
            pidx = 1;
        }
        iter++;
    }

    var solution = {};
    solution.argument = x;
    solution.fncvalue = fx;

    return solution;
}

/**
 * Performs an element-wise addition of a vector scaled by a constant to another vector.
 *
 * @param {Array<number>} x - The original vector.
 * @param {number} a - The scaling factor.
 * @param {Array<number>} g - The vector to be scaled and added.
 * @returns {Array<number>} - The resulting vector after the operation.
 */
function vect_x_pluseq_ag (x, a, g) {
    for (var i = 0; i < x.length; i++) {
        x[i] = x[i] + a * g[i];
    }

    return x;

}

/**
 * Checks if the maximum absolute value of the elements in a vector is less than a specified epsilon.
 *
 * @param {Array<number>} x - The vector to check.
 * @param {number} eps - The epsilon threshold.
 * @returns {boolean} - True if the maximum absolute value is less than epsilon, false otherwise.
 */
function vect_max_abs_x_less_eps (x, eps) {
    // this procedure is used for stopping criterion check
    for (var i = 0; i < x.length; i++) {
        if (Math.abs(x[i]) >= eps) {
            return false;
        }
    }
    return true;
}

/**
 * Subtracts one vector from another element-wise.
 *
 * @param {Array<number>} a - The vector to subtract from.
 * @param {Array<number>} b - The vector to subtract.
 * @returns {Array<number>} - The resulting vector after subtraction.
 */
function vect_a_minus_b (a, b) {
    var result = new Array(a.length);
    for (var i = 0; i < a.length; i++) {
        result[i] = a[i] - b[i];
    }
    return result;

}

/**
 * Calculates the dot product of two vectors.
 *
 * @param {Array<number>} a - The first vector.
 * @param {Array<number>} b - The second vector.
 * @returns {number} - The dot product of the two vectors.
 */
function dot (a, b) {
    var result = 0;
    for (var i = 0; i < a.length; i++) {
        result += a[i] * b[i];
    }
    return result;

}

/**
 * Minimizes a function using Gradient Descent.
 *
 * @param {function} fnc - The function to minimize.
 * @param {function} grd - The gradient of the function.
 * @param {Array<number>} x0 - The initial guess for the function's argument.
 * @param {number} [max_iter=100] - The maximum number of iterations.
 * @returns {Object} - An object containing the minimized argument and function value.
 */
export function minimize_GradientDescent (fnc, grd, x0, max_iter=100) {
    var x = x0.slice();

    var convergence = false;
    var eps = 1e-3;
    var alpha = 0.01;

    var pfx = fnc(x);

    let iter = 0;
    while (!convergence && iter<max_iter) {
        var g = grd(x);
        convergence = vect_max_abs_x_less_eps(g, eps);

        if (convergence) {
            break;
        }

        var repeat = true;

        while (repeat) {
            var xn = x.slice();
            vect_x_pluseq_ag(xn, -alpha, g); // perform step
            var fx = fnc(xn);

            repeat = pfx < fx;
            alpha = repeat ? alpha * 0.7 : alpha * 1.1;
        }

        x = xn;
        pfx = fx;
        iter++;
    }

    var solution = {};
    solution.argument = x;
    solution.fncvalue = fx;
    return solution;
}

/**
 * Minimizes a function using the Limited-memory Broyden–Fletcher–Goldfarb–Shanno (L-BFGS) method.
 *
 * @param {function} fnc - The function to minimize.
 * @param {function} grd - The gradient of the function.
 * @param {Array<number>} x0 - The initial guess for the function's argument.
 * @param {number} [max_iter=100] - The maximum number of iterations.
 * @returns {Object} - An object containing the minimized argument and function value.
 */
export function minimize_L_BFGS(fnc, grd, x0, max_iter=100) {
    var x = x0.slice();

    var eps = 1e-5; // max abs value of gradient component for termination
    var alpha = 0.001; // initial step size
    var m = 5; // history size to keep for Hessian approximation

    var pfx = fnc(x);
    var s = []; // this is needed for lbfgs procedure
    var y = [];
    var ro = [];

    var g = grd(x);
    var direction = g.slice();
    var convergence = false;
    let iter = 0;
    while (!convergence && iter < max_iter) {

        var xn = x.slice();
        vect_x_pluseq_ag(xn, alpha, direction); // perform step
        var fx = fnc(xn);
        alpha = pfx < fx ? alpha * 0.5 : alpha * 1.2; // magic!

        //  < ================= apply limited memory BFGS procedure ================= >
        var gn = grd(xn);

        if (vect_max_abs_x_less_eps(gn, eps)) {
            break;
        }

        var dx = vect_a_minus_b(xn, x);
        var dg = vect_a_minus_b(gn, g);

        s.unshift(dx);
        y.unshift(dg);
        var tmp = 1 / (dot(dx, dg));
        ro.unshift(tmp);

        if (s.length > m) {
            s.pop();
            y.pop();
            ro.pop();
        }

        var r = g.slice();
        var a = new Array(s.length);

        for (var i = 0; i < s.length; i++) {
            var pi = 1 / (dot(s[i], y[i]));
            a[i] = pi * dot(s[i], r);
            vect_x_pluseq_ag(r, -a[i], y[i]);
        }

        // perform Hessian scaling
        var scale = dot(dx, dg) / dot(dg, dg);
        for (var i = 0; i < r.length; i++) {
            r[i] = r[i] * scale;
        }

        for (var i = 0; i < s.length; i++) {
            var j = s.length - i - 1;
            var pj = 1 / (dot(s[j], y[j]));
            var beta = pj * dot(y[j], r);
            vect_x_pluseq_ag(r, (a[j] - beta), s[j]);
        }
        direction = r.slice();

        //  < ================= apply limited memory BFGS procedure ================= >

        for (var i = 0; i < direction.length; i++) {
            direction[i] = -direction[i];
        }

        pfx = fx;
        x = xn;
        g = gn;

        iter++;
    }

    var solution = {};
    solution.argument = x;
    solution.fncvalue = fx;
    return solution;
}
