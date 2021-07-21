import { Unit } from './unit';
import { getSpirit, setSpirit } from './utils';

export class Agent<T> implements ArtificialEntity, Unit {
	spirit;

	constructor(spirit: Spirit) {
		this.spirit = spirit;
	}

	get memory(): T {
		return getSpirit(this.spirit.id) as T;
	}

	set memory(newMemory: T) {
		setSpirit(this.spirit.id, {
			...(this.memory || {}),
			...newMemory,
		} as T);
	}

	get size(): number {
		return this.spirit.size;
	}
	get id(): string {
		return this.spirit.id;
	}
	get mark(): string {
		return this.spirit.mark;
	}
	get sight(): Sight {
		return this.spirit.sight;
	}
	get position(): Position {
		return this.spirit.position;
	}

	get energy(): number {
		return this.spirit.energy;
	}

	get energy_capacity(): number {
		return this.spirit.energy_capacity;
	}

	get hp(): 0 | 1 {
		return this.spirit.hp;
	}

	get player_id(): string {
		return this.spirit.player_id;
	}

	get shape(): 'circles' | 'squares' | 'triangles' {
		return this.spirit.shape;
	}

	get color(): string {
		return this.spirit.color;
	}

	set_mark(mark: string): void {
		this.spirit.set_mark(mark);
	}

	move(target: Position): void {
		this.spirit.move(target);
	}

	energize(target: ArtificialEntity): void {
		this.spirit.energize(target);
	}

	merge(target: ArtificialEntity): void {
		(this.spirit as Circle).merge(target as Circle);
	}

	shout(str: string): void {
		this.spirit.shout(str);
	}

	divide(): void {
		(this.spirit as Circle).divide();
	}

	assign(strategy: string) {
		this.memory = { strategy } as any;
	}

	quit(): void {
		// @ts-ignore
		delete memory.spirits[this.id];
	}
}
