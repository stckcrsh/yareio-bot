export abstract class Unit {
	abstract move(target: Position): void;

	abstract energize(target: ArtificialEntity): void;

	abstract merge(target: ArtificialEntity): void;

	abstract shout(str: string): void;

	abstract divide(): void;

	abstract assign(strategy: string): void;
}
