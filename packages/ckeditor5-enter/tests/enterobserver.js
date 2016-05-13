/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import TreeView from '/ckeditor5/engine/treeview/treeview.js';
import EnterObserver from '/ckeditor5/enter/enterobserver.js';
import DomEventData from '/ckeditor5/engine/treeview/observer/domeventdata.js';
import { getCode } from '/ckeditor5/utils/keyboard.js';

describe( 'Enter feature', () => {
	let treeView, observer;

	beforeEach( () => {
		treeView = new TreeView();
		observer = treeView.addObserver( EnterObserver );
	} );

	describe( 'enter event', () => {
		it( 'is fired on keydown', () => {
			const spy = sinon.spy();

			treeView.on( 'enter', spy );

			treeView.fire( 'keydown', new DomEventData( treeView, getDomEvent(), {
				keyCode: getCode( 'enter' )
			} ) );

			expect( spy.calledOnce ).to.be.true;
		} );
		it( 'is not fired on keydown when keyCode does not match enter', () => {
			const spy = sinon.spy();

			treeView.on( 'enter', spy );

			treeView.fire( 'keydown', new DomEventData( treeView, getDomEvent(), {
				keyCode: 1
			} ) );

			expect( spy.calledOnce ).to.be.false;
		} );
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}
} );
