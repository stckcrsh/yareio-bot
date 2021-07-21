import { Agent } from '../agent';
import { Overlord } from '../circle.overlord';
import { Strategy } from '../Strategy';

const STARTING_UNITS = 11;

interface PullMemory {
	units: number;
}

const defaultMemory = {
	units: 0,
};

interface AgentMemory {
	strategy: string;
}

export class InitialPull extends Strategy<PullMemory> {
	agents!: Agent<AgentMemory>[];
	memory!: PullMemory;

	constructor(overlord: Overlord, name: string) {
		super(overlord, name, defaultMemory);
	}

	setup(): void {
		this.agents = my_spirits
			.map((spirit) => new Agent<AgentMemory>(spirit))
			.filter((spirit) => spirit.memory?.strategy === this.name)
			.filter((spirit) => spirit.hp > 0);
	}
	run(): void {
		this.agents.forEach((agent) => {
			agent.move(base.position);
			agent.energize(base);
			if (agent.energy === 0) {
				agent.quit();
			}
		});
	}
	finalize(): void {}

	isRequestingSpirit(): boolean {
		return this.memory.units < STARTING_UNITS;
	}

	hereIsASpirit(spirit: Spirit): void {
		const agent = new Agent(spirit);
		agent.memory = { strategy: this.name } as any;
		this.updateMemory({ units: this.memory.units + 1 });
	}
}
