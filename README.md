# Ant Colony Simulation

![FelColony](https://github.com/pqhuy98/ant-simulation/blob/master/screenshots/fel-colony.png)

Source code of https://ant.quangdel.com/ for ants colonies pheromone simulation. Inspired by this Youtube video [Coding Adventure: Ant and Slime Simulations](https://www.youtube.com/watch?v=X-iSQQgOd1A).

## Screenshots:
![Classic](https://github.com/pqhuy98/ant-simulation/blob/master/screenshots/classic.png)
![White](https://github.com/pqhuy98/ant-simulation/blob/master/screenshots/white.png)
![StarWar](https://github.com/pqhuy98/ant-simulation/blob/master/screenshots/starwar.png)


# Run it yourself
Run it like a typical JavaScript-React website.

```
git clone https://github.com/pqhuy98/ant-simulation

cd ant-simulation

cd ./shared && npm ci

cd ../frontend && npm ci && npm start
```

# Interesting technical facts
The code is optimized to squeeze out every bit of miliseconds.
- HTML 5 Canvas to render simulation world.
- ReactJS to render general UI (buttons, texts...).
- WebWorker calculates the next simulation state, then transfers to main thread for rendering.
- Main thread renders the simulation and uses client-side prediction (so-called interpolation) to achieve very high rendering FPS.
- Deterministic randomization.
- Very optimized Canvas rendering/rasterization algorithms.