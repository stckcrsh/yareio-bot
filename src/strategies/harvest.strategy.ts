// import { Agent } from './agent';
// import { DefenseGuru } from './defense-guru';
// import { Overlord } from './circle.overlord';
// import { findMissing, getSpirit, isNil, lerp } from './utils';
// import { Strategy } from './Strategy';

// const MAX_SIZE = 10;
// const BASE_DEFENSE_SIZE_MAX = 100;
// const BASE_DEFENSE_SIZE_MIN = 50;
// const defaultMemory = {};

// export class HarvestingStrat extends Strategy<any> {
// 	memory!: {
// 		/* */
// 	};
// 	agents: Agent[] = [];
// 	centerAgent?: Agent;
// 	baseAgent?: Agent;
// 	starAgents: Agent[] = [];
// 	_isRequestingSpirit = false;
// 	roles = ['harvester', 'harvester', 'center', 'base'];
// 	harvestingPosition: Position;
// 	centerPos: Position;
// 	baseEnergizePosition: Position;
// 	target: any;

// 	constructor(
// 		overlord: Overlord,
// 		name: string,
// 		private star: Star,
// 		private defenseGuru: DefenseGuru
// 	) {
// 		super(overlord, name, defaultMemory);

// 		this.target = this.getEnergizeTarget();

// 		this.harvestingPosition = lerp(
// 			this.star.position,
// 			this.target.position,
// 			0.25
// 		);
// 		this.centerPos = lerp(this.star.position, this.target.position, 0.5);
// 		this.baseEnergizePosition = lerp(
// 			this.star.position,
// 			this.target.position,
// 			0.75
// 		);
// 	}

// 	isRequestingSpirit(): boolean {
// 		return this._isRequestingSpirit;
// 	}

// 	getEnergizeTarget(): ArtificialEntity {
// 		if (this.defenseGuru?.defender) {
// 			const defender = this.defenseGuru.defender;

// 			if (
// 				base.sight.enemies.length > 0 &&
// 				base.energy < BASE_DEFENSE_SIZE_MIN
// 			) {
// 				return base;
// 			}

// 			if (defender.energy < defender.energy_capacity / 2) {
// 				return defender;
// 			}

// 			if (
// 				this.defenseGuru.underAttack &&
// 				base.energy >= BASE_DEFENSE_SIZE_MAX
// 			) {
// 				return defender;
// 			}

// 			if (defender.energy < defender.energy_capacity) {
// 				return defender;
// 			}

// 			return base;
// 		} else {
// 			return base;
// 		}
// 	}

// 	setup(): void {
// 		const TotalMerging = (MAX_SIZE - 1) * 4;

// 		this.agents = my_spirits
// 			.filter((spirit) => getSpirit(spirit.id)?.strategy === this.name)
// 			.map((spirit) => new Agent(spirit));

// 		this.roles = [...this.roles, ...Array(TotalMerging).fill('merger')];

// 		// possible cause units might still be moving to their merge target
// 		const possibleCurrentlTotalSize = this.agents
// 			.map((agent) => agent.memory?.assigned || 1)
// 			.reduce((a, b) => a + b, 0);

// 		this.centerAgent = this.agents.find(
// 			(agent) => this.roles[agent.memory.role] === 'center'
// 		);
// 		this.baseAgent = this.agents.find(
// 			(agent) => this.roles[agent.memory.role] === 'base'
// 		);

// 		if (this.baseAgent) {
// 			this.defenseGuru.funnelSize = this.baseAgent.size;
// 		}

// 		if (this.agents.length < this.roles.length) {
// 			this._isRequestingSpirit = true;
// 		}

// 		this.starAgents = this.agents.filter(
// 			(agent) => this.roles[agent.memory.role] === 'harvester'
// 		);

// 		if (TotalMerging - possibleCurrentlTotalSize > 0) {
// 			this._isRequestingSpirit = true;
// 		}
// 	}

// 	run(): void {
// 		if (this.agents.length < 3) {
// 			this.agents.forEach(this.runDefaultAgent.bind(this));
// 		} else {
// 			this.agents.forEach(this.runSpecialAgent.bind(this));
// 		}
// 	}
// 	runSpecialAgent(agent: Agent): void {
// 		switch (this.roles[agent.memory.role]) {
// 			case 'harvester': {
// 				agent.move(this.harvestingPosition);
// 				if (agent.energy < agent.energy_capacity) {
// 					agent.energize(agent);
// 				} else {
// 					if (this.centerAgent) {
// 						agent.energize(this.centerAgent);
// 					}
// 				}

// 				return;
// 			}
// 			case 'center': {
// 				agent.move(this.centerPos);
// 				if (this.baseAgent) {
// 					agent.energize(this.baseAgent);
// 				}

// 				return;
// 			}
// 			case 'base': {
// 				agent.move(this.baseEnergizePosition);
// 				agent.energize(this.target);

// 				return;
// 			}
// 			case 'merger': {
// 				const target = spirits[agent.memory.target];

// 				if (target) {
// 					if (agent.size > 0) {
// 						agent.move(target.position);
// 						agent.merge(target);
// 					}
// 				} else {
// 					const smallAgents = [
// 						...(this.centerAgent ? [this.centerAgent] : []),
// 						...(this.baseAgent ? [this.baseAgent] : []),
// 						...this.starAgents,
// 					].filter((agent: Agent) => {
// 						if (agent.size >= MAX_SIZE) {
// 							return false;
// 						}
// 						return true;
// 					});

// 					const smallestAgent = smallAgents.sort(
// 						(a, b) => (a.memory?.assigned || 0) - (b.memory?.assigned || 0)
// 					)[0];

// 					const assigned = smallestAgent.memory?.assigned || 0;
// 					smallestAgent.memory = {
// 						assigned: assigned + 1,
// 					} as any;

// 					agent.memory = {
// 						target: smallestAgent.id,
// 					} as any;
// 				}
// 				return;
// 			}
// 		}
// 	}

// 	runDefaultAgent(agent: Agent): void {
// 		const state = agent.memory?.state || 'spawned';

// 		switch (state) {
// 			case 'spawned':
// 				agent.memory = { state: 'harvesting' } as any;
// 				break;
// 			case 'harvesting':
// 				agent.move(this.harvestingPosition);
// 				agent.energize(agent);
// 				if (agent.energy === agent.energy_capacity) {
// 					agent.memory = { state: 'full' } as any;
// 				}
// 				break;
// 			case 'full':
// 				agent.move(this.baseEnergizePosition);
// 				agent.energize(base);

// 				if (agent.energy <= 0) {
// 					agent.memory = { state: 'harvesting' } as any;
// 				}
// 				break;
// 		}
// 	}

// 	hereIsASpirit(spirit: Spirit): void {
// 		const agent = new Agent(spirit);
// 		const currentRoles = this.agents
// 			.filter((agent) => !isNil(agent.memory?.role))
// 			.map((agent) => agent.memory?.role);

// 		const missingRoles = findMissing(
// 			this.roles.map((_, idx) => idx), // map the roles to index for findMissing to work
// 			currentRoles
// 		);

// 		if (missingRoles.length > 0) {
// 			agent.memory = {
// 				role: missingRoles[0],
// 				strategy: this.name,
// 			} as any;
// 			this.agents.push(agent);
// 		}
// 	}
// 	finalize(): void {}
// }
