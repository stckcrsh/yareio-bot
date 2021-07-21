import { Agent } from '../agent';
import { DefenseGuru } from '../defense-guru';
import { Overlord } from '../circle.overlord';
import { dist, lerp, log } from '../utils';
import { Strategy } from '../Strategy';

const defaultMemory = {};

interface StratMemory {
	baseSpiritId?: string;
	scoutLocation?: Position;
}

interface AgentMemory {
	strategy: string;
	state: string;
}

export class RushDefense extends Strategy<StratMemory> {
	constants = {
		mergeSize: 7,
	};
	baseAgent?: Agent<AgentMemory> | null;
	agents: Agent<AgentMemory>[] = [];

	constructor(
		overlord: Overlord,
		name: string,
		private defenseGuru: DefenseGuru
	) {
		super(overlord, name, defaultMemory);
	}

	get scoutLocation(): Position | undefined {
		return this.memory.scoutLocation;
	}
	set scoutLocation(scoutLocation: Position | undefined) {
		this.updateMemory({
			...this.memory,
			scoutLocation,
		});
	}

	isRequestingSpirit(): boolean {
		const totalSize = this.agents.reduce((a, b) => a + b.size, 0);

		if (!this.memory.baseSpiritId) {
			return true;
		}

		if (this.defenseGuru.funnelSize * 2 > totalSize) {
			return true;
		}

		return false;
	}

	setup(): void {
		// if (!this.scoutLocation) {
		const distanceToOtherBase = dist(base.position, outpost.position);
		// this.scoutLocation = base.position;
		this.scoutLocation = lerp(
			outpost.position,
			base.position,
			601 / distanceToOtherBase
		);
		// }

		this.agents = my_spirits
			.map((spirit) => new Agent<AgentMemory>(spirit))
			.filter((agent) => agent.memory?.strategy === this.name);

		this.baseAgent = this.agents.find(
			(agent) => agent.id === this.memory.baseSpiritId
		);

		if (this.baseAgent) {
			if (this.baseAgent.hp === 0) {
				this.baseAgent = null;
				delete this.memory.baseSpiritId;
			}
		}
	}

	run(): void {
		if (this.baseAgent) {
			this.runBaseAgent(this.baseAgent);
			this.agents
				.filter((agent) => agent.id !== this.baseAgent?.id)
				.forEach(this.runMergeAgent.bind(this));
		}
	}

	runBaseAgent(agent: Agent<AgentMemory>): void {
		const state = agent.memory.state || 'spawned';
		// this.baseAgent?.divide();
		switch (state) {
			case 'spawned': {
				agent.memory = { state: 'scouting' } as any;
				return;
			}
			case 'rushing': {
				agent.move(outpost.position);
				agent.energize(outpost);

				if (!!outpost.control && outpost.control !== 'stckcrsh') {
					agent.memory = { state: 'engaging' } as any;
				}
				return;
			}
			case 'scouting': {
				agent.move(this.scoutLocation!);

				if (agent.sight.enemies.length > 0) {
					agent.memory = {
						state: 'engaging',
					} as any;
				}

				if (agent.size > 30) {
					agent.memory = { state: 'rushing' } as any;
				}

				return;
			}
			case 'engaging': {
				if (target) {
					agent.move(target.position);
					agent.energize(target);
				} else {
					const enemies = this.defenseGuru.enemyIds.map((id) => spirits[id]);
					enemies.sort(
						(a, b) =>
							dist(agent.position, a.position) -
							dist(agent.position, b.position)
					);
					target = enemies?.[0];
				}

				if (!target) {
					agent.memory = { state: 'scouting' } as any;
				}
				agent.move(target.position);
				agent.energize(target);
			}
		}
	}

	getTarget(agent: Agent<any>): Spirit | null {
		if (base.sight.enemies || agent.sight.enemies) {
			return this.getClosest(
				base.position,
				[...base.sight.enemies, ...agent.sight.enemies].map((id) => spirits[id])
			);
		}
		return this.getClosest(
			this.overlord.myStar.position,
			this.defenseGuru.sight.enemies.map((id) => spirits[id])
		);
	}

	getClosest(
		pos: Position,
		enemies: Spirit[],
		minDistance = 99999
	): Spirit | null {
		let min = minDistance;
		let current: Spirit | null = null;
		enemies.forEach((enemy) => {
			const distance = dist(pos, enemy.position);
			if (distance < min) {
				min = distance;
				current = enemy;
			}
		});
		return current;
	}

	runMergeAgent(agent: Agent<AgentMemory>): void {
		agent.move(this.baseAgent!.position);
		agent.merge(this.baseAgent!);
	}

	hereIsASpirit(spirit: Spirit): void {
		const agent = new Agent<AgentMemory>(spirit);

		if (!this.memory.baseSpiritId) {
			// new base spirit
			agent.memory = {
				strategy: this.name,
				role: 'base',
				state: 'spawned',
			} as any;

			// put new agent into the mix
			this.agents.push(agent);

			// set base spirit in memory
			this.updateMemory({
				...this.memory,
				baseSpiritId: spirit.id,
			});

			this.baseAgent = agent;
		} else {
			// new merge spirits
			agent.memory = {
				strategy: this.name,
				role: 'merge',
				state: 'spawned',
			} as any;

			// put new agent into the mix
			this.agents.push(agent);
		}
	}
	finalize(): void {}
}
