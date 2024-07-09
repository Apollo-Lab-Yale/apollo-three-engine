import {RobotFromPreprocessor} from "./utils_robot.js";
import {RobotFKSlidersVisualizer} from "./utils_kinematics.js";

export async function visualize_robot(engine, robots_dir, robot_name) {
    const robot_dir = `${robots_dir}/${robot_name}`;
    const [chainConfig, urdfConfig, meshConfig_stl, meshConfig, meshConfig_hull, meshConfig_convex_decomposition] = await Promise.all([
        fetch(`${robot_dir}/chain_module/module.json`).then(response => response.json()),
        fetch(`${robot_dir}/urdf_module/module.json`).then(response => response.json()),
        fetch(`${robot_dir}/mesh_modules/plain_meshes_module/module.json`).then(response => response.json()),
        fetch(`${robot_dir}/mesh_modules/original_meshes_module/module.json`).then(response => response.json()),
        fetch(`${robot_dir}/mesh_modules/convex_hull_meshes_module/module.json`).then(response => response.json()),
        fetch(`${robot_dir}/mesh_modules/convex_decomposition_meshes_module/module.json`).then(response => response.json())
    ]);

    let robot = new RobotFromPreprocessor(
        chainConfig,
        urdfConfig,
        meshConfig,
        meshConfig_stl,
        'stl',
        meshConfig_hull,
        meshConfig_convex_decomposition,
        `apollo-robots-dir/${robots_dir}`
    );

    robot.spawn_robot(engine);

    let visualizer = new RobotFKSlidersVisualizer(robot);
    engine.animation_loop(function() {
        visualizer.three_loop_function(engine);
    });
}