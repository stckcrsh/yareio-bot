import { Agent } from '../agent';
import { Overlord } from '../circle.overlord';
import { Strategy } from '../Strategy';

interface RushMemory {
	init: boolean;
}

const defaultMemory: RushMemory = {
	init: false,
};
interface AgentMemory {
	state: string;
	strategy: string;
}

/**
 * This strategy just takes all guys and runs them at the enemy_base
 */
export class AllRush extends Strategy<RushMemory> {
	agents: Agent<AgentMemory>[] = [];

	constructor(overlord: Overlord, name: string) {
		super(overlord, name, defaultMemory);
	}

	isRequestingSpirit(): boolean {
		return false;
	}

	setup(): void {
		this.agents = my_spirits.map((spirit) => new Agent(spirit));

		if (!this.memory.init) {
			this.agents.forEach((agent) => {
				// reset their memory to spawned
				agent.memory = { state: 'spawned', strategy: this.name };
			});
			this.updateMemory({ init: true });
		}
	}
	run(): void {
		this.agents.forEach((agent) => {
			this.runDefaultAgent(agent);
		});
	}
	runDefaultAgent(agent: Agent<AgentMemory>): void {
		const state = agent.memory?.state || 'spawned';

		switch (state) {
			case 'spawned':
				agent.memory.state = 'harvesting';
				break;
			case 'harvesting':
				agent.move(star_a1c.position);
				agent.energize(agent);
				if (agent.energy === agent.energy_capacity) {
					agent.memory.state = 'full';
				}
				break;
			case 'full':
				agent.move(enemy_base.position);
				agent.energize(enemy_base);

				if (agent.energy <= 0) {
					agent.memory.state = 'harvesting';
				}
				break;
		}
	}
	finalize(): void {}
	hereIsASpirit(spirit: Spirit): void {}
}
