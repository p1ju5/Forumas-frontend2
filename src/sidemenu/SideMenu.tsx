import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NavLink } from "react-router-dom";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';

import Auth from '../auth/Auth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import '../navmenu/NavMenu.scss'
import config from '../app/config';
import backend from '../app/backend';
import { notifySuccess, notifyFailure } from '../app/notify';

import { CategoryEntityForL, CategoryEntityForCU } from './models';

import React from 'react';

/**
 * Component state.
 */
 class State
 {
	 isInitialized : boolean = false;
	 isLoading : boolean = false;
	 isLoaded : boolean = false;
 
	 entities : CategoryEntityForL[] = [];
 
	 isDeleting : boolean = false;
 
	 /**
	  * Makes a shallow clone. Use this to return new state instance from state updates.
	  * @returns A shallow clone of this instance.
	  */
	 shallowClone() : State {
		 return Object.assign(new State(), this);
	 }
 }
 
/**
 * List the instances of the entity.
 * @returns Component HTML.
 */
 function CategoryEntityList() {
	//get state container and state updater
	const [state, updateState] = useState(new State());

	//get router stuff
	const navigate = useNavigate();
	const location = useLocation();


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

	//(re)initialize
	if( !state.isInitialized || location.state === "refresh" ) {
		//query data
		backend.get<CategoryEntityForL[]>(
			config.backendUrl + "/categories"
		)
		.then(resp => {
			update(state => {
				//indicate loading finished successfully
				state.isLoading = false;
				state.isLoaded = true;

				//store data loaded
				state.entities = resp.data;
				console.log(state.entities)
			})
		})

		//drop location state to prevent infinite re-updating
		location.state = null;
		
		//indicate data is loading and initialization done
		update(state => {
			state.isLoading = true;
			state.isLoaded = false;
			state.isInitialized = true;
		});
	}

	let onButtonClick = (id : number) => {
		update(() => location.state = "refresh");
		navigate(`./categories/${id}`, { state : "refresh" });
		//window.location. reload();
	}
	//render component HTML
	let html =		
		<>
		<header>
			<nav 
				className="
					navbar 
					shadow-sm bg-body rounded m-1 
					d-flex justify-content-between align-items-center"
				>
				<span className="d-flex">
					<div id="contentLeft">
                        <h2>Temos</h2>
						<ul>
							{state.entities.map((category) => (
								<li>	
									<button className="btn links"
										onClick={() => onButtonClick(category.id)}>
										{category.name}
									</button>					
								</li>
							))}
						</ul>
					</div>
				</span>
			</nav>
		</header>;
		</>;

	//
	return html;
 }
//export component
export default CategoryEntityList;