/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/editor.js';
import StandardCreator from '/ckeditor5/creator/standardcreator.js';
import Enter from '/ckeditor5/enter/enter.js';
import EnterCommand from '/ckeditor5/enter/entercommand.js';
import DomEventData from '/ckeditor5/engine/treeview/observer/domeventdata.js';

describe( 'Enter feature', () => {
	let editor, editingView;

	beforeEach( () => {
		editor = new Editor( null, {
			creator: StandardCreator,
			features: [ Enter ]
		} );

		return editor.init()
			.then( () => {
				editor.document.createRoot( 'main' );
				editingView = editor.editing.view;
			} );
	} );

	it( 'creates the commands', () => {
		expect( editor.commands.get( 'enter' ) ).to.be.instanceof( EnterCommand );
	} );

	it( 'listens to the editing view enter event', () => {
		const spy = editor.execute = sinon.spy();
		const view = editor.editing.view;
		const domEvt = getDomEvent();

		view.fire( 'enter', new DomEventData( editingView, domEvt ) );

		expect( spy.calledOnce ).to.be.true;
		expect( spy.calledWithExactly( 'enter' ) ).to.be.true;

		expect( domEvt.preventDefault.calledOnce ).to.be.true;
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}
} );
