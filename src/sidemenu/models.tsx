
/**
 * Entity for lists.
 */
interface CategoryEntityForL {
	id: number;
	name: string;
}

/**
 * Entity for creating and updating.
 */
class CategoryEntityForCU {
	Id: number = -1;
	Name: string = "";
}

//
export type {
	CategoryEntityForL
}

export {
	CategoryEntityForCU
}