import { useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { Toast } from 'primereact/toast';

import appState from './app/appState';
import NavMenu from './navmenu/NavMenu';
import CategoryEntityCreate from './navmenu/CategoryCreate';
import Taisykles from './navmenu/Taisykles';
import Kontaktai from './navmenu/Kontraktai';
import PostEntityCreate from './navmenu/PostCreate';
import CategoryEntityList from './sidemenu/SideMenu';
import EntityPost from './posts/Posts';
import CategoryEntityEdit from './posts/CategoryEdit';
import PostEntityEdit from './posts/PostsEdit';
import EntityComment from './comment/Comment';
import EntityCommentCreate from './comment/CommentCreate';
import CommentEntityEdit from './comment/CommentEdit';
import './App.css';

import * as React from 'react';
import Auth from './auth/Auth';

class State {
	isInitialized: boolean = false;

	/**
	 * Makes a shallow clone. Use this to return new state instance from state updates.
	 * @returns A shallow clone of this instance.
	 */
	shallowClone(): State {
		return Object.assign(new State(), this);
	}
}


/**
 * Application. React component.
 * @returns Component HTML.
 */
function App() {
	//get state container and state updater
	const [state, setState] = useState(new State());

	//get ref to interact with the toast
	const toastRef = useRef<Toast>(null);


	/**
	 * This is used to update state without the need to return new state instance explicitly.
	 * It also allows updating state in one liners, i.e., 'update(state => state.xxx = yyy)'.
	 * @param updater State updater function.
	 */
	let update = (updater: () => void) => {
		updater();
		setState(state.shallowClone());
	}

	let updateState = (updater: (state: State) => void) => {
		setState(state => {
			updater(state);
			return state.shallowClone();
		})
	}

	//initialize
	if (!state.isInitialized) {
		//subscribe to app state changes
		appState.when(appState.isLoggedIn, () => {
			//this will force component re-rendering
			updateState(state => { });
		});

		//subscribe to user messages
		appState.msgs.subscribe(msg => {
			update(() => toastRef.current?.show(msg));
		});

		//indicate initialization is done
		updateState(state => state.isInitialized = true);
	}

	//render component HTML
	let html =
		<Router>
			<NavMenu/>
			<CategoryEntityList/>
			<Routes>
				<Route path="/categories/:categoryId" element={<EntityPost/>}/>
				<Route path="/pridetikategorija" element={<CategoryEntityCreate/>}/>
				<Route path="/categories/edit/:categoryId" element={<CategoryEntityEdit/>}/>
				<Route path="/skelbti" element={<PostEntityCreate/>}/>
				<Route path="/categories/:categoryId/posts/edit/:postId" element={<PostEntityEdit/>}/>
				<Route path="/categories/:categoryId/posts/:postId" element={<EntityComment/>}/>
				<Route path="/categories/:categoryId/posts/:postId/comments/create" element={<EntityCommentCreate/>}/>
				<Route path="/categories/:categoryId/posts/:postId/comments/edit/:commentId" element={<CommentEntityEdit/>}/>
				<Route path="/taisykles" element={<Taisykles/>}/>
				<Route path="/kontaktai" element={<Kontaktai/>}/>

			</Routes>
			<Toast ref={toastRef} position="top-right" />
		</Router>;

	//
	return html;
}

export default App;
