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
import { CommentEntityForL, PostEntityForCU } from './models';
import React from 'react';

/**
 * Component state.
 */
class State
{	
	isInitialized : boolean = false;
	isLoading : boolean = false;
	isLoaded : boolean = false;

	entities : CommentEntityForL[] = [];

	Id : number = -1;
    Name: string = "";
    Description: string = "";
	CreatedDate: Date  = new Date(Date.now());
    UserId: string = "";
    PostId: number = -1;

	isDeleting : boolean = false;

	entToDel : CommentEntityForL | null = null;

	/**
	 * Makes a shallow clone. Use this to return new state instance from state updates.
	 * @returns A shallow clone of this instance.
	 */
	shallowClone() : State {
		return Object.assign(new State(), this);
	}
}

function EntityComment() {
	//get state container and state updater
	const [state, updateState] = useState(new State());

	//get router stuff
	const navigate = useNavigate();
	const location = useLocation();
	const locationParams = useParams();

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
		backend.get<CommentEntityForL[]>(
			config.backendUrl + "/categories/" + locationParams["categoryId"] + "/posts/" + locationParams["postId"] + "/comments",
			{
				params : {
					categoryId : locationParams["categoryId"],
                    postId : locationParams["postId"]
				}
			}
		)
		.then(resp => {
			update(state => {
				state.isLoading = false;
				//store data loaded
				state.entities = resp.data;
			})
		})
	

		//query data
		backend.get<PostEntityForCU>(
			config.backendUrl + "/categories/" + locationParams["categoryId"] + "/posts/" + locationParams["postId"],
			{
				params : {
					categoryId : locationParams["categoryId"],
                    postId : locationParams["postId"]
				}
			}
		)
		.then(resp => {
			update(state => {
				//indicate loading finished successfully
				state.isLoading = false;
				state.isLoaded = true;

				//store data loaded
				let data = resp.data;

				state.Id = data.id;
				state.Description = data.description;
				state.Name = data.name;
				state.CreatedDate = new Date(data.createdDate);
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
	/**
	 * Handles 'edit' command.
	 * @param id ID of the entity to edit.
	 */
	let onEdit = (id : number) => {
		navigate(`./comments/edit/${id}`);
	}
	/**
	 * Handles 'delete' command.
	 */
	let onDelete = () => {
		update(() => {
			//close delete dialog
			state.isDeleting = false;

			//send delete request to backend
			backend.delete(
				config.backendUrl + "/categories/" + locationParams["categoryId"] + "/posts/" + locationParams["postId"] + "/comments/" + state.entToDel?.id,
				{
					params : {
                        categoryId : locationParams["categoryId"],
                        postId : locationParams["postId"],
                        commentId : state.entToDel?.id
                        }
				}
			)
			//success
			.then(resp => {
				//force reloading of entity list
				update(() => location.state = "refresh");

				//show success message
				notifySuccess("Komentaras ištrintas sėkmingai.");
			})
			//failure
			.catch(err => {
				//notify about operation failure
				let msg = 
					`Deletion of commentary '${state.entToDel!}' has failed. ` +
					`Backend failure.`;
				notifyFailure(msg);
			})						
		});
	}

	let html =		
    <>
	<header>
	<Dialog
		visible={state.isDeleting} 
		onHide={() => update(() => state.isDeleting = false)}
		header={<span className="me-2">Patvirtinkite komentaro ištrynimą</span>}
		style={{width: "50ch"}}
		>
		<div className="alert alert-warning">Ar tikrai norite ištrinti šį komentarą?</div>
		
		<label htmlFor="id" className="form-label">ID:</label>
		<div id="id">{state.entToDel?.id}</div>

		<label htmlFor="turinys" className="form-label">Turinys:</label>
		<div id="pavadinimas">{state.entToDel?.description}</div>

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
    <div id="contentRight" className="padding-left">
            <div className="newsItem">
                <h2 className="text-align: center;">{state.Name}</h2>
                <p id="description">
                    {state.Description}
                </p>
{/*                 <p id="description">
                    Sukūrimo data: {state.CreatedDate}
                </p> */}
            </div>
            <div className="newsItem">
                <h2 className="text-align: left; margin-left: 15px">Komentarai</h2>
            </div>
            {state.entities.map((comment) => (
				<div className="newsItem">
					<p id="description">{comment.description}</p>
					<p id="description" className="text-align: right;">nuo: {comment.userId}</p>
					{ ((localStorage.getItem("isLoggedIn") == "true" && localStorage.getItem("userRole") == "admin") || (localStorage.getItem("isLoggedIn") == "true" && localStorage.getItem("userId") == comment.userId)) &&
					<div className="">
						<button
							type="button"
							className="btn btn-danger btn-sm mx-1 mt-3 float-right"
							onClick={() => update(() => { state.entToDel = comment; state.isDeleting = true; })}
							><i className="fa-solid fa-trash-can"></i></button>
						<button
							type="button"
							className="btn btn-primary btn-sm mx-1 mt-3"
							onClick={() => onEdit(comment.id)}
							><i className="fa-solid fa-pen-to-square"></i></button>		
					</div>
					}
				</div>
		    ))}
			{ localStorage.getItem("isLoggedIn") == "true" &&
			<button className="btn top active topbutton" >
				<Link className="links" to={`comments/create`}>Rašyti komentarą</Link>
			</button>
			}

        </div>	</header>;
  </>;
  return html;
}
  
export default EntityComment;