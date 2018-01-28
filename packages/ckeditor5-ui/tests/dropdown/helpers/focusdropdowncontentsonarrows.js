/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

import View from '../../../src/view';
import Model from '../../../src/model';

import focusDropdownContentsOnArrows from '../../../src/dropdown/helpers/focusdropdowncontentsonarrows';
import { createDropdown } from './../../../src/dropdown/utils';

describe( 'focusDropdownContentsOnArrows()', () => {
	let dropdownView;
	let panelChildView;

	beforeEach( () => {
		dropdownView = createDropdown( new Model(), {} );

		panelChildView = new View();
		panelChildView.setTemplate( { tag: 'div' } );
		panelChildView.focus = () => {};
		panelChildView.focusLast = () => {};

		// TODO: describe this as #contentView instead of #listView and #toolbarView
		dropdownView.panelView.children.add( panelChildView );

		focusDropdownContentsOnArrows( dropdownView );

		dropdownView.render();
		document.body.appendChild( dropdownView.element );
	} );

	afterEach( () => {
		dropdownView.element.remove();
	} );

	it( '"arrowdown" focuses the #innerPanelView if dropdown is open', () => {
		const keyEvtData = {
			keyCode: keyCodes.arrowdown,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};
		const spy = sinon.spy( panelChildView, 'focus' );

		dropdownView.isOpen = false;
		dropdownView.keystrokes.press( keyEvtData );
		sinon.assert.notCalled( spy );

		dropdownView.isOpen = true;
		dropdownView.keystrokes.press( keyEvtData );

		sinon.assert.calledOnce( spy );
	} );

	it( '"arrowup" focuses the last #item in #innerPanelView if dropdown is open', () => {
		const keyEvtData = {
			keyCode: keyCodes.arrowup,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};
		const spy = sinon.spy( panelChildView, 'focusLast' );

		dropdownView.isOpen = false;
		dropdownView.keystrokes.press( keyEvtData );
		sinon.assert.notCalled( spy );

		dropdownView.isOpen = true;
		dropdownView.keystrokes.press( keyEvtData );
		sinon.assert.calledOnce( spy );
	} );
} );
