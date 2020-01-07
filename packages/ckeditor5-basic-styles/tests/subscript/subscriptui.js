/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import SubscriptEditing from '../../src/subscript/subscriptediting';
import SubscriptUI from '../../src/subscript/subscriptui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'SubscriptUI', () => {
	let editor, subView, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, SubscriptEditing, SubscriptUI ]
			} )
			.then( newEditor => {
				editor = newEditor;

				subView = editor.ui.componentFactory.create( 'subscript' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should register subscript feature component', () => {
		expect( subView ).to.be.instanceOf( ButtonView );
		expect( subView.isOn ).to.be.false;
		expect( subView.label ).to.equal( 'Subscript' );
		expect( subView.icon ).to.match( /<svg / );
		expect( subView.isToggleable ).to.be.true;
	} );

	it( 'should execute subscript command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		subView.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'subscript' );
	} );

	it( 'should bind model to subscript command', () => {
		const command = editor.commands.get( 'subscript' );

		expect( subView.isOn ).to.be.false;
		expect( subView.isEnabled ).to.be.true;

		command.value = true;
		expect( subView.isOn ).to.be.true;

		command.isEnabled = false;
		expect( subView.isEnabled ).to.be.false;
	} );
} );
