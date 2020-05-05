/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import PageBreakEditing from '../src/pagebreakediting';
import PageBreakUI from '../src/pagebreakui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'PageBreakUI', () => {
	let editor, editorElement, pageBreakView;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, PageBreakEditing, PageBreakUI ]
			} )
			.then( newEditor => {
				editor = newEditor;

				pageBreakView = editor.ui.componentFactory.create( 'pageBreak' );
			} );
	} );

	afterEach( () => {
		return editor.destroy()
			.then( () => {
				editorElement.remove();
			} );
	} );

	it( 'should register pageBreak feature component', () => {
		expect( pageBreakView ).to.be.instanceOf( ButtonView );
		expect( pageBreakView.label ).to.equal( 'Page break' );
		expect( pageBreakView.icon ).to.match( /<svg / );
		expect( pageBreakView.isToggleable ).to.be.false;
	} );

	it( 'should execute pageBreak command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		pageBreakView.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'pageBreak' );
	} );

	it( 'should bind model to pageBreak command', () => {
		const command = editor.commands.get( 'pageBreak' );

		expect( pageBreakView.isEnabled ).to.be.true;

		command.isEnabled = false;
		expect( pageBreakView.isEnabled ).to.be.false;
	} );
} );
