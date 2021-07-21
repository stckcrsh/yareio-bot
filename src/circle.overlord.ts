import { AllRush } from './strategies/all-rush.strategy';
import { ChainStrat } from './strategies/chain-spread.strategy';
import { CircleSwarm } from './strategies/circle-swarm.strategy';
import { Compose } from './strategies/composed.strategy';
import { DefaultHarvest } from './strategies/default-harvest.strategy';
import { DefenseGuru } from './defense-guru';
import { FunnelStrategy } from './strategies/funnel.strategy';
// import { HarvestingStrat } from './harvest.strategy';
// import { InitialPull } from './initialPull.strategy';
// import { RushDefense } from './rush_defense.strategy';
import { dist, getSpirit } from './utils';
import { SwarmSoldierStrat } from './strategies/swarm-soldiers';
import { WarMinister } from './war.minister';
import { ClaimOutpost } from './strategies/claim-outpost';

const stars = [star_zxq, star_a1c];

const AVG_SIZE = 10;

interface OverlordMemory {
	strategies: Record<string, any>;
	messages: any[];
	myStar?: number;
	enemyStar?: number;
	energyGain: number[];
	prevBaseEnergy: number;
	enemyShapes: string;
	config: any;
}

const defaultMemory: Partial<OverlordMemory> = {
	strategies: {},
	messages: [],
	energyGain: [],
};

const squareDefenseConfig = {
	swarmSize: 7,
};

const defaultConfig = {
	swarmSize: 4,
};

export class Overlord {
	memory!: OverlordMemory;

	strategies: any[];
	guru!: DefenseGuru;
	warMinister!: WarMinister;

	myStar!: Star;
	enemyStar!: Star;

	constructor() {
		if (!memory.overlord) {
			memory.overlord = { ...defaultMemory, prevBaseEnergy: base.energy };
		}
		this.memory = memory.overlord as OverlordMemory;

		if (!this.memory.enemyShapes) {
			this.memory.enemyShapes = Object.values(spirits).find(
				(spirit) => spirit.player_id !== 'stckcrsh'
			)!.shape;

			if (this.memory.enemyShapes === 'squares') {
				this.memory.config = squareDefenseConfig;
			} else {
				this.memory.config = defaultConfig;
			}
		}

		this.strategies = [];

		if (!this.memory?.myStar) {
			const a1c = dist(base.position, star_a1c.position);
			const zxq = dist(base.position, star_zxq.position);

			this.memory.myStar = a1c < zxq ? 1 : 0;
			this.memory.enemyStar = a1c < zxq ? 0 : 1;
		}
		this.myStar = stars[this.memory.myStar];
		this.enemyStar = stars[this.memory.enemyStar!];
	}

	setup(): void {
		this.guru = new DefenseGuru(this, this.memory.config);
		this.warMinister = new WarMinister(this, 'war', {});

		if (
			Object.values(spirits)
				.filter((spirit) => spirit.hp)
				.filter((spirit) => spirit.player_id !== 'stckcrsh').length === 0
		) {
			this.strategies.push(new AllRush(this, 'rush'));
		} else {
			// if (outpost.control === 'stckcrsh') {
			// 	this.strategies.push(
			// 		new HarvestingStrat(this, 'star_p89', star_p89, this.guru)
			// 	);
			// }

			// priorities are from top to bottom
			// this.strategies.push(new RushDefense(this, 'rushdefense', this.guru));
			// if (tick >= 80) {
			//   this.strategies.push(new HarvestingStrat(this, 'star_p89', star_p89));
			// }
			// this.strategies.push(
			// 	new HarvestingStrat(this, 'star_zxq', star_zxq, this.guru)
			// );

			// this.strategies.push(
			// 	new ChainStrat(this, 'chain', 'chain', this.guru, {
			// 		mergeSize: 2,
			// 	})
			// );
			// this.strategies.push(new CircleSwarm(this, 'swarm', this.guru));

			// basic econmy has to be always running
			this.strategies.push(
				new FunnelStrategy(this, 'funnel', this.myStar, base, this.guru)
			);

			if (outpost.control === 'stckcrsh') {
				this.strategies.push(
					new ChainStrat(this, 'chain', 'chain', this.guru, {
						mergeSize: 2,
					})
				);
				this.strategies.push(
					new FunnelStrategy(this, 'outpost-funnel', star_p89, base, this.guru)
				);
			}
			this.strategies.push(
				new ClaimOutpost(this, 'outpost', 'outpost', this.memory.config)
			);

			// this.strategies.push(new Compose(this, 'compose', this.guru));
		}
	}

	setupStrats(): void {
		this.strategies.forEach((strat) => {
			try {
				strat.setup();
			} catch (e) {
				console.error(e);
			}
		});
	}

	runStrats(): void {
		this.strategies.forEach((strat) => {
			try {
				strat.run();
			} catch (e) {
				console.error(e);
			}
		});
	}

	finalize(): void {
		console.log(this.guru.funnelSize);

		this.handleOrphans();

		this.strategies.forEach((strat) => strat.finalize());

		const energyChange =
			base.energy < this.memory.prevBaseEnergy
				? 25 - this.memory.prevBaseEnergy + base.energy
				: base.energy - this.memory.prevBaseEnergy;

		const energyGains =
			this.memory.energyGain.length >= AVG_SIZE
				? this.memory.energyGain.slice(1)
				: this.memory.energyGain;
		const energies = [...energyGains, energyChange];

		this.memory.energyGain = energies;
		this.memory.prevBaseEnergy = base.energy;

		// @ts-ignore
		this.memory = memory.overlord;

		console.log(
			Math.floor(
				this.memory.energyGain.reduce(
					(prev, curr, _, arr) => prev + curr / arr.length,
					0
				)
			)
		);
	}

	handleOrphans(): void {
		// get all orphans and place them with a strategy
		const orphans = my_spirits.filter((spirit) => !getSpirit(spirit.id));
		orphans.forEach((spirit) => {
			const strat = this.strategies.find((strat) => strat.isRequestingSpirit());
			if (strat) {
				strat.hereIsASpirit(spirit);
			}
		});
	}
}
