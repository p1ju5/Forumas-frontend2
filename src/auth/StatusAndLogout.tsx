import axios from 'axios';

import config from '../app/config';
import appState from '../app/appState';
import backend, { replaceBackend } from '../app/backend';
import * as React from 'react';


/**
 * Log-out section in nav bar. React component.
 * @returns Component HTML.
 */
function StatusAndLogOut() {
	/**
	 * Handles 'Log-out' command.
	 */
	let onLogOut = () => {

		appState.userId = "";
		appState.userTitle = "";
		appState.authJwt = "";
		appState.userRole = "";
		localStorage.setItem("userRole", "");
		localStorage.setItem("userId", "");
		localStorage.setItem("authJwt", "");
		localStorage.setItem("isLoggedIn", "false");

		//replace backend connector with axios instance having default configuration
		let defaultBackend = axios.create();
		replaceBackend(defaultBackend);

		//indicate user is logged out
		appState.isLoggedIn.value = false;
		window.location.reload();
	}

	//render component html
	let html =
		<>
			<span className="d-flex align-items-center">
				<span>Sveiki </span>
				<button
					type="button"
					className="btn btn-primary btn-sm ms-2"
					onClick={() => onLogOut()}
				>Log out</button>
			</span>
		</>;

	//
	return html;
}

//
export default StatusAndLogOut;