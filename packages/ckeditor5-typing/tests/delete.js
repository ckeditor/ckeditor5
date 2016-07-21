/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '/tests/ckeditor5/_utils/virtualtesteditor.js';
import Delete from '/ckeditor5/typing/delete.js';
import DomEventData from '/ckeditor5/engine/view/observer/domeventdata.js';

describe( 'Delete feature', () => {
	let editor, editingView;

	beforeEach( () => {
		return VirtualTestEditor.create( {
				features: [ Delete ]
			} )
			.then( newEditor => {
				editor = newEditor;
				editingView = editor.editing.view;
			} );
	} );

	it( 'creates two commands', () => {
		expect( editor.commands.get( 'delete' ) ).to.have.property( 'direction', 'backward' );
		expect( editor.commands.get( 'forwardDelete' ) ).to.have.property( 'direction', 'forward' );
	} );

	it( 'listens to the editing view delete event', () => {
		const spy = editor.execute = sinon.spy();
		const view = editor.editing.view;
		const domEvt = getDomEvent();

		view.fire( 'delete', new DomEventData( editingView, domEvt, {
			direction: 'forward',
			unit: 'character'
		} ) );

		expect( spy.calledOnce ).to.be.true;
		expect( spy.calledWithExactly( 'forwardDelete' ) ).to.be.true;

		expect( domEvt.preventDefault.calledOnce ).to.be.true;

		view.fire( 'delete', new DomEventData( editingView, getDomEvent(), {
			direction: 'backward',
			unit: 'character'
		} ) );

		expect( spy.calledTwice ).to.be.true;
		expect( spy.calledWithExactly( 'delete' ) ).to.be.true;
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}
} );
