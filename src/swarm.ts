import { Agent } from './agent';
import { Unit } from './unit';
import { isAlive, setSpirit } from './utils';

export interface SwarmMemory {
	minions: string[];
	strategy: string;
}

// need a way to treat a group of spirits as a single entity
export class Swarm<T extends SwarmMemory> implements Unit, ArtificialEntity {
	agents!: Agent<any>[];
	player_id = 'stckcrsh';

	constructor(public id: string) {
		this.agents = this.memory.minions.map((id) => new Agent<any>(spirits[id]));
	}

	setStrategy(strategy: string) {
		this.memory.strategy = strategy;
		this.assign(strategy);
	}

	assign(strategy: string): void {
		this.agents.forEach((agent) => (agent.memory = { strategy } as any));
	}

	get memory(): T {
		// @ts-ignore
		if (!memory.swarms[this.id]) {
			// @ts-ignore
			memory.swarms[this.id] = {
				minions: [],
			} as T;
		}
		// @ts-ignore
		return memory.swarms[this.id] as T;
	}

	set memory(newMemory: T) {
		// @ts-ignore
		memory.swarms[this.id] = newMemory;
	}

	get position() {
		return this.livingAgents[0].position;
	}

	get color() {
		return this.agents[0].color;
	}

	get shape() {
		return this.agents[0].shape;
	}

	get size() {
		return this.livingAgents.reduce((total, agent) => total + agent.size, 0);
	}

	get hp() {
		return this.livingAgents.length > 0 ? 1 : 0;
	}

	get energy() {
		return this.livingAgents.reduce((total, agent) => total + agent.energy, 0);
	}

	get energy_capacity() {
		return this.livingAgents.reduce(
			(total, agent) => total + agent.energy_capacity,
			0
		);
	}

	get length() {
		return this.memory.minions.length;
	}

	addSpirit(spirit: Spirit) {
		this.memory.minions.push(spirit.id);
		setSpirit(spirit.id, { strategy: this.memory.strategy });
	}

	addAgent(agent: Agent<any>) {
		this.memory.minions.push(agent.id);
		agent.memory.strategy = this.memory.strategy;
	}

	get sight() {
		return this.livingAgents
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

	move(target: Position): void {
		this.agents.forEach((agent) => agent.move(target));
	}
	energize(target: ArtificialEntity | Star): void {
		if ('structure_type' in target && target.structure_type === 'star') {
			this.agents.forEach((agent) => agent.energize(agent));
			return;
		}

		this.agents.forEach((agent) => agent.energize(target as ArtificialEntity));
		return;
	}
	merge(target: ArtificialEntity): void {
		this.agents.forEach((agent) => agent.merge(target));
	}
	shout(str: string): void {
		this.livingAgents?.[0].shout(str);
	}
	divide(): void {
		this.agents.forEach((agent) => agent.divide());
	}

	get livingAgents() {
		return this.agents.filter(isAlive);
	}

	getMemory() {
		return this.agents?.[0]?.memory;
	}

	setMemory(newMemory: any) {
		this.agents.forEach((agent) => (agent.memory = newMemory));
	}
}
