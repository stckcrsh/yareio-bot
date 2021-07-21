import { Agent } from '../agent';
import { Overlord } from '../circle.overlord';
import { Strategy } from '../Strategy';
import { Swarm, SwarmMemory } from '../swarm';
import { dist, getSpirit, guid, lerp } from '../utils';

const getSwarmId = () => guid(6);

const STAR = star_p89;

interface Config {
	swarmSize: number;
}

interface ClaimMemory {
	swarms: string[];
	currentSwarm?: string;
	defensePos?: Position;
}

interface ClaimSwarmMemory {
	minions: string[];
	strategy: string;
	targetId?: string;
	state: string;
}

const defaultMemory: ClaimMemory = {
	swarms: [],
};

export class ClaimOutpost extends Strategy<ClaimMemory> {
	memory!: ClaimMemory;
	swarms!: Swarm<ClaimSwarmMemory>[];
	currentSwarm?: Swarm<ClaimSwarmMemory>;

	constructor(
		overlord: Overlord,
		name: string,
		memName: string,
		private config: Config
	) {
		super(overlord, name, defaultMemory, memName);
	}

	setup(): void {
		this.swarms = this.memory.swarms.map(
			(swarmId) => new Swarm<ClaimSwarmMemory>(swarmId)
		);
		if (this.memory.currentSwarm) {
			this.currentSwarm = new Swarm<ClaimSwarmMemory>(this.memory.currentSwarm);
		}

		if (!this.memory.defensePos) {
			this.memory.defensePos = lerp(STAR.position, enemy_base.position, 0.5);
		}
	}

	run(): void {
		this.swarms.forEach(this.runSwarm.bind(this));
		if (this.currentSwarm) {
			this.runGatheringSwarm(this.currentSwarm);
		}
	}

	runSwarm(swarm: Swarm<ClaimSwarmMemory>): void {
		const state = swarm.memory.state;
		const sight = swarm.sight;

		switch (state) {
			case 'gathering': {
				swarm.memory.state = 'pathing';
			}
			case 'pathing': {
				if (swarm.energy === 0) {
					swarm.memory.state = 'harvesting';
					return this.runSwarm(swarm);
				}

				if (outpost.control === 'stckcrsh' && outpost.energy >= 600) {
					swarm.memory.state = 'defending';
					return this.runSwarm(swarm);
				}

				swarm.move(outpost.position);
				swarm.energize(outpost);
				break;
			}
			case 'harvesting': {
				if (swarm.energy >= swarm.energy_capacity) {
					swarm.memory.state = 'pathing';
					return this.runSwarm(swarm);
				}

				swarm.move(STAR.position);
				swarm.energize(STAR);

				break;
			}
			case 'defending': {
				if (swarm.energy < 0.5 * swarm.energy_capacity) {
					swarm.memory.state = 'harvesting';
					return this.runSwarm(swarm);
				}

				if (sight.enemies.length > 0) {
					const { enemy } = sight.enemies
						.map((enemyId) => spirits[enemyId])
						.reduce(
							(
								prev: { enemy: null | Spirit; distance: number },
								enemy: Spirit
							) => {
								const distance = dist(enemy.position, swarm.position);
								if (distance > prev.distance) return prev;
								return {
									distance,
									enemy,
								};
							},
							{ enemy: null, distance: 9999 }
						);
					if (enemy) {
						swarm.energize(enemy);
					}
				}

				swarm.move(this.memory.defensePos!);
				break;
			}
		}
	}

	// getTarget(swarm) {}

	runGatheringSwarm(swarm: Swarm<ClaimSwarmMemory>) {
		swarm.move(swarm.position);
	}

	finalize(): void {}

	hereIsASpirit(spirit: Spirit): void {
		if (this.memory?.currentSwarm) {
			const swarm = new Swarm<ClaimSwarmMemory>(this.memory.currentSwarm);

			swarm.addSpirit(spirit);

			if (swarm.length >= this.config.swarmSize) {
				this.setMemory({
					currentSwarm: undefined,
					swarms: [...this.memory.swarms, swarm.id],
				});
			}
		} else {
			this.createNewSwarm(spirit);
		}
	}

	createNewSwarm(spirit: Spirit): void {
		const swarmId = getSwarmId();
		const swarm = new Swarm<ClaimSwarmMemory>(swarmId);
		swarm.memory = {
			minions: [],
			state: 'gathering',
			strategy: this.name,
		};

		swarm.addSpirit(spirit);

		this.setMemory({
			currentSwarm: swarm.id,
			swarms: [...this.memory.swarms],
		});
	}

	isRequestingSpirit(): boolean {
		return true;
	}
}
