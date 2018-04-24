/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import SoftBreak from '../src/softbreak';
import SoftBreakCommand from '../src/softbreakcommand';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';

describe( 'Soft Break feature', () => {
	let editor, viewDocument;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ SoftBreak ]
			} )
			.then( newEditor => {
				editor = newEditor;
				viewDocument = editor.editing.view.document;
			} );
	} );

	it( 'creates the commands', () => {
		expect( editor.commands.get( 'softbreak' ) ).to.be.instanceof( SoftBreakCommand );
	} );

	it( 'listens to the editing view softbreak event', () => {
		const spy = editor.execute = sinon.spy();
		const domEvt = getDomEvent();

		viewDocument.fire( 'softbreak', new DomEventData( viewDocument, domEvt ) );

		expect( spy.calledOnce ).to.be.true;
		expect( spy.calledWithExactly( 'softbreak' ) ).to.be.true;

		expect( domEvt.preventDefault.calledOnce ).to.be.true;
	} );

	it( 'scrolls the editing document to the selection after executing the command', () => {
		const domEvt = getDomEvent();
		const executeSpy = editor.execute = sinon.spy();
		const scrollSpy = sinon.stub( editor.editing.view, 'scrollToTheSelection' );

		viewDocument.fire( 'softbreak', new DomEventData( viewDocument, domEvt ) );

		sinon.assert.calledOnce( scrollSpy );
		sinon.assert.callOrder( executeSpy, scrollSpy );
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}
} );
