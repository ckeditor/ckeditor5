/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import HorizontalRuleEditing from '../src/horizontalruleediting';
import HorizontalRuleUI from '../src/horizontalruleui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'HorizontalRuleUI', () => {
	let editor, editorElement, horizontalRuleView;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, HorizontalRuleEditing, HorizontalRuleUI ]
			} )
			.then( newEditor => {
				editor = newEditor;

				horizontalRuleView = editor.ui.componentFactory.create( 'horizontalRule' );
			} );
	} );

	afterEach( () => {
		return editor.destroy()
			.then( () => {
				editorElement.remove();
			} );
	} );

	it( 'should register horizontalRule feature component', () => {
		expect( horizontalRuleView ).to.be.instanceOf( ButtonView );
		expect( horizontalRuleView.label ).to.equal( 'Horizontal rule' );
		expect( horizontalRuleView.icon ).to.match( /<svg / );
		expect( horizontalRuleView.isToggleable ).to.be.false;
	} );

	it( 'should execute horizontalRule command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		horizontalRuleView.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'horizontalRule' );
	} );

	it( 'should bind model to horizontalRule command', () => {
		const command = editor.commands.get( 'horizontalRule' );

		expect( horizontalRuleView.isEnabled ).to.be.true;

		command.isEnabled = false;
		expect( horizontalRuleView.isEnabled ).to.be.false;
	} );
} );
