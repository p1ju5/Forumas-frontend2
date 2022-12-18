
/**
 * Entity for lists.
 */
interface PostEntityForL {
	id: number;
	name: string;
    description: string;
    createdDate: string;
    userId: string;
}

/**
 * Entity for creating and updating.
 */
class PostEntityForCU {
	name: string = "";
    description: string = "";
    createdDate: string = "";
    userId: string = "";
}
/**
 * Entity for creating and updating.
 */
class PostEntityForDelete {
    id: number = -1;
	name: string = "";
    description: string = "";
    createdDate: string = "";
    userId: string = "";
}

class CategoryEntityForCU {
	Name: string = "";
}
interface CategoryEntityForL {
    id: number;
	name: string;
}

class UpdatePostDto {
    description: string = "";
}
//
export type {
	PostEntityForL
}
export type {
    CategoryEntityForL
}
export {
	PostEntityForCU
}

export {
	CategoryEntityForCU
}

export {
    UpdatePostDto
}

export {
    PostEntityForDelete
}