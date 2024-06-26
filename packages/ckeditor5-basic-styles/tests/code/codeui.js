/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import CodeEditing from '../../src/code/codeediting.js';
import CodeUI from '../../src/code/codeui.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

describe( 'CodeUI', () => {
	let editor, codeView, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, CodeEditing, CodeUI ]
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
			codeView = editor.ui.componentFactory.create( 'code' );
		} );

		testButton();
	} );

	describe( 'menu bar button', () => {
		beforeEach( () => {
			codeView = editor.ui.componentFactory.create( 'menuBar:code' );
		} );

		testButton();

		it( 'should create button with `menuitemcheckbox` role', () => {
			expect( codeView.role ).to.equal( 'menuitemcheckbox' );
		} );

		it( 'should bind `isOn` to `aria-checked` attribute', () => {
			codeView.render();

			codeView.isOn = true;
			expect( codeView.element.getAttribute( 'aria-checked' ) ).to.be.equal( 'true' );

			codeView.isOn = false;
			expect( codeView.element.getAttribute( 'aria-checked' ) ).to.be.equal( 'false' );
		} );
	} );

	function testButton() {
		it( 'should register code feature component', () => {
			expect( codeView ).to.be.instanceOf( ButtonView );
			expect( codeView.isOn ).to.be.false;
			expect( codeView.label ).to.equal( 'Code' );
			expect( codeView.icon ).to.match( /<svg / );
			expect( codeView.isToggleable ).to.be.true;
		} );

		it( 'should execute code command on model execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );

			codeView.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'code' );
		} );

		it( 'should bind `isEnabled` to code command', () => {
			const command = editor.commands.get( 'code' );
			expect( codeView.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( codeView.isEnabled ).to.be.false;
		} );

		it( 'should bind `isOn` to `command`.`value`', () => {
			const command = editor.commands.get( 'code' );

			command.value = true;

			expect( codeView.isOn ).to.be.true;

			command.value = false;

			expect( codeView.isOn ).to.be.false;
		} );
	}
} );
