import { Agent } from '../agent';
import { Overlord } from '../circle.overlord';
import { DefenseGuru } from '../defense-guru';
import { Strategy } from '../Strategy';
import { dist, lerp } from '../utils';

const MAX_UNITS = 35;

interface HarvesterMemory {
	units: number;
}

const defaultMemory: HarvesterMemory = {
	units: 0,
};

interface AgentMemory {
	state: string;
	strategy: string;
}

export class DefaultHarvest extends Strategy<HarvesterMemory> {
	agents: Agent<AgentMemory>[] = [];
	harvestingPosition!: Position;
	baseEnergizePosition!: Position;

	constructor(
		overlord: Overlord,
		name: string,
		private guru: DefenseGuru,
		private star: Star,
		private target: ArtificialEntity,
		memName?: string
	) {
		super(overlord, name, defaultMemory, memName);

		const distance = dist(this.star.position, this.target.position);

		this.harvestingPosition = lerp(
			this.star.position,
			this.target.position,
			199 / distance
		);
		this.baseEnergizePosition = lerp(
			this.star.position,
			this.target.position,
			1 - 199 / distance
		);
	}

	setup(): void {
		this.agents = my_spirits
			.map((spirit) => new Agent<AgentMemory>(spirit))
			.filter((agent) => agent.memory?.strategy === this.name)
			.filter((agent) => agent.hp > 0);

		this.updateMemory({ units: this.agents.length });
	}
	run(): void {
		this.agents.forEach((agent) => this.runDefaultAgent(agent));
	}
	runDefaultAgent(agent: Agent<AgentMemory>): void {
		const state = agent.memory?.state || 'spawned';

		switch (state) {
			case 'spawned':
				agent.memory = { state: 'full' } as any;
				break;
			case 'harvesting':
				agent.move(this.harvestingPosition);
				agent.energize(agent);
				if (agent.energy === agent.energy_capacity) {
					agent.memory = { state: 'full' } as any;
				}
				break;
			case 'full':
				agent.move(this.baseEnergizePosition);
				agent.energize(base);

				if (agent.energy <= 0) {
					agent.memory = { state: 'harvesting' } as any;
				}
				break;
		}
	}
	finalize(): void {}
	hereIsASpirit(spirit: Spirit): void {
		const agent = new Agent<AgentMemory>(spirit);
		agent.memory = { state: 'spawned', strategy: this.name } as any;
		this.agents.push(agent);

		this.updateMemory({ units: this.agents.length });
	}
	isRequestingSpirit(): boolean {
		if (this.memory.units < MAX_UNITS) {
			if (this.memory.units >= 20 && this.guru.swarms < 2) {
				return false;
			}
			return true;
		}

		return false;
	}
}
