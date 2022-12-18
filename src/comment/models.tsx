/**
 * Entity for lists.
 */
 interface CommentEntityForL {
	id: number;
	description: string;
    createdDate: string;
	userId: string;
}

class PostEntityForCU {
	id: number = -1;
    name: string = "";
	description: string = "";
    createdDate: string = "";
}

/**
 * Entity for creating and updating.
 */
class CommentEntityForCU {
	id: number = -1;
    description: string = "";
}

//
export type {
	CommentEntityForL
}

export {
	CommentEntityForCU
}
export {
	PostEntityForCU
}
