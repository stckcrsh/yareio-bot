import { Agent } from '../agent';
import { Overlord } from '../circle.overlord';
import { DefenseGuru } from '../defense-guru';
import { Strategy } from '../Strategy';
import { dist } from '../utils';

export interface ChainStratConfiguration {
	mergeSize: number;
}

interface ChainMemory {
	links: number;
	config: ChainStratConfiguration;
}

interface AgentMemory {
	strategy: string;
	linkNum: number;
}

const defaultMemory: Omit<ChainMemory, 'config'> = {
	links: 0,
};

export class ChainStrat extends Strategy<ChainMemory> {
	agents!: Agent<AgentMemory>[];

	constructor(
		overlord: Overlord,
		name: string,
		memName: string,
		private guru: DefenseGuru,
		config: ChainStratConfiguration
	) {
		super(overlord, name, { ...defaultMemory, config }, memName);
	}

	setup(): void {
		this.agents = this.getStratAgents();
	}
	run(): void {
		this.agents.sort((a, b) => a.memory.linkNum - b.memory.linkNum);

		this.agents.forEach((agent, idx) => {
			if (agent.size < this.memory.config.mergeSize) {
				if (this.agents[idx - 1]) {
					agent.merge(this.agents[idx - 1]);
				}
			} else {
				if (idx === 0) {
					agent.move(outpost.position);
					agent.energize(outpost);
				} else {
					agent.move(this.agents[idx - 1].position);
					if (dist(agent.position, outpost.position) <= 200) {
						agent.energize(outpost);
					} else {
						agent.energize(this.agents[idx - 1]);
					}
				}
			}
		});
	}
	finalize(): void {}
	hereIsASpirit(spirit: Spirit): void {
		const agent = new Agent<AgentMemory>(spirit);

		// increase the links by 1
		this.memory.links = this.memory.links + 1;

		agent.memory = { strategy: this.name, linkNum: this.memory.links };
	}
	isRequestingSpirit(): boolean {
		const spiritsPerTick = Math.ceil(
			base.current_spirit_cost / this.guru.funnelSize
		);
		const ticksPerBeamRangeMove = 200 / 20;
		const cooldown = 2;
		console.log(
			spiritsPerTick,
			this.memory.config.mergeSize,
			cooldown,
			ticksPerBeamRangeMove
		);
		return (
			spiritsPerTick * this.memory.config.mergeSize + cooldown <=
			ticksPerBeamRangeMove
		);
	}
}
