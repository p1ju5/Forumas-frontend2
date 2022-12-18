import { useState } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Rating } from 'primereact/rating';
import { Checkbox } from 'primereact/checkbox';
import '../navmenu/NavMenu.scss';  
import config from '../app/config';
import backend from '../app/backend';
import { notifySuccess, notifyFailure } from '../app/notify';
import appState from '../app/appState';
import { PostEntityForL, PostEntityForCU, CategoryEntityForCU, PostEntityForDelete, CategoryEntityForL } from './models';
import React from 'react';

/**
 * Component state.
 */
class State
{	
	isInitialized : boolean = false;
	isLoading : boolean = false;
	isLoaded : boolean = false;

	entities : PostEntityForL[] = [];
	categoryName : string = "";
	isDeleting : boolean = false;
	isDeletingPost : boolean = false;
	entToDel : number | null = null;
	postToDel : PostEntityForDelete | null = null;
	postName : string = "";
	postTurinys : string = "";

	/**
	 * Makes a shallow clone. Use this to return new state instance from state updates.
	 * @returns A shallow clone of this instance.
	 */
	shallowClone() : State {
		return Object.assign(new State(), this);
	}
}

function EntityPost() {
	//get state container and state updater
	const [state, updateState] = useState(new State());

	//get router stuff
	const navigate = useNavigate();
	const location = useLocation();
	const locationParams = useParams();

	/**
	 * Handles 'edit' command.
	 * @param id ID of the entity to edit.
	 */
	let onEdit = (id : number) => {
		navigate(`../categories/edit/${id}`);
	}
	
	/**
	 * Handles 'delete' command.
	 */
	let onDelete = () => {
		update(() => {
			//close delete dialog
			state.isDeleting = false;
			console.log(state.entToDel);
			//send delete request to backend
			backend.delete(
				config.backendUrl + "/categories/" + state.entToDel!,
				{
					params : {
						categoryId : state.entToDel!
					}
				}
			)
			//success
			.then(resp => {
				//force reloading of entity list
				update(() => location.state = "refresh");
				navigate("./../", { state : "refresh" });
				//show success message
				notifySuccess("Kategorija ištrinta sėkmingai.");
			})
			//failure
			.catch(err => {
				//notify about operation failure
				let msg = 
					`Deletion of category '${state.entToDel!}' has failed. ` +
					`Backend failure.`;
				notifyFailure(msg);
			})						
		});
	}

	/**
	 * Handles 'edit' command.
	 * @param id ID of the entity to edit.
	 */
	let onEditPost = (id : number) => {
		navigate(`./posts/edit/${id}`);
	}

	/**
	 * Handles 'delete' command.
	 */
	let onDeletePost = () => {
		update(() => {
			//close delete dialog
			state.isDeletingPost = false;

			//send delete request to backend
			backend.delete(
				config.backendUrl + "/categories/" + locationParams["categoryId"] + "/posts/" + state.postToDel?.id,
				{
					params : {
						id : state.postToDel?.id
					}
				}
			)
			//success
			.then(resp => {
				//force reloading of entity list
				//update(() => location.state = "refresh");

				//show success message
				notifySuccess("Įrašas ištrintas sėkmingai.");
			})
			//failure
			.catch(err => {
				//notify about operation failure
				let msg = 
					`Deletion of post '${state.entToDel!}' has failed. ` +
					`Backend failure.`;
				notifyFailure(msg);
			})						
		})
	}
	/**
	 * This is used to update state without the need to return new state instance explicitly.
	 * It also allows updating state in one liners, i.e., 'update(state => state.xxx = yyy)'.
	 * @param updater State updater function.
	 */
	 let update = (updater : (state : State) => void) => {
		updateState(state => {
			updater(state);
			return state.shallowClone();
		})
	}

	//get all posts ids from category_post table
	if( !state.isInitialized || location.state === "refresh" ) {
		//query data
		backend.get<PostEntityForL[]>(
			config.backendUrl + "/categories/" + locationParams["categoryId"] + "/posts",
			{
				params : {
					id : locationParams["categoryId"]
				}
			}
		)
		.then(resp => {
			update(state => {
				//indicate loading finished successfully
				state.isLoading = false;
				

				//store data loaded
				state.entities = resp.data;
				
			})
		})

		backend.get<CategoryEntityForL>(
			config.backendUrl + "/categories/" + locationParams["categoryId"],
			{
				params : {
					categoryId : locationParams["categoryId"]
				}
			}
		)
		//success
		.then(resp => {
			update(state => {
				//indicate loading finished successfully
				state.isLoading = false;
				state.isLoading = true;
				//store data loaded
				state.categoryName = resp.data.name;
				
			})
		})
		
		//drop location state to prevent infinite re-updating
		location.state = null;

		//indicate data is loading and initialization done
		update(() => {
			state.isLoading = true;
			state.isLoaded = false;
			state.isInitialized = true;
		});
	}

	let html =		
		<>
		<header>
		<Dialog
		visible={state.isDeleting} 
		onHide={() => update(() => state.isDeleting = false)}
		header={<span className="me-2">Patvirtinkite kategorijos ištrynimą</span>}
		style={{width: "50ch"}}
		>
		<div className="alert alert-warning">Ar tikrai norite ištrinti šią kategoriją?</div>
		
		<label htmlFor="id" className="form-label">ID:</label>
		<div id="id">{state.entToDel}</div>

		<label htmlFor="pavadinimas" className="form-label">Pavadinimas:</label>
		<div id="pavadinimas">{state.categoryName}</div>

		<div className="d-flex justify-content-end">
			<button
				type="button"
				className="btn btn-primary me-2"
				onClick={() => onDelete()}
				>Patvirtinti</button>
			<button
				type="button"
				className="btn btn-primary"
				onClick={() => update(() => state.isDeleting = false)}
				>Atšaukti</button>
		</div>
	</Dialog>
	<Dialog
		visible={state.isDeletingPost} 
		onHide={() => update(() => state.isDeletingPost = false)}
		header={<span className="me-2">Patvirtinkite įrašo ištrynimą</span>}
		style={{width: "50ch"}}
		>
		<div className="alert alert-warning">Ar tikrai norite ištrinti šį įrašą?</div>
		
		<label htmlFor="id" className="form-label">ID:</label>
		<div id="id">{state.postToDel?.id}</div>

		<label htmlFor="pavadinimas" className="form-label">Pavadinimas:</label>
		<div id="pavadinimas">{state.postToDel?.name}</div>
		<label htmlFor="turinys" className="form-label">Turinys:</label>
		<div id="turinys">{state.postToDel?.description}</div>

		<div className="d-flex justify-content-end">
			<button
				type="button"
				className="btn btn-primary me-2"
				onClick={() => onDeletePost()}
				>Patvirtinti</button>
			<button
				type="button"
				className="btn btn-primary"
				onClick={() => update(() => state.isDeletingPost = false)}
				>Atšaukti</button>
		</div>
	</Dialog>

	<div className="contentRight padding-left">
		{state.entities.map((post) => (
				<div className="newsItem ">
				<p id="title"><Link className="" to={`posts/${post.id}`}>{post.name}</Link></p>
				<p id="description">{post.description}</p>
				{ ((localStorage.getItem("isLoggedIn") == "true" && localStorage.getItem("userRole") == "admin") || (localStorage.getItem("isLoggedIn") == "true" && localStorage.getItem("userId") === post.userId)) &&
				<div className="">
					<button
						type="button"
						className="btn btn-danger btn-sm mx-1 mt-3 float-right"
						onClick={() => update(() => { state.postToDel = post; state.isDeletingPost = true; })}
						><i className="fa-solid fa-trash-can"></i></button>
					<button
						type="button"
						className="btn btn-primary btn-sm mx-1 mt-3"
						onClick={() => onEditPost(post.id)}
						><i className="fa-solid fa-pen-to-square"></i></button>		
				</div>
				}
				</div>
		))}
	</div>
	{ localStorage.getItem("userRole") == "admin" && 
		<div className="padding-left">
			<button
				type="button"
				className="btn btn-danger btn-sm mx-1 mt-3"
				onClick={() => update(() => { state.entToDel = Number(locationParams["categoryId"]); state.isDeleting = true; })}
				><i className="fa-solid fa-trash-can"></i></button>
			<button
				type="button"
				className="btn btn-primary btn-sm mx-1 mt-3"
				onClick={() => onEdit(Number(locationParams["categoryId"]))}
				><i className="fa-solid fa-pen-to-square"></i></button>		
		</div>
	}

	</header>
  </>;
  return html;
}
  
export default EntityPost;