/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import SubscriptEditing from '../../src/subscript/subscriptediting.js';
import SubscriptUI from '../../src/subscript/subscriptui.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

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
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'toolbar button', () => {
		beforeEach( () => {
			subView = editor.ui.componentFactory.create( 'subscript' );
		} );

		testButton();
	} );

	describe( 'menu bar button', () => {
		beforeEach( () => {
			subView = editor.ui.componentFactory.create( 'menuBar:subscript' );
		} );

		testButton();

		it( 'should create button with `menuitemcheckbox` role', () => {
			expect( subView.role ).to.equal( 'menuitemcheckbox' );
		} );

		it( 'should bind `isOn` to `aria-checked` attribute', () => {
			subView.render();

			subView.isOn = true;
			expect( subView.element.getAttribute( 'aria-checked' ) ).to.be.equal( 'true' );

			subView.isOn = false;
			expect( subView.element.getAttribute( 'aria-checked' ) ).to.be.equal( 'false' );
		} );
	} );

	function testButton() {
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

			expect( subView.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( subView.isEnabled ).to.be.false;
		} );

		it( 'should bind `isOn` to `command`.`value`', () => {
			const command = editor.commands.get( 'subscript' );

			command.value = true;

			expect( subView.isOn ).to.be.true;

			command.value = false;

			expect( subView.isOn ).to.be.false;
		} );
	}
} );
