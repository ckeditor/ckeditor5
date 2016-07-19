/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '/tests/ckeditor5/_utils/virtualtesteditor.js';
import Enter from '/ckeditor5/enter/enter.js';
import EnterCommand from '/ckeditor5/enter/entercommand.js';
import DomEventData from '/ckeditor5/engine/view/observer/domeventdata.js';

describe( 'Enter feature', () => {
	let editor, editingView;

	beforeEach( () => {
		return VirtualTestEditor.create( {
				features: [ Enter ]
			} )
			.then( newEditor => {
				editor = newEditor;
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
