import axios, { AxiosInstance } from 'axios';

/**
 * This module exposes a separate axios instance to be used for connections to backend.
 *
 * When user logs in, this instance is replaced with one configured to send 'Authorization'
 * header with JWT bearer token included. The replacement is performed by 'LogIn' and 
 * 'DevelopmentLogIn' components.
 * 
 * When user logs out, an instance with default configuration is set again. The replacement
 * is performed by 'StatusAndLogout' component.
 */

let backend = axios.create();

/**
 * Function to set backend instance. Must be used, because typescript prevents setting
 * imported variables in the importing scope.
 * @param instance Axios instance to use from now on.
 */
function replaceBackend(instance: AxiosInstance) {
    backend = instance;
}

//
export {
    backend as default,
    replaceBackend
}