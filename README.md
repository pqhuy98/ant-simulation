# Ant Colony Simulation

![FelColony](https://github.com/pqhuy98/ant-simulation/blob/master/screenshots/fel-colony.png)

Source code of https://ant.quangdel.com/

The code is optimized to achieve as highest frame-per-second as possible.

Interesting technological facts:
- HTML 5 Canvas to render simulation world.
- ReactJS to render general UI (buttons, texts...).
- WebWorker calculates the next simulation state, then transfers to main thread for rendering.
- Main thread renders the simulation and uses client prediction to achieve very high FPS.
- Deterministic randomization.
- Extremely optimized Canvas rendering algorithms.

## Screenshots:
![Classic](https://github.com/pqhuy98/ant-simulation/blob/master/screenshots/classic.png)
![White](https://github.com/pqhuy98/ant-simulation/blob/master/screenshots/white.png)
![StarWar](https://github.com/pqhuy98/ant-simulation/blob/master/screenshots/starwar.png)
