import * as THREE from 'three';
import {
    spawn_cube_base,
    z_up_get_object_pose_as_SE3_matrix, z_up_get_object_pose_as_SO2_matrix_and_position,
    z_up_get_object_pose_as_SO3_matrix_and_position,
    z_up_set_object_pose_from_SE3_matrix, z_up_set_object_pose_from_SO2_matrix_and_position,
    z_up_set_object_pose_from_SO3_matrix_and_position,
    z_up_set_object_position
} from "./utils_three.js";
import {TransformControls} from 'three/examples/jsm/controls/TransformControls.js';
import {unroll_matrix_to_list} from "./utils_math.js";

/**
 * A class that manages transform gizmos for manipulating 3D objects in a Three.js scene.
 */
export class TransformGizmoEngine {
    /**
     * Creates an instance of TransformGizmoEngine.
     * @param {Object} three_engine - The Three.js rendering engine.
     * @param {number} [cube_dim=0.034] - The dimension of the cube used for gizmos.
     */
    constructor(three_engine, cube_dim=0.034) {
        this.mode = "translate";

        this.gizmo_mesh_objects = [];
        this.gizmo_wireframe_objects = [];
        this.gizmo_mesh_object_active = [];
        this.transform_controls = [];
        this.cube_dim = cube_dim;
        for(let i = 0; i < 30; i++) {
            let mesh = spawn_cube_base(three_engine.scene, [0,0,0], cube_dim, cube_dim, cube_dim, 0x00eeff);

            let wireframeMaterial = new THREE.LineBasicMaterial({color: 0x333333});
            let wireframeGeometry = new THREE.WireframeGeometry(mesh.geometry);
            let wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
            wireframe.visible = false;

            mesh.add(wireframe);

            z_up_set_object_position(mesh, 0,0,0);

            mesh.visible = false;
            wireframe.visible = false;

            this.gizmo_mesh_objects.push(mesh);
            this.gizmo_wireframe_objects.push(wireframe);
            this.gizmo_mesh_object_active.push(false);
            this.transform_controls.push(null);
        }

        document.addEventListener('keydown', (event) => {
            if (event.key === 'm') {
                if(this.mode === "rotate") {
                    this.mode = "translate";
                } else if (this.mode === "translate") {
                    this.mode = "rotate";
                }

                this.transform_controls.forEach(transform_control => {
                    if(transform_control) {
                        transform_control.setMode(this.mode);
                    }
                });
            }
        });
    }

    /**
     * Finds the next available gizmo mesh object or creates more if necessary.
     * @param {Object} three_engine - The Three.js rendering engine.
     * @returns {number} - The index of the available gizmo mesh object.
     */
    #get_next_available_gizmo_mesh_object(three_engine) {
        for(let i=0; i<this.gizmo_mesh_objects.length; i++) {
            if(!this.gizmo_mesh_object_active[i]) {
                this.gizmo_mesh_object_active[i] = true;
                return i;
            }
        }

        for(let i = 0; i < 30; i++) {
            let mesh = spawn_cube_base(three_engine.scene, [0,0,0], this.cube_dim, this.cube_dim, this.cube_dim, 0x00eeff);

            let wireframeMaterial = new THREE.LineBasicMaterial({color: 0x333333});
            let wireframeGeometry = new THREE.WireframeGeometry(mesh.geometry);
            let wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
            wireframe.visible = false;

            mesh.add(wireframe);

            z_up_set_object_position(mesh, 0,0,0);

            mesh.visible = false;
            wireframe.visible = false;

            this.gizmo_mesh_objects.push(mesh);
            this.gizmo_wireframe_objects.push(wireframe);
            this.gizmo_mesh_object_active.push(false);
            this.transform_controls.push(null);
        }
        return this.#get_next_available_gizmo_mesh_object(three_engine);
    }

    /**
     * Adds a gizmo with an initial SO3 rotation matrix and position.
     * @param {Object} three_engine - The Three.js rendering engine.
     * @param {Array<Array<number>>} [init_SO3_matrix=[[1,0,0],[0,1,0],[0,0,1]]] - The initial SO3 rotation matrix.
     * @param {Array<Array<number>>} [init_position=[[0], [0], [0]]] - The initial position vector.
     * @param {number} [size=1] - The size of the gizmo.
     * @returns {number} - The index of the added gizmo.
     */
    add_gizmo_SO3_matrix_and_position(three_engine, init_SO3_matrix = [[1,0,0],[0,1,0],[0,0,1]], init_position=[[0], [0], [0]], size=1) {
        let idx = this.#get_next_available_gizmo_mesh_object(three_engine);
        let gizmo_mesh_object = this.gizmo_mesh_objects[idx];
        z_up_set_object_pose_from_SO3_matrix_and_position(gizmo_mesh_object, init_SO3_matrix, init_position);
        return this.#add_gizmo_generic(three_engine, gizmo_mesh_object, idx, size);
    }

    /**
     * Adds a gizmo with an initial SE3 transformation matrix.
     * @param {Object} three_engine - The Three.js rendering engine.
     * @param {Array<Array<number>>} [init_SE3_matrix=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]] - The initial SE3 transformation matrix.
     * @param {number} [size=1] - The size of the gizmo.
     * @returns {number} - The index of the added gizmo.
     */
    add_gizmo_SE3_matrix(three_engine, init_SE3_matrix = [[1,0,0, 0],[0,1,0, 0],[0,0,1, 0], [0, 0, 0, 1]], size=1) {
        let idx = this.#get_next_available_gizmo_mesh_object(three_engine);
        let gizmo_mesh_object = this.gizmo_mesh_objects[idx];
        z_up_set_object_pose_from_SE3_matrix(gizmo_mesh_object, init_SE3_matrix);
        return this.#add_gizmo_generic(three_engine, gizmo_mesh_object, idx, size);
    }

    /**
     * Adds a gizmo with an initial SO2 rotation matrix and position.
     * @param {Object} three_engine - The Three.js rendering engine.
     * @param {Array<Array<number>>} [init_SO2_matrix=[[1,0],[0,1]]] - The initial SO2 rotation matrix.
     * @param {Array<Array<number>>} [init_position=[[0], [0]]] - The initial position vector.
     * @param {number} [size=1] - The size of the gizmo.
     * @returns {number} - The index of the added gizmo.
     */
    add_gizmo_SO2_matrix_and_position(three_engine, init_SO2_matrix=[[1,0], [0,1]], init_position=[[0], [0]], size=1) {
        let idx = this.#get_next_available_gizmo_mesh_object(three_engine);
        let gizmo_mesh_object = this.gizmo_mesh_objects[idx];
        z_up_set_object_pose_from_SO2_matrix_and_position(gizmo_mesh_object, init_SO2_matrix, init_position);
        return this.#add_gizmo_generic(three_engine, gizmo_mesh_object, idx, size);
    }

    /**
     * Removes a gizmo from the scene.
     * @param {Object} three_engine - The Three.js rendering engine.
     * @param {number} idx - The index of the gizmo to remove.
     */
    remove_gizmo(three_engine, idx) {
        this.transform_controls[idx].detach();
        this.transform_controls[idx].visible = false;
        this.gizmo_mesh_objects[idx].visible = false;
        this.gizmo_mesh_object_active[idx] = false;
    }

    /**
     * Sets the visibility of a specific gizmo.
     * @param {Object} three_engine - The Three.js rendering engine.
     * @param {number} idx - The index of the gizmo.
     * @param {boolean} visible - Whether the gizmo should be visible.
     */
    set_visibility_of_gizmo(three_engine, idx, visible) {
        if(this.transform_controls[idx]) {
            this.transform_controls[idx].visible = visible;
            // this.gizmo_mesh_objects[idx].visible = visible;
        }
    }

    /**
     * Sets the visibility of all gizmos.
     * @param {Object} three_engine - The Three.js rendering engine.
     * @param {boolean} visible - Whether the gizmos should be visible.
     */
    set_visibility_of_all_gizmos(three_engine, visible) {
        for(let i=0; i < this.gizmo_mesh_objects.length; i++) {
            this.set_visibility_of_gizmo(three_engine, i, visible);
        }
    }

    /**
     * Adds a generic gizmo to the scene.
     * @param {Object} three_engine - The Three.js rendering engine.
     * @param {Object} gizmo_mesh_object - The mesh object representing the gizmo.
     * @param {number} idx - The index of the gizmo.
     * @param {number} [size=1] - The size of the gizmo.
     * @returns {number} - The index of the added gizmo.
     */
    #add_gizmo_generic(three_engine, gizmo_mesh_object, idx, size=1) {
        this.gizmo_mesh_object_active[idx] = true;
        gizmo_mesh_object.visible = true;
        this.gizmo_wireframe_objects[idx].visible = true;

        let transform_control = new TransformControls(three_engine.camera, three_engine.renderer.domElement);
        transform_control.size = size;
        transform_control.setMode(this.mode);
        three_engine.scene.add(transform_control);

        transform_control.attach(gizmo_mesh_object);

        transform_control.addEventListener('dragging-changed', function(event) {
            three_engine.controls.enabled = !event.value;
        });

        this.transform_controls[idx] = transform_control;

        return idx;
    }

    /**
     * Gets the pose of a gizmo as an SO3 rotation matrix and position vector.
     * @param {number} idx - The index of the gizmo.
     * @returns {Array} - The SO3 rotation matrix and position vector, or null if inactive.
     */
    get_gizmo_pose_as_SO3_matrix_and_position(idx) {
        if(!this.gizmo_mesh_object_active[idx]) { return null; }
        return z_up_get_object_pose_as_SO3_matrix_and_position(this.gizmo_mesh_objects[idx]);
    }

    /**
     * Gets the pose of a gizmo as an SO2 rotation matrix and position vector.
     * @param {number} idx - The index of the gizmo.
     * @returns {Array} - The SO2 rotation matrix and position vector, or null if inactive.
     */
    get_gizmo_pose_as_SO2_matrix_and_position(idx) {
        if(!this.gizmo_mesh_object_active[idx]) { return null; }
        return z_up_get_object_pose_as_SO2_matrix_and_position(this.gizmo_mesh_objects[idx]);
    }

    /**
     * Gets the pose of a gizmo as an SE3 transformation matrix.
     * @param {number} idx - The index of the gizmo.
     * @returns {Array} - The SE3 transformation matrix, or null if inactive.
     */
    get_gizmo_pose_as_SE3_matrix(idx) {
        if(!this.gizmo_mesh_object_active[idx]) { return null; }
        return z_up_get_object_pose_as_SE3_matrix(this.gizmo_mesh_objects[idx]);
    }

    /**
     * Sets the pose of a gizmo using an SO3 rotation matrix and position vector.
     * @param {number} idx - The index of the gizmo.
     * @param {Array<Array<number>>} [SO3_matrix=[[1,0,0],[0,1,0],[0,0,1]]] - The SO3 rotation matrix.
     * @param {Array<Array<number>>} [position=[[0], [0], [0]]] - The position vector.
     */
    set_pose_of_gizmo_SO3_matrix_and_position(idx, SO3_matrix = [[1,0,0],[0,1,0],[0,0,1]], position=[[0], [0], [0]]) {
        if(!this.gizmo_mesh_object_active[idx]) { return; }

        z_up_set_object_pose_from_SO3_matrix_and_position(this.gizmo_mesh_objects[idx], SO3_matrix, position);
    }

    /**
     * Sets the pose of a gizmo using an SO2 rotation matrix and position vector.
     * @param {number} idx - The index of the gizmo.
     * @param {Array<Array<number>>} [SO2_matrix=[[1,0], [0,1]]] - The SO2 rotation matrix.
     * @param {Array<Array<number>>} [position=[[0], [0]]] - The position vector.
     */
    set_pose_of_gizmo_SO2_matrix_and_position(idx, SO2_matrix = [[1,0], [0,1]], position=[[0], [0]]) {
        if(!this.gizmo_mesh_object_active[idx]) { return; }

        z_up_set_object_pose_from_SO2_matrix_and_position(this.gizmo_mesh_objects[idx], SO2_matrix, position);
    }

    /**
     * Sets the pose of a gizmo using an SE3 transformation matrix.
     * @param {number} idx - The index of the gizmo.
     * @param {Array<Array<number>>} SE3_matrix - The SE3 transformation matrix.
     */
    set_pose_of_gizmo_SE3_matrix(idx, SE3_matrix) {
        if(!this.gizmo_mesh_object_active[idx]) { return; }

        z_up_set_object_pose_from_SE3_matrix(this.gizmo_mesh_objects[idx], SE3_matrix);
    }

    /**
     * Sets the position of a gizmo.
     * @param {number} idx - The index of the gizmo.
     * @param {Array<Array<number>>} position - The position vector.
     */
    set_position_of_gizmo(idx, position) {
        if(!this.gizmo_mesh_object_active[idx]) { return; }

        let p = unroll_matrix_to_list(position);
        z_up_set_object_position(this.gizmo_mesh_objects[idx], p[0], p[1], p[2]);
    }

    /**
     * Toggles the mode of the gizmo between "translate" and "rotate".
     */
    toggle_mode() {
        if(this.mode === "rotate") {
            this.mode = "translate";
        } else if (this.mode === "translate") {
            this.mode = "rotate";
        }

        this.transform_controls.forEach(transform_control => {
            if(transform_control) {
                transform_control.setMode(this.mode);
            }
        });
    }
}