import { Overlord } from './circle.overlord';
import { Agent } from './agent';
import exports from 'webpack';
import { dist, mergeSight } from './utils';

interface DefenseMemory {
	defenderId?: string;
	targetId?: string;
	funnelSize: number;
	prevEnemyIds: string[];
	swarms: number;
	swarmSize: number;
}

const defaultMemory: Partial<DefenseMemory> = {
	funnelSize: 0,
	prevEnemyIds: [],
	swarms: 0,
};

export class DefenseGuru {
	memory!: DefenseMemory;
	_enemies?: Spirit[];
	_underAttack?: boolean;
	_sight?: Sight;
	star!: Star;
	baseRect!: { x: number; y: number; height: number; width: number };

	get enemies() {
		if (!this._enemies) {
			this._enemies = Object.values(spirits).filter(
				(spirit) => spirit.player_id != 'stckcrsh'
			).filter();
		}

		return this._enemies;
	}

	get underAttack(): boolean {
		if (!this._underAttack) {
			this._underAttack =
				base.sight.enemies.length > 0 ||
				this.enemies.some(
					(enemy) => dist(enemy.position, this.overlord.myStar.position) <= 400
				);
		}
		return this._underAttack;
	}

	get funnelSize(): number {
		return this.memory.funnelSize;
	}

	set funnelSize(value: number) {
		this.memory.funnelSize = value;
	}

	get sight() {
		if (!this._sight) {
			this._sight = mergeSight(
				my_spirits.map((spirit) => spirit.sight)
			) as Sight;
		}
		return this._sight;
	}

	constructor(
		private overlord: Overlord,
		private name: string,
		configuration?: Partial<DefenseMemory>
	) {
		this.star = this.overlord.myStar;
		// @ts-ignore
		if (!memory.gurus[this.name]) {
			// @ts-ignore
			memory.gurus[this.name] = {
				...defaultMemory,
				...configuration,
			};
		}
		// @ts-ignore
		this.memory = memory.gurus[this.name] as DefenseMemory;

		const sightRange = 400;
		this.baseRect = {
			x: Math.min(base.position[0], this.star.position[0]) - sightRange,
			y: Math.min(base.position[1], this.star.position[1]) - sightRange,
			width:
				Math.abs(base.position[0] - this.star.position[0]) + sightRange * 2,
			height:
				Math.abs(base.position[1] - this.star.position[1]) + sightRange * 2,
		};
	}
}
