/* Type definitions for the various objects you have access to in Yare. */

declare const memory: Record<string, any> // You will probably want to change this

declare type Position = [x: number, y: number]

declare interface Sight {
	friends: string[]
	enemies: string[]
	structures: string[]
}

declare interface Entity {
	id: string,
	position: Position
}

declare interface ArtificialEntity extends Entity {
	size: number
	energy_capacity: number
	energy: number
	hp: 0 | 1
	sight: Sight
}

declare interface Spirit extends ArtificialEntity {
	id: `${string}${number}`

	merged: `${string}${number}`[] | undefined

	move: (target: Position) => void
	energize: (target: Spirit | Base) => void
}

declare interface Circle extends Spirit {
	merge: (target: Circle) => void
	divide: () => void

	merged: `${string}${number}`[]
}

declare interface Square extends Spirit {
	size: 10
	energy_capacity: 100
	jump: (target: Position) => void
}

declare interface Triangle extends Spirit {
	size: 10
	energy_capacity: 100
}

declare interface Structure extends Entity {
	structure_type: string
}

declare interface Base extends Structure, ArtificialEntity {
	id: `base_${string}`
	structure_type: 'base'
	size: 40
	sight: Sight,
	current_spirit_cost: number
}

declare interface CircleBase extends Base {
	energy_capacity: 200
}

declare interface SquareBase extends Base {
	energy_capacity: 500
}

declare interface TriangleBase extends Base {
	energy_capacity: 500
}

declare interface Star extends Structure {
	id: `star_${string}`
	structure_type: 'star'
	position: Position
}

declare const spirits: Record<string, Spirit>
declare const my_spirits: Spirit[]
declare const base: Base
declare const enemy_base: Base
declare const star_zxq: Star
declare const star_a1c: Star
