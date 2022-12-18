import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Rating } from 'primereact/rating';
import { Checkbox } from 'primereact/checkbox';
import '../navmenu/NavMenu.scss';  
import config from '../app/config';
import backend from '../app/backend';
import { notifySuccess } from '../app/notify';

import { CommentEntityForCU, CommentEntityForL } from './models';
import appState from '../app/appState';
import React from 'react';

/**
 * Component state.
 */
class State
{	
	id : number = -1;
    description : string = "";

	isNameErr : boolean = false;
	isSaveErr : boolean = false;

	/**
	 * Resets error flags to off.
	 */
	resetErrors() {
		this.isNameErr = false;
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

function EntityCommentCreate() {
	//get state container and state updater
	const [state, setState] = useState(new State());

	//get router stuff
	const navigate = useNavigate();
	const location = useLocation();
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

	/**
	 * Handles'save' command.
	 */
	let onSave = () => {
		update(() => {
			//reset previous errors
			state.resetErrors();

			//validate form
			if( state.description.trim() === "" )
				state.isNameErr = true;

			//errors found? abort
			if( state.isNameErr )
				return;

			//collect entity data
			let entity = new CommentEntityForCU();
			entity.id = state.id;
			entity.description = state.description;
			//request entity creation
			backend.post(
				config.backendUrl + "/categories/" + locationParams["categoryId"] + "/posts/" + locationParams["postId"] + "/comments",
				entity,
                {
                    params : {
                        categoryId : Number(locationParams["categoryId"]),
                        postId : Number(locationParams["postId"]),
                    }
                }
            )
			//success
			.then(resp => {
				//redirect back to entity list on success
				navigate("./../..", { state : "refresh" });

				//show success message
				notifySuccess("Komentaras sukurtas!");
			})
			//failure
			.catch(err => {
				updateState(state => state.isSaveErr = true);
				console.log(err);
			});
		});		
	}

	let html =		
    <>
	<header>
    <div id="contentRight" className="padding-left">
        <textarea rows={4} cols={50} placeholder="Rašykite komentarą..." className='m-2' onChange={(e) => update(() => state.description = e.target.value)}></textarea>
        {state.isNameErr && 
            <div className="invalid-feedback">Name must be non empty and non whitespace.</div>
        }
            <button type="button" className="btn btn-primary mx-1" onClick={() => onSave()}><i className="fa-solid fa-floppy-disk"></i> Skelbti</button>
            <button type="button" className="btn btn-primary mx-1" onClick={() => navigate("./../..")} ><i className="fa-solid fa-xmark"></i> Atšaukti</button>
        </div>	</header>;
  </>;
  return html;
}
  
export default EntityCommentCreate;