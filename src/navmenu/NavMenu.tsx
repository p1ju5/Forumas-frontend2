import { Link, Route, Routes } from 'react-router-dom';
import Auth from '../auth/Auth';

import './NavMenu.scss'

import appState from '../app/appState';

import React from 'react';
/**
 * Navigation menu. React component.
 * @returns Component HTML.
 */
function NavMenu() {
	//render component HTML
	let html =		
		<header>
			<nav 
				className="
					navbar
					shadow-sm bg-body rounded m-1 
					d-flex justify-content-between align-items-center"
				>
				<span className="d-flex">
				<div id="">
					<div id="topMenus">
						<ul>
							<li>
								<h3 className="slogan">
									<span className="text-wrapper">
										<Link className="letters"
											to="/" 							
										><span className="letters">Forumas</span></Link>
									</span>	
								</h3>
							</li>
							<li>	
								<button className="btn top active">
									<div>
										<Link className="links"
											to="/taisykles"
											
											>Taisyklės</Link>
									</div>
								</button>
							</li>
							<li>	
								<button className="btn top active">
									<Link className="links"
										to="/kontaktai" 
										
										>Kontaktai</Link>
								</button>
							</li>
							{ localStorage.getItem("isLoggedIn") == "true" && 
							<li>	
								<button className="btn top active">
									<Link className="links"
										to="/skelbti" 
										
										>Skelbti</Link>
								</button>
							</li>
							}
							{ localStorage.getItem("userRole") == "admin" && 
							<li>	
								<button className="btn top active">
									<Link className="links"
										to="/pridetikategorija" 
										
										>Pridėti kategoriją</Link>
								</button>
							</li>
							}

						</ul>
					</div>
				</div>
				</span>
					<span>
						<Auth/>
					</span>
			</nav>
		</header>;
	//
	return html;
}

//export component
export default NavMenu;