import { Agent } from './agent';

export function dist(pos1: Position, pos2: Position): number {
	return Math.sqrt(
		(pos2[0] - pos1[0]) * (pos2[0] - pos1[0]) +
			(pos2[1] - pos1[1]) * (pos2[1] - pos1[1])
	);
}

export function lerp(
	pos1: Position,
	pos2: Position,
	percent: number
): Position {
	return [
		pos1[0] + percent * (pos2[0] - pos1[0]),
		pos1[1] + percent * (pos2[1] - pos1[1]),
	];
}

export function getSpirit<T>(id: string): T {
	// @ts-ignore
	return memory.spirits[id] as T;
}
export function setSpirit<T>(id: string, _memory: T): void {
	// @ts-ignore
	memory.spirits[id] = _memory;
}

export function findMissing(
	initialArr: number[],
	indexArr: number[]
): number[] {
	// Create sparse array with a 1 at each index equal to a value in the input.
	const sparse = indexArr.reduce(
		// @ts-ignore
		(sparse, i) => ((sparse[i] = 1), sparse),
		[]
	);
	// Create array 0..highest number, and retain only those values for which
	// the sparse array has nothing at that index (and eliminate the 0 value).
	return [...initialArr.map((i, idx) => idx)].filter(
		(i) => (i === 0 || i) && !sparse[i]
	);
}

export function log(...args: any[]): void {
	if (!memory.logs) {
		memory.logs = [];
	}
	// @ts-ignore
	memory.logs.push(args);
}

export function isNil(value: any): boolean {
	return value === undefined || value === null;
}

export function isAlive(agent: Agent<any>): boolean {
	return agent.hp > 0;
}

export function isEmpty(obj: Object): boolean {
	return Object.keys(obj).length === 0;
}

export const getEnergyPerTick = (currentEnergy: number) =>
	3 + Math.round(currentEnergy * 0.01);

export function guid(len: number) {
	const charSet =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var randomString = '';
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz, randomPoz + 1);
	}
	return randomString;
}

export function mergeSight(sights: Sight[]): Sight {
	const sight = sights.reduce<Sight>(
		(prev, sight) => ({
			enemies: [...prev.enemies, ...sight.enemies],
			enemies_beamable: [...prev.enemies_beamable, ...sight.enemies_beamable],
			friends: [...prev.friends, ...sight.friends],
			friends_beamable: [...prev.friends_beamable, ...sight.friends_beamable],
			structures: [...prev.structures, ...sight.structures],
		}),
		{
			enemies: [],
			enemies_beamable: [],
			friends: [],
			friends_beamable: [],
			structures: [],
		}
	);
	return {
		enemies: [...new Set(sight.enemies)],
		enemies_beamable: [...new Set(sight.enemies_beamable)],
		friends: [...new Set(sight.friends)],
		friends_beamable: [...new Set(sight.friends_beamable)],
		structures: [...new Set(sight.structures)],
	};
}
export interface Rect {
	x: number;
	y: number;
	height: number;
	width: number;
}

export function isInsideRect(pos: Position, rect: Rect) {
	return pos[0] > rect.x && pos[0] < rect.x+rect.width && 
	pos[1] > rect.y && pos[1]
}
