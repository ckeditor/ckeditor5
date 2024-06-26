/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

// TODO change to new ListEditing
import LegacyListEditing from '../../src/legacylist/legacylistediting.js';
import ListUI from '../../src/list/listui.js';
import List from '../../src/list.js';
import ListProperties from '../../src/listproperties.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';

describe( 'ListUI', () => {
	let editorElement, editor, model;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, { plugins: [ Paragraph, BlockQuote, LegacyListEditing, ListUI ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListUI ) ).to.be.instanceOf( ListUI );
	} );

	describe( 'toolbar buttons', () => {
		let bulletedListButton, numberedListButton;

		beforeEach( () => {
			bulletedListButton = editor.ui.componentFactory.create( 'bulletedList' );
			numberedListButton = editor.ui.componentFactory.create( 'numberedList' );
		} );

		it( 'should set up buttons for bulleted list and numbered list', () => {
			expect( bulletedListButton ).to.be.instanceOf( ButtonView );
			expect( bulletedListButton.isToggleable ).to.be.true;

			expect( numberedListButton ).to.be.instanceOf( ButtonView );
			expect( numberedListButton.isToggleable ).to.be.true;
		} );

		it( 'should execute proper commands when buttons are used', () => {
			sinon.spy( editor, 'execute' );

			bulletedListButton.fire( 'execute' );
			sinon.assert.calledWithExactly( editor.execute, 'bulletedList' );

			numberedListButton.fire( 'execute' );
			sinon.assert.calledWithExactly( editor.execute, 'numberedList' );
		} );

		it( 'should bind bulleted list button model to bulledList command', () => {
			setData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

			const command = editor.commands.get( 'bulletedList' );

			expect( bulletedListButton.isOn ).to.be.true;
			expect( bulletedListButton.isEnabled ).to.be.true;

			command.value = false;
			expect( bulletedListButton.isOn ).to.be.false;

			command.isEnabled = false;
			expect( bulletedListButton.isEnabled ).to.be.false;
		} );

		it( 'should bind numbered list button model to numberedList command', () => {
			setData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

			const command = editor.commands.get( 'numberedList' );

			// We are in UL, so numbered list is off.
			expect( numberedListButton.isOn ).to.be.false;
			expect( numberedListButton.isEnabled ).to.be.true;

			command.value = true;
			expect( numberedListButton.isOn ).to.be.true;

			command.isEnabled = false;
			expect( numberedListButton.isEnabled ).to.be.false;
		} );
	} );

	describe( 'menu bar menus', () => {
		let bulletedListButton, numberedListButton;

		beforeEach( () => {
			bulletedListButton = editor.ui.componentFactory.create( 'menuBar:bulletedList' );
			numberedListButton = editor.ui.componentFactory.create( 'menuBar:numberedList' );
		} );

		it( 'should set proper `role` and `isToggleable` attributes', () => {
			expect( bulletedListButton.role ).to.be.equal( 'menuitemcheckbox' );
			expect( numberedListButton.role ).to.be.equal( 'menuitemcheckbox' );

			expect( bulletedListButton.isToggleable ).to.be.true;
			expect( numberedListButton.isToggleable ).to.be.true;
		} );

		it( 'should set up buttons for bulleted list and numbered list', () => {
			expect( bulletedListButton ).to.be.instanceOf( MenuBarMenuListItemButtonView );
			expect( numberedListButton ).to.be.instanceOf( MenuBarMenuListItemButtonView );
		} );

		it( 'should execute proper commands when buttons are used', () => {
			sinon.spy( editor, 'execute' );

			bulletedListButton.fire( 'execute' );
			sinon.assert.calledWithExactly( editor.execute, 'bulletedList' );

			numberedListButton.fire( 'execute' );
			sinon.assert.calledWithExactly( editor.execute, 'numberedList' );
		} );

		it( 'should bind bulleted list button model to bulledList command', () => {
			setData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

			const command = editor.commands.get( 'bulletedList' );

			expect( bulletedListButton.isOn ).to.be.true;
			expect( bulletedListButton.isEnabled ).to.be.true;

			command.value = false;
			expect( bulletedListButton.isOn ).to.be.false;

			command.isEnabled = false;
			expect( bulletedListButton.isEnabled ).to.be.false;
		} );

		it( 'should bind numbered list button model to numberedList command', () => {
			setData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

			const command = editor.commands.get( 'numberedList' );

			// We are in UL, so numbered list is off.
			expect( numberedListButton.isOn ).to.be.false;
			expect( numberedListButton.isEnabled ).to.be.true;

			command.value = true;
			expect( numberedListButton.isOn ).to.be.true;

			command.isEnabled = false;
			expect( numberedListButton.isEnabled ).to.be.false;
		} );
	} );

	describe( 'list properties', () => {
		let editorElement, editor;

		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor.create( editorElement, {
				plugins: [ Paragraph, BlockQuote, ListProperties, List ]
			} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'should not override list properties ui components', () => {
			const bulletedListButton = editor.ui.componentFactory.create( 'bulletedList' );
			const numberedListButton = editor.ui.componentFactory.create( 'numberedList' );

			expect( bulletedListButton.class ).to.be.equal( 'ck-list-styles-dropdown' );
			expect( numberedListButton.class ).to.be.equal( 'ck-list-styles-dropdown' );
		} );
	} );
} );
