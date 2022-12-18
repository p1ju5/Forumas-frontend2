import { useState } from 'react';
import { useNavigate, useParams} from 'react-router-dom';

import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Rating } from 'primereact/rating';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import config from '../app/config';
import backend from '../app/backend';
import { notifySuccess } from '../app/notify';
import { CategoryEntityForL, PostEntityForCU } from './models';
import appState from '../app/appState';
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
	CategoryId : number = -1;
	CreatedDate: Date  = new Date(Date.now());
	entities : CategoryEntityForL[] = [];
    isPavadinimasErr : boolean = false;
    isTurinysErr : boolean = false;
	isKategorijaErr : boolean = false;

    isSaveErr : boolean = false;

	/**
	 * Resets error flags to off.
	 */
	resetErrors() {
        this.isPavadinimasErr = false;
        this.isTurinysErr = false;
        this.isSaveErr = false;
		this.isKategorijaErr = false;
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
function PostEntityCreate() {
	//get state container and state updater
	const [state, setState] = useState(new State());
	//get router navigator
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

	//(re)initialize
	if( !state.isInitialized) {
		//query data
		backend.get<CategoryEntityForL[]>(
			config.backendUrl + "/categories"
		)
		.then(resp => {
			updateState(state => {
				//indicate loading finished successfully
				state.isLoading = false;
				state.isLoaded = true;

				state.entities = resp.data;
			})
		})

		//drop location state to prevent infinite re-updating
		//location.state = null;
		
		//indicate data is loading and initialization done
		updateState(state => {
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

            //validate fields
			if( state.Name.trim() === "" )
                state.isPavadinimasErr = true;
            if( state.Description.trim() === "" )
                state.isTurinysErr = true;
			if( state.CategoryId === -1 )
                state.isKategorijaErr = true;


            //any fields invalid? abort
			let hasErrs =
                state.isPavadinimasErr || 
                state.isTurinysErr ||
				state.isKategorijaErr;
			
            //errors found? abort
			if( hasErrs )
                return;

			//drop timezone from date, otherwise we will see wrong dates when they come back from backend
			let localDate = new Date(state.CreatedDate.getTime() - state.CreatedDate.getTimezoneOffset() * 60 *1000);

			//collect entity data
			let entity = new PostEntityForCU();
			entity.name = state.Name;
			entity.description = state.Description;

			//request entity creation
			backend.post(
				config.backendUrl + "/categories/" + state.CategoryId + "/posts",
				entity,
                {
                    params : {
                        categoryId : state.CategoryId,
                    }
                }
			)
			//success
			.then(resp => {
				//redirect back to entity list on success
				navigate("./../categories", { state : "refresh" });

				//show success message
				notifySuccess("Įrašas sukurtas.");
			})
			//failure
			.catch(err => {
				console.log(err);
				updateState(state => state.isSaveErr = true);
			});
		});		
	}

	//render component html
	let html = 
		<>
		{ state.isLoaded &&
			<>
		<div className="d-flex flex-column h-100 overflow-auto">
			<div className="mb-1 text-center">
			    <h2>Sukurti naują įrašą</h2></div>
			<div className="d-flex justify-content-center">
				<div className="d-flex flex-column align-items-start" style={{width: "80ch"}}>					
					{state.isSaveErr &&
						<div 
							className="alert alert-warning w-100"
							>Saving failed due to backend failure. Please, wait a little and retry.</div>
					}	

					<label htmlFor="name" className="form-label">Pavadinimas:</label>
					<InputText 
						id="name" 
						className={"form-control " + (state.isPavadinimasErr ? "is-invalid" : "")}
						value={state.Name}
						onChange={(e) => update(() => state.Name = e.target.value)}
						/>
					{state.isPavadinimasErr && 
						<div className="invalid-feedback">Įveskite pavadinimą</div>
					}
                    <label htmlFor="turinys" className="form-label">Turinys:</label>
					<textarea 
						id="turinys" 
						className={"form-control " + (state.isTurinysErr ? "is-invalid" : "")}
						value={state.Description}
						onChange={(e) => update(() => state.Description = e.target.value)}
						/>
					{state.isTurinysErr && 
						<div className="invalid-feedback">Įveskite turinį</div>
					}
                    <label htmlFor="role" className="form-label">Kategorija:</label>
					<Dropdown optionLabel="name" optionValue="id" options={state.entities} onChange={(e) => update(() => state.CategoryId = e.target.value)} placeholder="Pasirinkite kategoriją"/>

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
					onClick={() => navigate("./../")}
					><i className="fa-solid fa-xmark"></i> Atšaukti</button>
			</div>
		</div>
			</>
		}
	</>;

	//
	return html;
}

//
export default PostEntityCreate;