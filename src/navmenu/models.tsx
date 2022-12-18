/**
 * Entity for lists.
 */
interface CategoryEntityForL {
	id: number;
    name: string;
}

/**
 * Category for creating and updating.
 */
class CategoryEntityForCU {
	name: string = "";
}

/**
 * Entity for creating and updating.
 */
class PostEntityForCU {
	name: string = "";
    description: string = "";
}

export type {
    CategoryEntityForL
}

export {
	CategoryEntityForCU
}

export {
	PostEntityForCU
}