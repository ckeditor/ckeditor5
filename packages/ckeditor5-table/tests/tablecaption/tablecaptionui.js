/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import TableCaptionEditing from '../../src/tablecaption/tablecaptionediting.js';
import TableCaptionUI from '../../src/tablecaption/tablecaptionui.js';
import TableEditing from '../../src/tableediting.js';

describe( 'TableCaptionUI', () => {
	let editor, tableCaption, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, TableEditing, TableCaptionEditing, TableCaptionUI ]
		} ).then( newEditor => {
			editor = newEditor;

			tableCaption = editor.ui.componentFactory.create( 'toggleTableCaption' );
		} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableCaptionUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableCaptionUI.isPremiumPlugin ).to.be.false;
	} );

	it( 'should register toggleTableCaption feature component', () => {
		expect( tableCaption ).to.be.instanceOf( ButtonView );
		expect( tableCaption.icon ).to.match( /<svg / );
		expect( tableCaption.tooltip ).to.be.true;
		expect( tableCaption.isToggleable ).to.be.true;
	} );

	it( 'should execute toggleTableCaption command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		tableCaption.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'toggleTableCaption', {
			focusCaptionOnShow: true
		} );
	} );

	it( 'should scroll the editing view to the caption on the #execute event if the caption showed up', () => {
		editor.setData( '<figure class="table"><table><tr><td>foo</td></tr></table></figure>' );

		const executeSpy = testUtils.sinon.spy( editor.editing.view, 'scrollToTheSelection' );

		tableCaption.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
	} );

	it( 'should focus the editing view on the #execute event if the caption showed up', () => {
		editor.setData( '<figure class="table"><table><tr><td>foo</td></tr></table></figure>' );

		const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

		tableCaption.fire( 'execute' );

		sinon.assert.calledOnce( focusSpy );
	} );

	it( 'should focus the editing view on the #execute event if the caption was hidden', () => {
		editor.setData( '<figure class="table"><table><tr><td>foo</td></tr></table><figcaption>caption</figcaption></figure>' );

		const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

		tableCaption.fire( 'execute' );

		sinon.assert.calledOnce( focusSpy );
	} );

	it( 'should not scroll the editing view on the #execute event if the caption was hidden', () => {
		editor.setData( '<figure class="table"><table><tr><td>foo</td></tr></table><figcaption>foo</figcaption></figure>' );

		const executeSpy = testUtils.sinon.spy( editor.editing.view, 'scrollToTheSelection' );

		tableCaption.fire( 'execute' );

		sinon.assert.notCalled( executeSpy );
	} );

	it( 'should highlight the figcaption element in the view on the #execute event if the caption showed up', () => {
		editor.setData( '<figure class="table"><table><tr><td>foo</td></tr></table></figure>' );

		tableCaption.fire( 'execute' );

		const figcaptionElement = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 2 );

		expect( figcaptionElement.hasClass( 'table__caption_highlighted' ) ).to.be.true;
	} );

	it( 'should not scroll or highlight anything if figcaption element is missing', () => {
		sinon.stub( editor.editing.mapper, 'toViewElement' ).returns( null );

		editor.setData( '<figure class="table"><table><tr><td>foo</td></tr></table></figure>' );

		const executeSpy = testUtils.sinon.spy( editor.editing.view, 'scrollToTheSelection' );
		const figcaptionElement = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 2 );

		tableCaption.fire( 'execute' );

		sinon.assert.notCalled( executeSpy );
		expect( figcaptionElement ).to.be.undefined;
	} );

	it( 'should bind model to toggleTableCaption command', () => {
		const command = editor.commands.get( 'toggleTableCaption' );

		command.value = true;
		expect( tableCaption.isOn ).to.be.true;
	} );

	it( 'should have #label bound to the toggleTableCaption command', () => {
		const command = editor.commands.get( 'toggleTableCaption' );

		command.value = true;
		expect( tableCaption.label ).to.equal( 'Toggle caption off' );

		command.value = false;
		expect( tableCaption.label ).to.equal( 'Toggle caption on' );
	} );
} );
