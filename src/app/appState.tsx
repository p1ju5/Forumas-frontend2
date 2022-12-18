import { Subject } from "rxjs";

import { ToastMessage } from 'primereact/toast';

import { ObservableClass } from "../observable/observable";


/**
 * Application state data.
 */
class AppState extends ObservableClass {
	/** User ID, if known. */
	userId: string = "";

	/** User title, if known. */
	userTitle: string = "";

	/** User role */
	userRole: string = "";

	/** Authentication token. */
	authJwt: string | null = null;

	/** Indicates if user is considered to be logged in. */
	isLoggedIn = this.observableProperty<boolean>(false);

	/** Is used to pass messages to app global toast control. */
	msgs = new Subject<ToastMessage>();
}

//export default instance
let appState = new AppState();
export default appState;