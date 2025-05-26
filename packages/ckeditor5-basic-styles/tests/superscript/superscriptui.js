/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import SuperscriptEditing from '../../src/superscript/superscriptediting.js';
import SuperscriptUI from '../../src/superscript/superscriptui.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

describe( 'SuperscriptUI', () => {
	let editor, superView, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, SuperscriptEditing, SuperscriptUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( SuperscriptUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( SuperscriptUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'toolbar button', () => {
		beforeEach( () => {
			superView = editor.ui.componentFactory.create( 'superscript' );
		} );

		testButton();
	} );

	describe( 'menu bar button', () => {
		beforeEach( () => {
			superView = editor.ui.componentFactory.create( 'menuBar:superscript' );
		} );

		testButton();

		it( 'should create button with `menuitemcheckbox` role', () => {
			expect( superView.role ).to.equal( 'menuitemcheckbox' );
		} );

		it( 'should bind `isOn` to `aria-checked` attribute', () => {
			superView.render();

			superView.isOn = true;
			expect( superView.element.getAttribute( 'aria-checked' ) ).to.be.equal( 'true' );

			superView.isOn = false;
			expect( superView.element.getAttribute( 'aria-checked' ) ).to.be.equal( 'false' );
		} );
	} );

	function testButton() {
		it( 'should register superscript feature component', () => {
			expect( superView ).to.be.instanceOf( ButtonView );
			expect( superView.isOn ).to.be.false;
			expect( superView.label ).to.equal( 'Superscript' );
			expect( superView.icon ).to.match( /<svg / );
			expect( superView.isToggleable ).to.be.true;
		} );

		it( 'should execute superscript command on model execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );

			superView.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'superscript' );
		} );

		it( 'should bind model to superscript command', () => {
			const command = editor.commands.get( 'superscript' );

			expect( superView.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( superView.isEnabled ).to.be.false;
		} );

		it( 'should bind `isOn` to `command`.`value`', () => {
			const command = editor.commands.get( 'superscript' );

			command.value = true;

			expect( superView.isOn ).to.be.true;

			command.value = false;

			expect( superView.isOn ).to.be.false;
		} );
	}
} );
