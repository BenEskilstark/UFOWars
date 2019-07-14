"use strict";

var config = {
  msPerTick: 50,
  width: 800,
  height: 800,
  ship: {
    thrust: 0.05,
    thetaSpeed: 5 * Math.PI / 180,
    radius: 15,
    mass: 10,
    maxFuel: 100,
    maxLaser: 100
  },
  sun: {
    radius: 50,
    mass: 10000
  },
  G: 1, // gravitational constant
  maxHistorySize: 75,
  maxFutureSize: 75,
  laserSize: 4, // deprecated in favor of laserSpeed
  laserSpeed: 20,
  maxProjectiles: 100,
  c: Infinity, // speed of light, in pixels per tick
  renderGroundTruth: false
};

module.exports = { config: config };