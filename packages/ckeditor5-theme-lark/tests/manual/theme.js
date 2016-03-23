/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import IconManagerView from '/ckeditor5/ui/iconmanagerview.js';
import iconManagerModel from '/theme/iconmanagermodel.js';

function setupIconManager() {
	const iconManagerView = new IconManagerView( iconManagerModel );
	document.body.appendChild( iconManagerView.element );
	iconManagerView.init();
}

function renderIcons() {
	const buttonIcons = document.getElementById( 'button-icon' );
	const icons = document.getElementById( 'icons' );
	const tmp = document.createElement( 'div' );

	iconManagerModel.icons.forEach( i => {
		tmp.innerHTML = `<svg class="ck-icon"><use xlink:href="#ck-icon-${ i }"></use></svg>`;

		icons.appendChild( tmp.firstChild );
		icons.appendChild( document.createTextNode( ' ' ) );

		tmp.innerHTML =
			`<button class="ck-button ck-button-notext">
				<svg class="ck-icon ck-icon-left"><use xlink:href="#ck-icon-${ i }"></use></svg>
			</button>`;

		buttonIcons.appendChild( tmp.firstChild );
		buttonIcons.appendChild( document.createTextNode( ' ' ) );
	} );
}

function renderResponsiveButtons() {
	const responsive = document.getElementById( 'button-responsive' );
	let current = responsive.firstElementChild;

	for ( let i = 3; i--; ) {
		const clone = current.cloneNode( 1 );
		current.appendChild( clone );
		current = clone;
	}
}

setupIconManager();
renderIcons();
renderResponsiveButtons();