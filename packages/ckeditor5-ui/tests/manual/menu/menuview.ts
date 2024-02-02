/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Locale, Rect } from '@ckeditor/ckeditor5-utils';
import MenuView from '../../../src/menu/menuview.js';
import View from '../../../src/view.js';

// const locale = new Locale();

// function createContextualMenuView() {
// 	const menuView = new MenuView( locale );
// 	const contentView = new View( locale );

// 	menuView.render();
// 	document.body.appendChild( menuView.element! );

// 	console.log( menuView.element );

// 	contentView.setTemplate( {
// 		tag: 'div',
// 		children: [
// 			'Content of the menu'
// 		]
// 	} );

// 	menuView.children.add( contentView );

// 	document.body.addEventListener( 'mousedown', evt => {
// 		menuView.anchor = null;
// 	} );

// 	window.addEventListener( 'contextmenu', evt => {
// 		console.log( evt );

// 		menuView.anchor = new Rect( {
// 			left: evt.clientX,
// 			right: evt.clientX,
// 			top: evt.clientY,
// 			bottom: evt.clientY,
// 			width: 0,
// 			height: 0
// 		} );

// 		evt.preventDefault();
// 	} );
// }

// createContextualMenuView();
