/* eslint-disable @typescript-eslint/no-explicit-any */
declare interface Memory {
	swarms: Record<string, any>;
	spirits: Record<string, any>;
	logs: any[];
	overlord: {
		strategies: Record<string, any>;
	};
	version: number;
	init: boolean;
}
declare const memory: Memory; // You will probably want to change this

declare interface Outpost extends Structure, ArtificialEntity {
	id: string;
	structure_type: string;
	position: Position;
	size: number;
	energy_capacity: number;
	energy: number;
	range: number;
	control: string;
	sight: Sight;
}

declare const tick: number;

declare const outpost: Outpost;

declare const star_p89: Star;

interface Star {
	energy: number;
}
