import { Overlord } from '../circle.overlord';
import { DefaultHarvest } from './default-harvest.strategy';
import { DefenseGuru } from '../defense-guru';
import { FunnelStrategy } from './funnel.strategy';
import { Strategy } from '../Strategy';
import { getSpirit } from '../utils';

interface ComposeMemory {}

export class Compose extends Strategy<ComposeMemory> {
	strategy!: Strategy<any>;

	constructor(overlord: Overlord, name: string, private guru: DefenseGuru) {
		super(overlord, name, {});
		const spirits = my_spirits.filter(
			(spirit) => getSpirit<any>(spirit.id)?.strategy === this.name
		);
		if (spirits.length > 19) {
			this.strategy = new FunnelStrategy(
				this.overlord,
				this.name,
				this.overlord.myStar,
				base,
				this.guru,
				`${this.name}_funnel`
			);
		} else {
			this.strategy = new DefaultHarvest(
				this.overlord,
				this.name,
				this.guru,
				this.overlord.myStar,
				base,
				`${this.name}_harvest`
			);
		}
	}

	setup(): void {
		this.strategy.setup();
		console.log(this.strategy.memName);
	}

	run(): void {
		this.strategy.run();
	}
	finalize(): void {
		this.strategy.finalize();
	}
	hereIsASpirit(spirit: Spirit): void {
		this.strategy.hereIsASpirit(spirit);
	}
	isRequestingSpirit(): boolean {
		return this.strategy.isRequestingSpirit();
	}
}
