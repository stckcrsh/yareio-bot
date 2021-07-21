import { Overlord } from './circle.overlord';
/**
 * This file is the entry point for your bot.
 */

// import RenderService from 'yare-code-sync/client/RenderService'

// RenderService.circle(my_spirits[0], 100);

// console.log('Logs', memory?.logs);
console.log(memory);
// console.log(my_spirits);
console.log(memory?.overlord?.strategies?.swarm);

runPatches([
	// () => {
	//   memory.swarms = {};
	// },
	// () => {
	// 	memory.overlord.energyGain = [0,0,0,0,0];
	// },
]);

if (!memory.init) {
	// do init stuff
	memory.spirits = {};
	memory.logs = [];
	memory.swarms = {};
	memory.gurus = {};

	// setup init and versions
	memory.init = true;
	memory.version = 0;
}

const overlord = new Overlord();

overlord.setup();
overlord.setupStrats();
overlord.runStrats();
overlord.finalize();

/**
 * Takes an array of functions that are called once
 * This is used for live updates
 * @param {()=>void[]} patches
 */
function runPatches(patches = []) {
	// @ts-ignore
	if (patches[memory.version]) {
		// @ts-ignore
		patches[memory.version]();
	}
	memory.version = patches.length;
}
// @ts-ignore
for (const key in memory.spirits) {
	if (!spirits[key]) {
		// @ts-ignore
		delete memory.spirits[key];
	}
}
