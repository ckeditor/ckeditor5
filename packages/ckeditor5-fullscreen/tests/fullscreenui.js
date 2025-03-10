/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import FullscreenEditing from '../src/fullscreenediting.js';
import FullscreenUI from '../src/fullscreenui.js';
import fullscreenIcon from '../theme/icons/fullscreen.svg';

describe( 'FullscreenUI', () => {
	let domElement, editor;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Essentials,
				FullscreenUI
			]
		} );
	} );

	afterEach( () => {
		domElement.remove();
		return editor.destroy();
	} );

	it( 'should have proper "requires" value', () => {
		expect( FullscreenUI.requires ).to.deep.equal( [ FullscreenEditing ] );
	} );

	it( 'should have proper name', () => {
		expect( FullscreenUI.pluginName ).to.equal( 'FullscreenUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FullscreenUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should register UI components', () => {
		expect( editor.ui.componentFactory.has( 'fullscreen' ) ).to.be.true;
		expect( editor.ui.componentFactory.has( 'menuBar:fullscreen' ) ).to.be.true;
	} );

	describe( 'Fullscreen mode toolbar button', () => {
		let button;

		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'fullscreen' );
		} );

		it( 'should have the base properties', () => {
			expect( button ).to.have.property( 'tooltip', true );
			expect( button ).to.have.property( 'label', 'Fullscreen mode' );
			expect( button ).to.have.property( 'icon', fullscreenIcon );
			expect( button ).to.have.property( 'isToggleable', true );
		} );

		it( '#isEnabled should be bound to the `fullscreen` command', () => {
			const fullscreenCommand = editor.commands.get( 'fullscreen' );

			fullscreenCommand.isEnabled = false;

			expect( button.isEnabled ).to.be.false;

			fullscreenCommand.isEnabled = true;

			expect( button.isEnabled ).to.be.true;
		} );

		it( 'on #execute should call the `fullscreen` command', () => {
			const spy = sinon.spy( editor.commands.get( 'fullscreen' ), 'execute' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( spy );

			button.fire( 'execute' );
		} );
	} );

	describe( 'Fullscreen mode menu bar button', () => {
		let button;

		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:fullscreen' );
		} );

		it( 'should have the base properties', () => {
			expect( button ).to.have.property( 'tooltip', false );
			expect( button ).to.have.property( 'label', 'Fullscreen mode' );
			expect( button ).to.have.property( 'icon', fullscreenIcon );
			expect( button ).to.have.property( 'isToggleable', true );
			expect( button ).to.have.property( 'role', 'menuitemcheckbox' );
		} );

		it( '#isEnabled should be bound to the `fullscreen` command', () => {
			const fullscreenCommand = editor.commands.get( 'fullscreen' );

			fullscreenCommand.isEnabled = false;

			expect( button.isEnabled ).to.be.false;

			fullscreenCommand.isEnabled = true;

			expect( button.isEnabled ).to.be.true;
		} );

		it( 'on #execute should call the `fullscreen` command', () => {
			const spy = sinon.spy( editor.commands.get( 'fullscreen' ), 'execute' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( spy );

			button.fire( 'execute' );
		} );
	} );
} );
