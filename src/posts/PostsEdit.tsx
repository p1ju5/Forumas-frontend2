import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Rating } from 'primereact/rating';
import { Checkbox } from 'primereact/checkbox';
  
import config from '../app/config';
import backend from '../app/backend';
import { notifySuccess } from '../app/notify';

import { PostEntityForCU, UpdatePostDto, PostEntityForL } from './models';
import React from 'react';


/**
 * Component state.
 */
class State
{	
	isInitialized : boolean = false;
	isLoading : boolean = false;
	isLoaded : boolean = false;

	Id : number = -1;
	Name : string = "";
	Description : string = "";
    CreatedDate: Date  = new Date(Date.now());
    userId : string = "";
    categoryId : number = -1;

	isNameErr : boolean = false;
    isTurinysErr : boolean = false;
	isSaveErr : boolean = false;

	/**
	 * Resets error flags to off.
	 */
	resetErrors() {
		this.isNameErr = false;
        this.isTurinysErr = false;
		this.isSaveErr = false;
	}

	/**
	 * Makes a shallow clone. Use this to return new state instance from state updates.
	 * @returns A shallow clone of this instance.
	 */
	shallowClone() : State {
		return Object.assign(new State(), this);
	}
}


/**
 * Log-in section in nav bar. React component.
 * @returns Component HTML.
 */
function PostEntityEdit() {
	//get state container and state updater
	const [state, setState] = useState(new State());

	//get router stuff
	const navigate = useNavigate();
	const locationParams = useParams();

	/**
	 * This is used to update state without the need to return new state instance explicitly.
	 * It also allows updating state in one liners, i.e., 'update(state => state.xxx = yyy)'.
	 * @param updater State updater function.
	 */
	let update = (updater : () => void) => {
		updater();
		setState(state.shallowClone());
	}

	let updateState = (updater : (state : State) => void) => {
		setState(state => {
			updater(state);
			return state.shallowClone();
		})
	}

	//initialize
	if( !state.isInitialized ) {
		//query data
		backend.get<PostEntityForL>(
			config.backendUrl + `/categories/` + locationParams["categoryId"] + "/posts/" + locationParams["postId"],
			{
				params : {
                    categoryId : locationParams["categoryId"],
					postId : locationParams["postId"]
				}
			}
		)
		.then(resp => {
			updateState(state => {
				//indicate loading finished successfully
				state.isLoading = false;
				state.isLoaded = true;

				//store data loaded
				let data = resp.data;

				state.Id = data.id;
				state.Name = data.name;
                state.Description = data.description;
                state.CreatedDate = new Date(data.createdDate);
                state.userId = data.userId;
			})
		})

		//indicate data is loading and initialization done
		update(() => {
			state.isLoading = true;
			state.isLoaded = false;
			state.isInitialized = true;
		});
	}

	/**
	 * Handles'save' command.
	 */
	let onSave = () => {
		update(() => {
			//reset previous errors
			state.resetErrors();

			//validate form
			if( state.Name.trim() === "" )
				state.isNameErr = true;
            if( state.Description.trim() === "" )
				state.isTurinysErr = true;

            let hasErrs =
                state.isNameErr || 
                state.isTurinysErr;
			//errors found? abort
			if( hasErrs )
				return;

			//collect entity data
			let entity = new PostEntityForCU();
			entity.name = state.Name;
            entity.description = state.Description;
            entity.createdDate = state.CreatedDate.toISOString();
            entity.userId = state.userId;

			//request entity creation
			backend.put(
				config.backendUrl + `/categories/` + locationParams["categoryId"] + "/posts/" + locationParams["postId"],
				entity,
				{
					params : {
						categoryId : locationParams["categoryId"],
						postId : locationParams["postId"],
					}
				}
        )
			//success
			.then(resp => {
				//redirect back to entity list on success
				navigate(`./../../..`, { state : "refresh" });

				//show success message
				notifySuccess("Įrašas atnaujintas.");
			})
			//failure
			.catch(err => {
				updateState(state => state.isSaveErr = true);
			});
		});		
	}

	//render component html
	let html = 
		<>
		<div className="d-flex flex-column h-100 overflow-auto">
			<div className="mb-1 text-center">
			    <h2>Įrašo redagavimas</h2></div>
			{ state.isLoading &&
				<div className="d-flex flex-column flex-grow-1 justify-content-center align-items-center">
					<span className="alert alert-info mx-2">Loading data...</span>
				</div>
			}
			{ state.isInitialized && !state.isLoading && !state.isLoaded &&
				<div className="d-flex flex-column flex-grow-1 justify-content-center align-items-center">
					<span className="alert alert-warning mx-2">Backend failure, please try again...</span>
				</div>
			}
			{ state.isLoaded &&
				<>
				<div className="d-flex justify-content-center">
					<div className="d-flex flex-column align-items-start" style={{width: "80ch"}}>					
						{state.isSaveErr &&
							<div 
								className="alert alert-warning w-100"
								>Saving failed due to backend failure. Please, wait a little and retry.</div>
						}	

						<label htmlFor="id" className="form-label">ID:</label>
						<span id="id">{state.Id}</span>

						<label htmlFor="" className="form-label">Pavadinimas:</label>
						<InputText 
							id="name" 
							className={"form-control " + (state.isNameErr ? "is-invalid" : "")}
							value={state.Name}
							onChange={(e) => update(() => state.Name = e.target.value)}
							/>
						{state.isNameErr && 
							<div className="invalid-feedback">Pavadinimas privalo būti ne tuščias</div>
						}
                        <label htmlFor="" className="form-label">Turinys:</label>
						<textarea
							id="turinys" 
							className={"form-control " + (state.isTurinysErr ? "is-invalid" : "")}
							value={state.Description}
							onChange={(e) => update(() => state.Description = e.target.value)}
							/>
						{state.isTurinysErr && 
							<div className="invalid-feedback">Turinys privalo būti ne tuščias</div>
						}

					</div>
				</div>

				<div className="d-flex justify-content-center align-items-center w-100 mt-1">
					<button
						type="button"
						className="btn btn-primary mx-1"
						onClick={() => onSave()}
						><i className="fa-solid fa-floppy-disk"></i> Išsaugoti</button>
					<button
						type="button"
						className="btn btn-primary mx-1"
						onClick={() => navigate(`./../../..`)}
						><i className="fa-solid fa-xmark"></i> Atšaukti</button>
				</div>
				</>
			}
		</div>
		</>;

	//
	return html;
}

//
export default PostEntityEdit;