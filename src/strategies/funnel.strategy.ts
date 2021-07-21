/**
 * The goal of the funnel strat is to try to use spirits as a way to
 * funnel a star straight to a massive spirit
 *
 * We form a chain from star to defender
 */

import { Agent } from '../agent';
import { DefenseGuru } from '../defense-guru';
import { Overlord } from '../circle.overlord';
import {
	dist,
	findMissing,
	getEnergyPerTick,
	getSpirit,
	isNil,
	lerp,
	log,
	mergeSight,
} from '../utils';
import { Strategy } from '../Strategy';

const MAX_SIZE = getEnergyPerTick(1000);
const MAX_FUNNEL_LENGTH = 199;

interface FunnelMemory {
	prevLength: number;
}

const defaultMemory: FunnelMemory = {
	prevLength: 0,
};

interface AgentMemory {
	strategy: string;
	role: number;
	targetId: string;
}

export class FunnelStrategy extends Strategy<FunnelMemory> {
	memory!: FunnelMemory;
	agents: Agent<AgentMemory>[] = [];
	roles: number[] = [];
	lengths: number = 0;
	_funnelSize: number = 0;

	get funnelSize(): number {
		return this._funnelSize;
	}

	set funnelSize(val: number) {
		this.defenseGuru.funnelSize = val;
		this._funnelSize = val;
	}

	isRequestingSpirit(): boolean {
		if (this.agents.length >= this.roles.length) {
			return false;
		}

		if (getEnergyPerTick(this.overlord.myStar.energy) > this._funnelSize) {
			return true;
		}

		return false;
	}

	constructor(
		overlord: Overlord,
		name: string,
		private source: Star,
		private target: ArtificialEntity,
		private defenseGuru: DefenseGuru,
		memName?: string
	) {
		super(overlord, name, defaultMemory, memName);
	}

	setup(): void {
		this.agents = this.getStratAgents();

		if (this.target) {
			this.lengths = Math.ceil(
				(dist(
					this.source.position,
					this.target?.position || this.source.position
				) -
					MAX_FUNNEL_LENGTH) /
					MAX_FUNNEL_LENGTH
			);

			if (this.memory?.prevLength === 0) {
				this.memory.prevLength = this.lengths;
			}

			if (this.lengths !== this.memory.prevLength) {
				this.memory.prevLength = this.lengths;

				this.agents.forEach((agent) => {
					// we need to reset memory and divide
					agent.memory = { targetId: null } as any;
					agent.divide();
				});
			}

			const TotalMerging = MAX_SIZE * (this.lengths + 1);

			this.roles = [
				...Array(TotalMerging)
					.fill('')
					.map((_, idx) => idx),
			];

			// sort all the agents by their role numbers
			this.agents.sort((a, b) => a.memory.role - b.memory.role);

			this.funnelSize = Math.floor(
				this.agents.reduce((a, b) => a + b.size / (this.lengths + 1), 0)
			);
		}

		const sight = mergeSight(this.agents.map((agent) => agent.sight));

		if (sight.enemies.length > 0) {
			const targetId = this.getMode([
				...sight.enemies_beamable,
				...sight.enemies,
			]);
		}
	}

	getMode(arr: string[]): string {
		const results: Record<string, number> = {};
		let count = 0;
		let max = '';
		arr.forEach((val) => {
			if (results[val]) {
				results[val]++;
			} else {
				results[val] = 1;
			}

			if (count < results[val]) {
				max = val;
				count = results[val];
			}
		});
		return max;
	}

	run(): void {
		if (this.target && this.agents.length > 0) {
			const points = [];

			// add 1 for the extra harvester
			const positions = this.lengths + 1;

			// putting this in to keep the indexes aligned but its not used
			points.push(this.source.position);
			for (let i = 1; i <= this.lengths; i++) {
				points.push(
					lerp(
						this.source.position,
						this.target.position,
						i / (this.lengths + 1)
					)
				);
			}

			const harvesterTarget = this.lengths > 1 ? this.agents[2] : this.target;
			// the first 1 (idx 0 and idx 2) is a harvester
			for (let i = 0; i < 2; i++) {
				const harvester = this.agents[i];
				if (harvester) {
					harvester.move(points[1]);
					if (
						// run every other tick
						tick % 2 === i &&
						// validate that the size of the harvester matches the energy gained
						((tick % 4 === i &&
							getEnergyPerTick(this.source.energy) * 2 >= harvester.size) ||
							getEnergyPerTick(this.source.energy) >= harvester.size) ||
							this.defenseGuru.underAttack
					) {
						harvester.energize(harvester); // this is all the pushers
						harvester.shout('HEAVE');
					} else {
						harvesterTarget && harvester.energize(harvesterTarget);
						harvester.shout('HO');
					}
				}
			}

			// this is all the center pushers
			for (let i = 2; i < positions; i++) {
				const pusher = this.agents?.[i];
				if (pusher) {
					pusher.move(points[i]);
					if (this.agents[i + 1]) {
						pusher.energize(this.agents[i + 1]);
						pusher.shout('HEAVE');
					}
				}
			}

			// final pusher
			if (positions > 2) {
				if (this.agents?.[positions - 1]) {
					const funneller = this.agents[positions - 1];
					funneller.move(points[positions - 1]);
					funneller.energize(this.target);
					funneller.shout('HEAVE');
				}
			}

			// this is all the mergers
			for (let i = positions; i < this.agents.length; i++) {
				const merger = this.agents[i];
				if (dist(merger.position, base.position) <= 200) {
					merger.energize(base);
				}

				if (!merger.memory?.targetId) {
					const mergeTarget = this.agents[i % positions];

					if (mergeTarget) {
						merger.energize(mergeTarget);
						merger.memory = {
							targetId: mergeTarget.id,
						} as any;

						merger.move(mergeTarget.position);
						merger.merge(mergeTarget);
					}
				} else {
					const mergeTarget = spirits[merger.memory.targetId];
					merger.move(mergeTarget.position);
					merger.merge(mergeTarget);
				}
			}
		}
	}

	hereIsASpirit(spirit: Spirit): void {
		const agent = new Agent<AgentMemory>(spirit);
		const currentRoles = this.agents
			.filter((agent) => !isNil(agent.memory.role))
			.map((agent) => agent.memory?.role);

		const missingRoles = findMissing(this.roles, currentRoles);

		if (missingRoles.length > 0) {
			agent.memory = {
				role: missingRoles[0],
				strategy: this.name,
			} as any;
			this.agents.push(agent);
		}
	}
	finalize(): void {}
}
