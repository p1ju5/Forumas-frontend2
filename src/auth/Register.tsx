import { useState } from 'react';
import axios from 'axios';
import { Link, Route, Routes } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { useNavigate } from 'react-router-dom';
import config from '../app/config';
import appState from '../app/appState';
import backend, { replaceBackend } from '../app/backend';
import { notifySuccess, notifyFailure } from '../app/notify';
import { RegisterDto, UserDto } from './models';

import { LogInResponse } from './models';
import * as React from 'react';


/**
 * Component state.
 */
class State {
	/** Indicates if log-in dialog is visible. */
	isDialogVisible: boolean = false;

	/** Username, as entered. */
	username: string = "";

	/** Password, as entered. */
	password: string = "";

	email: string = "";

	isEmailErr: boolean = false;

	/** Indicates if username field validation failed. */
	isUsernameErr: boolean = false;

	/** Indicates if password field validation failed.  */
	isPasswordErr: boolean = false;

	/** Indicates if login has failed. */
	isRegisterErr: boolean = false;


	/**
	 * Resets error flags to off.
	 */
	resetErrors() {
		this.isEmailErr = false;
		this.isUsernameErr = false;
		this.isPasswordErr = false;
		this.isRegisterErr = false;
	}

	/**
	 * Makes a shallow clone. Use this to return new state instance from state updates.
	 * @returns A shallow clone of this instance.
	 */
	shallowClone(): State {
		return Object.assign(new State(), this);
	}
}


/**
 * Log-in section in nav bar. React component.
 * @returns Component HTML.
 */
function Register() {
	//get state container and state updater
	const [state, setState] = useState(new State());
	const navigate = useNavigate();
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

	/**
	 * Handles 'Log-in' command in dialog.
	 */
	let onRegister = () => {
		update(() => {
			//reset previous errors
			state.resetErrors();

			//validate fields
			if (state.email.trim() === "")
				state.isEmailErr = true;
			if (/\S+@\S+\.\S+/.test(state.email.trim()) == false)
				state.isEmailErr = true;
			if (state.username === "")
				state.isUsernameErr = true;
			if (state.password === "")
				state.isPasswordErr = true;

			//any fields invalid? abort
			let hasErrs =
				state.isEmailErr ||
				state.isUsernameErr ||
				state.isPasswordErr;

			if (hasErrs)
				return;

			//collect entity data
			let entity = new RegisterDto();
			entity.UserName = state.username;
			entity.Password = state.password;
			entity.Email = state.email;

			//query data
			backend.post<UserDto>(
				config.backendUrl + "/register",
				entity
			)
				//registration ok
				.then(resp => {
					update(() => state.isDialogVisible = false);
					//show success message
					notifySuccess("Registracija s?kminga.");
				})
				//registration failed or backend error, show error message
				.catch(err => {
					updateState(state => {
						console.log(err);
						//state.isDialogVisible = false;
						//state.isRegisterErr = true;
					});
				});
		});
	}

	//render component html
	let html =
		<>
			<button
				type="button"
				className="btn btn-primary btn-sm me-3"
				onClick={() => update(() => state.isDialogVisible = true)}
			>Register</button>
			<Dialog
				visible={state.isDialogVisible}
				onHide={() => update(() => state.isDialogVisible = false)}
				header={<span className="me-2">Registracija</span>}
				style={{ width: "50ch" }}
			>
				{state.isRegisterErr &&
					<div className="alert alert-warning">Registracija nes?kminga.</div>
				}
				<div className="mb-3">
					<label
						htmlFor="email"
						className="form-label"
					>El_pa�tas:</label>
					<InputText
						id="email"
						className={"form-control " + (state.isEmailErr ? "is-invalid" : "")}
						placeholder="?veskite el_pa�t?"
						autoFocus
						value={state.email}
						onChange={(e) => update(() => state.email = e.target.value)}
					/>
					{state.isEmailErr &&
						<div className="invalid-feedback">?veskite el_pa�t?</div>
					}
				</div>
				<div className="mb-3">
					<label
						htmlFor="username"
						className="form-label"
					>Slapyvardis:</label>
					<InputText
						id="username"
						className={"form-control " + (state.isUsernameErr ? "is-invalid" : "")}
						placeholder="?veskite slapyvard?"
						autoFocus
						value={state.username}
						onChange={(e) => update(() => state.username = e.target.value)}
					/>
					{state.isUsernameErr &&
						<div className="invalid-feedback">?veskite slapyvard?</div>
					}
				</div>
				<div className="mb-3">
					<label
						htmlFor="password"
						className="form-label"
					>Slapta�odis:</label>
					<Password
						id="password"
						className={"form-control " + (state.isPasswordErr ? "is-invalid" : "")}
						placeholder="?veskite slapta�od?"
						toggleMask
						feedback={false}
						value={state.password}
						onChange={(e) => update(() => state.password = e.target.value)}
					/>
					{state.isPasswordErr &&
						<div className="invalid-feedback">Password must be non empty.</div>
					}
				</div>
				<div className="d-flex justify-content-end">
					<button
						type="button"
						className="btn btn-primary me-2"
						onClick={() => onRegister()}
					>Registruotis</button>
					<button
						type="button"
						className="btn btn-primary"
						onClick={() => update(() => state.isDialogVisible = false)}
					>At�autki</button>
				</div>
			</Dialog>
		</>;

	//
	return html;
}

//
export default Register;