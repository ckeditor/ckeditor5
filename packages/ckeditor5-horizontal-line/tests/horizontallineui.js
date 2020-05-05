/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import HorizontalLineEditing from '../src/horizontallineediting';
import HorizontalLineUI from '../src/horizontallineui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'HorizontalLineUI', () => {
	let editor, editorElement, horizontalLineView;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, HorizontalLineEditing, HorizontalLineUI ]
			} )
			.then( newEditor => {
				editor = newEditor;

				horizontalLineView = editor.ui.componentFactory.create( 'horizontalLine' );
			} );
	} );

	afterEach( () => {
		return editor.destroy()
			.then( () => {
				editorElement.remove();
			} );
	} );

	it( 'should register horizontalLine feature component', () => {
		expect( horizontalLineView ).to.be.instanceOf( ButtonView );
		expect( horizontalLineView.label ).to.equal( 'Horizontal line' );
		expect( horizontalLineView.icon ).to.match( /<svg / );
		expect( horizontalLineView.isToggleable ).to.be.false;
	} );

	it( 'should execute horizontalLine command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		horizontalLineView.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'horizontalLine' );
	} );

	it( 'should bind model to horizontalLine command', () => {
		const command = editor.commands.get( 'horizontalLine' );

		expect( horizontalLineView.isEnabled ).to.be.true;

		command.isEnabled = false;
		expect( horizontalLineView.isEnabled ).to.be.false;
	} );
} );
