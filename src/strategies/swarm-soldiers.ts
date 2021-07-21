import { Strategy } from '../Strategy';
import { Agent } from '../agent';
import { Overlord } from '../circle.overlord';
import { dist, getSpirit, isAlive, log } from '../utils';
import { WarMinister } from '../war.minister';

interface SwarmStratMemory {
	swarms: Array<Array<string>>;
	config: SwarmConfig;
}

const defaultMemory: Omit<SwarmStratMemory, 'config'> = {
	swarms: [],
};

interface AgentSwarmMemory {
	initiativeName: string;
	strategy: string;
	destination: Position | null;
	targetId: string | null;
	state: string;
}

interface SwarmConfig {
	swarmSize: number;
}

export class SwarmSoldierStrat extends Strategy<SwarmStratMemory> {
	agents!: Agent<AgentSwarmMemory>[];

	constructor(
		overlord: Overlord,
		name: string,
		memName: string,
		private config: SwarmConfig
		
	) {
		super(overlord, name, { ...defaultMemory, config }, memName);
	}
	setup(): void {
		this.agents = this.getStratAgents();
	}
	run(): void {
		this.memory.swarms.forEach((unitIds) => this.runSwarm(unitIds));
	}

	runSwarm(swarm: string[]): void {
		const agents = swarm.map(
			(unitId) => new Agent<AgentSwarmMemory>(spirits[unitId])
		);

		const livingAgents = agents.filter(isAlive);
		const state = { ...agents[0].memory };

		let newState = { ...state };

		switch (state.state) {
			case 'gathering': {
				livingAgents.forEach((agent) => agent.move(livingAgents[0].position));
				// all full up time to roll out
				if (livingAgents.length >= this.config.swarmSize) {
					newState = {
						...state,
						state: 'pathing',
					};
				}
				break;
			}
			case 'pathing': {
				if (state.destination) {
					livingAgents.forEach((agent) => agent.move(state.destination!));

					const threats = this.mergeSight(livingAgents);
					if (threats.enemies.length > 0) {
						newState = {
							...state,
							targetId: this.findTarget(agents, threats)?.id || null,
						};
						break;
					}
					if (dist(livingAgents[0].position, state.destination) <= 200) {
						newState = {
							...state,
							state: 'arrived',
						};
						break;
					}
				} else {
					newState = {
						...state,
						state: 'targeting',
					};
					break;
				}
				break;
			}
			case 'arrived': {
				const nextStrat = this.getNextStrategy(state.initiativeName);

				if (nextStrat) {
					// switch to the next strategy and reset memory
					newState = {
						strategy: nextStrat,
					} as any;
				}
				break;
			}
			case 'targeting': {
				const destination = this.findDestination(state.initiativeName);
				if (destination) {
					newState = {
						...state,
						state: 'pathing',
						destination,
					};
				}
				break;
			}
			case 'engaging': {
				if (state.targetId) {
					const target = spirits[state.targetId];

					agents.forEach((agent) => {
						agent.move(target.position);
						agent.energize(target);
					});
				} else {
					const threats = this.mergeSight(livingAgents);

					newState = {
						...state,
						targetId: this.findTarget(agents, threats)?.id || null,
					};
					break;
				}
			}
		}

		// reset all their memory after each run
		agents.forEach((agent) => (agent.memory = { ...newState }));
	}

	findTarget(
		swarm: Agent<AgentSwarmMemory>[],
		threats: Sight
	): ArtificialEntity | null {
	}

	findDestination(initiativeName: string): Position | null {
	}

	getNextStrategy(initiativeName: string): string | null {
	}

	hereIsASpirit(spirit: Spirit): void {
		const agent = new Agent<AgentSwarmMemory>(spirit);

		const swarm = this.memory.swarms?.[0];
		if (
			swarm &&
			swarm.some((id) => getSpirit<AgentSwarmMemory>(id)?.state === 'gathering')
		) {
			swarm.push(agent.id);
			const swarmMemory = getSpirit<AgentSwarmMemory>(swarm?.[0]);
			agent.memory = swarmMemory;
		} else {
			this.updateMemory({
				swarms: [[agent.id], ...(this.memory.swarms || [])],
			});
			agent.memory = {
				strategy: this.name,
				state: 'gathering',
				destination: null,
				targetId: null,
			};
		}
	}

	mergeSight(agents: Agent<AgentSwarmMemory>[]): Sight {
		return agents
			.map((agent) => agent.sight)
			.reduce<Sight>(
				(prev, sight) => ({
					enemies: [...prev.enemies, ...sight.enemies],
					enemies_beamable: [
						...prev.enemies_beamable,
						...sight.enemies_beamable,
					],
					friends: [...prev.friends, ...sight.friends],
					friends_beamable: [
						...prev.friends_beamable,
						...sight.friends_beamable,
					],
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
	}

	isRequestingSpirit(): boolean {
	}

	finalize(): void {
		// clean out swarms that are dead or switched strategies
		const livingSwarms = this.memory.swarms.filter((swarm) => {
			const livingAgents = swarm
				.map((id) => new Agent<AgentSwarmMemory>(spirits[id]))
				.filter(isAlive);

			return (
				livingAgents.length > 0 && livingAgents[0].memory.strategy === this.name
			);
		});
		this.memory.swarms = livingSwarms;
	}
}
