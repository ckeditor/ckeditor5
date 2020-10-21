/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import HtmlEmbedEditing from '../src/htmlembedediting';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import HtmlEmbedUI from '../src/htmlembedui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

describe( 'HtmlEmbedEditing', () => {
	let element, editor, view, viewDocument, htmlEmbedView;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ HtmlEmbedUI, HtmlEmbedEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				view = editor.editing.view;
				viewDocument = view.document;

				htmlEmbedView = editor.ui.componentFactory.create( 'htmlEmbed' );
			} );
	} );

	afterEach( () => {
		element.remove();
		return editor.destroy();
	} );

	it( 'should register htmlEmbed feature component', () => {
		expect( htmlEmbedView ).to.be.instanceOf( ButtonView );
		expect( htmlEmbedView.label ).to.equal( 'Insert HTML' );
		expect( htmlEmbedView.icon ).to.match( /<svg / );
		expect( htmlEmbedView.isToggleable ).to.be.false;
	} );

	it( 'should execute htmlEmbedInsert command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		htmlEmbedView.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'htmlEmbedInsert' );
	} );

	it( 'should bind model to htmlEmbedInsert command', () => {
		const command = editor.commands.get( 'htmlEmbedInsert' );

		expect( htmlEmbedView.isEnabled ).to.be.true;

		command.isEnabled = false;
		expect( htmlEmbedView.isEnabled ).to.be.false;
	} );

	it( 'should switch to edit source mode after inserting the element', () => {
		htmlEmbedView.fire( 'execute' );

		const editSourceView = viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 1 );
		expect( document.activeElement ).to.equal( editSourceView.getCustomProperty( 'domElement' ) );
	} );
} );
