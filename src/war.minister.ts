import { Overlord } from './circle.overlord';

interface WarMinisterMemory {}

interface Initiative {
	name: string;
	destination: Position;
	target: ArtificialEntity;
	nextStrategy: () => string | null;
}

const defaultMemory: WarMinisterMemory = {};

interface WarConfig {}

export class WarMinister {
	memory!: WarMinisterMemory;
	initiatives: Initiative[] = [];

	constructor(
		private overlord: Overlord,
		private name: string,
		private config: WarConfig
	) {
		if (!memory?.[name]) {
			memory[name] = defaultMemory;
		}
		this.memory = memory[name] as WarMinisterMemory;

	}

	findDestination(initiativeName: string): Position | null {
		const initiative = this.initiatives.find(
			(init) => init.name === initiativeName
		);

		if (!initiative) {
			return null;
		}

		const nextInitiative = initiative.nextStrategy();

		if (nextInitiative) {
			return this.findDestination(nextInitiative);
		}

		return initiative.destination;
	}

	findTarget(initiativeName: string, threats: Sight): ArtificialEntity | null {
		const initiative = this.initiatives.find(
			(init) => init.name === initiativeName
		);

		if (!initiative) {
			return null;
		}

		const nextInitiative = initiative.nextStrategy();

		if (nextInitiative) {
			return this.findTarget(nextInitiative, threats);
		}

		if (initiative.target) {
			return initiative.target;
		}

		return null;
	}

	findInitiative() {
		return this.initiatives.find((init) => init.nextStrategy() === null)!;
	}

	getNextStrategy(initiativeName: string): string | null {
		const initiative = this.initiatives.find(
			(init) => init.name === initiativeName
		);

		const nextStrat = initiative?.nextStrategy()

		if(nextStrat) {
			return nextStrat;
		}

		return null
	}
	
	isRequestingSpirit(){
		return true;
	}

	finalize(): void {
		// use this method to read the current state and develop new initiatives
	}
}
