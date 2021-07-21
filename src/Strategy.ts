import { Agent } from './agent';
import { Overlord } from './circle.overlord';

export abstract class Strategy<T> {
	memory!: T;
	memName!: string;

	constructor(
		protected overlord: Overlord,
		protected name: string,
		defaultMemory: T,
		memName?: string
	) {
		this.memName = memName || this.name;

		if (!this.overlord.memory.strategies[this.memName]) {
			this.overlord.memory.strategies[this.memName] = defaultMemory;
		}

		this.memory = this.overlord.memory.strategies[this.memName];
	}

	updateMemory(newMemory: Partial<T>) {
		const update = {
			...this.memory,
			...newMemory,
		};
		this.overlord.memory.strategies[this.memName] = update;
		this.memory = update;
	}

	setMemory(newMemory: T) {
		this.overlord.memory.strategies[this.memName] = newMemory;
		this.memory = newMemory;
	}

	getStratAgents<U extends { strategy: string }>() {
		return my_spirits
			.map((spirit) => new Agent<U>(spirit))
			.filter((agent) => agent.hp > 0)
			.filter((agent) => agent.memory?.strategy === this.name);
	}

	abstract setup(): void;
	abstract run(): void;
	abstract finalize(): void;
	abstract hereIsASpirit(spirit: Spirit): void;
	abstract isRequestingSpirit(): boolean;
}
