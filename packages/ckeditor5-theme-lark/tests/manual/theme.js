/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import IconManagerView from '/ckeditor5/ui/iconmanagerview.js';
import Model from '/ckeditor5/ui/model.js';
import IconView from '/ckeditor5/ui/icon/iconview.js';
import ButtonView from '/ckeditor5/ui/button/buttonview.js';
import iconManagerModel from '/theme/iconmanagermodel.js';

function setupIconManager() {
	const iconManagerView = new IconManagerView( iconManagerModel );
	document.body.appendChild( iconManagerView.element );
	iconManagerView.init();
}

function renderIcons() {
	const containers = [
		document.getElementById( 'icons' ),
		document.getElementById( 'iconsColored' )
	];
	const buttonIcons = document.getElementById( 'buttonIcon' );

	iconManagerModel.icons.forEach( i => {
		const view = new IconView( new Model( { icon: i } ) );
		const button = new ButtonView( new Model( { label: i, icon: i, isEnabled: true } ) );
		button.init();

		containers.forEach( c => {
			c.appendChild( view.element.cloneNode( 1 ) );
			c.appendChild( document.createTextNode( ' ' ) );
		} );

		buttonIcons.appendChild( button.element );
		buttonIcons.appendChild( document.createTextNode( ' ' ) );
	} );
}

function renderResponsiveButtons() {
	const responsive = document.getElementById( 'buttonResponsive' );
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
