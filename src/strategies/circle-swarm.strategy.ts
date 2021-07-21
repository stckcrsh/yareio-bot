import { Agent } from '../agent';
import { Overlord } from '../circle.overlord';
import { DefenseGuru } from '../defense-guru';
import { Strategy } from '../Strategy';
import { dist, isAlive, isEmpty, lerp } from '../utils';

interface Swarm {
	leader: string;
	minions: string[];
}

interface SwarmMemory {
	swarms: Swarm[];
	activeSwarm: Swarm | null;
}

interface ThreatMatrix {
	dist: number;
	diff: number;
	id: string;
}

interface AgentMemory {
	state: string;
	strategy: string;
	targetId?: string;
	targetPos: Position | null;
	threats: Record<string, ThreatMatrix>;
}

const defaultMemory: SwarmMemory = {
	swarms: [],
	activeSwarm: null,
};

export class CircleSwarm extends Strategy<SwarmMemory> {
	agents!: Agent<AgentMemory>[];
	swarmSize!: number;

	constructor(overlord: Overlord, name: string, private guru: DefenseGuru) {
		super(overlord, name, defaultMemory);
		this.swarmSize = this.guru.swarmSize;
	}

	setup(): void {}

	run(): void {
		if (this.memory.activeSwarm) {
			const swarm = {...this.memory.activeSwarm};
			const leader = new Agent(spirits[swarm.leader]);

			const minions = swarm.minions.map((id) => new Agent(spirits[id]));

			minions.forEach((minion) => {
				minion.move(leader.position);
				minion.merge(leader);
			});
		}

		this.memory.swarms.forEach((swarm) => {
			let leader = new Agent(spirits[swarm.leader]);

			let minions = swarm.minions
				.map((id) => new Agent(spirits[id]))
				.filter(isAlive);

			if (leader.sight.enemies.length > 0) {
				const target = spirits[leader.sight.enemies[0]];

				const a1c = dist(leader.position, star_a1c.position);
				const zxq = dist(leader.position, star_zxq.position);

				const closerStar = a1c < zxq ? star_a1c : star_zxq;

				if (leader.energy < leader.energy_capacity) {
					leader.move(closerStar.position);
					leader.energize(leader);
				} else {
					leader.move(target.position);
					leader.energize(target);
				}
				minions.forEach((minion) => {
					if (minion.energy < minion.energy_capacity) {
						minion.move(closerStar.position);
						minion.energize(minion);
					} else {
						minion.move(target.position);
						minion.energize(target);
					}
				});
			} else {
				// if (dist(leader.position, closerStar.position) <= 210) {
				// } else {
				leader.move(enemy_base.position);
				leader.energize(enemy_base);
				minions.forEach((minion) => {
					minion.move(enemy_base.position);
					minion.energize(enemy_base);
				});
				// }
			}
		});
		this.setMemory({
			activeSwarm: this.memory.activeSwarm && { ...this.memory.activeSwarm },
			swarms: this.memory.swarms.filter((swarm) => {
				const leader = spirits[swarm.leader];

				const minions = swarm.minions.map((id) => spirits[id]);

				return leader.hp < 1 && minions.every((minion) => minion.hp < 1);
			}),
		});
	}

	runLeader(agent: Agent<AgentMemory>): void {
		const state = agent.memory.state || 'spawned';
		switch (state) {
			case 'spawned': {
				if (agent.size >= this.swarmSize) {
					agent.memory = { state: 'pathing' } as any;
				}
				return;
			}
			case 'pathing': {
				// working our way around outpost to their base

				if (agent.sight.enemies.length > 0) {
					const threats: Record<string, ThreatMatrix> = agent.sight.enemies
						.map((id: string) => spirits[id])
						.reduce((prev: Record<string, ThreatMatrix>, spirit: Spirit) => {
							const distance = dist(spirit.position, agent.position);
							const prevDist = agent.memory?.threats?.[spirit.id].dist;
							const diff = prevDist ? prevDist - distance : 0;
							return {
								...prev,
								[spirit.id]: {
									dist: distance,
									diff,
									id: spirit.id,
								},
							};
						}, {});
					agent.memory.threats = threats;

					const closestEnemy =
						spirits[
							Object.entries(threats).reduce((prev: any, curr: any) => {
								return prev[1].dist < curr[1].dist ? prev : curr;
							})[0]
						];

					const closeEnemies = [
						closestEnemy,
						...closestEnemy.sight.friends_beamable.map((id) => spirits[id]),
					];
					// get energy potential

					const potentialEnergy = closeEnemies.reduce(
						(total, curr) => total + curr.energy,
						0
					);
					const potentialSize = closeEnemies.reduce(
						(total, curr) => total + curr.size,
						0
					);

					if (potentialSize * 2 > agent.energy) {
						// retreat
						agent.memory.state = 'retreating';
						agent.memory.targetId = closestEnemy.id;
						return this.runLeader(agent);
					}

					if (potentialEnergy <= agent.size * 2) {
						// attack
						agent.memory.state = 'engaging';
						agent.memory.targetId = closestEnemy.id;
						return this.runLeader(agent);
					}
				} else {
					agent.memory.threats = {};
				}
				if (
					agent.memory?.targetPos &&
					dist(agent.position, agent.memory.targetPos) <= 200
				) {
					agent.memory.state = 'arrived';
					return this.runLeader(agent);
				}
				if (agent.memory.targetPos) {
					agent.move(agent.memory.targetPos);
				}
				return;
			}
			case 'arrived': {
			}
			case 'retreating': {
				if (agent.memory.targetId) {
					const target = spirits[agent.memory.targetId];
					// just lerp out
					// @ts-ignore
					if (agent.sight.enemies.includes(agent.memory.targetId as string)) {
						agent.move(lerp(target.position, agent.position, 2));
					}
				} else {
					agent.memory.state = 'pathing';
				}
			}
			case 'engaging': {
			}
			case 'recharging': {
			}
		}
	}

	finalize(): void {
		this.guru.swarms =
			this.memory.swarms.length + (this.memory.activeSwarm ? 1 : 0);
	}

	hereIsASpirit(spirit: Spirit): void {
		const agent = new Agent(spirit);

		// there is already a swarm active add this to the minions
		const prevState = { ...this.memory };

		if (this.memory.activeSwarm) {
			const activeSwarm = this.memory.activeSwarm;
			this.setMemory({
				activeSwarm: {
					...prevState.activeSwarm!,
					minions: [...prevState.activeSwarm?.minions!, spirit.id],
				},
				swarms: prevState.swarms,
			});
		} else {
			// no active swarm so start one
			this.setMemory({
				activeSwarm: { leader: agent.id, minions: [] },
				swarms: prevState.swarms,
			});
		}

		// check if the active swarm is full
		if ((this.memory.activeSwarm?.minions.length || 0) >= this.swarmSize) {
			this.setMemory({
				activeSwarm: null,
				swarms: [...prevState.swarms, this.memory.activeSwarm!],
			});
		}

		agent.memory = { strategy: this.name } as any;
	}

	isRequestingSpirit(): boolean {
		if (this.memory.swarms.length === this.swarmSize) {
			return false;
		}

		if (this.memory.activeSwarm) {
			return this.memory.activeSwarm.minions.length < this.swarmSize;
		}
		return true;
	}
}
