/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import HtmlEmbedEditing from '../src/htmlembedediting.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import HtmlEmbedUI from '../src/htmlembedui.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import { MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { IconHtml } from 'ckeditor5/src/icons.js';

describe( 'HtmlEmbedUI', () => {
	let element, editor, button;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ HtmlEmbedUI, HtmlEmbedEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();
		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( HtmlEmbedUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( HtmlEmbedUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'the "htmlEmbed" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'htmlEmbed' );
		} );

		testButton( 'htmlEmbed', 'Insert HTML', ButtonView );

		it( 'should have #tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );
	} );

	describe( 'the "menuBar:htmlEmbed" menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:htmlEmbed' );
		} );

		testButton( 'htmlEmbed', 'HTML snippet', MenuBarMenuListItemButtonView );
	} );

	function testButton( featureName, label, Component ) {
		it( 'should register feature component', () => {
			expect( button ).to.be.instanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).to.be.false;
			expect( button.label ).to.equal( label );
			expect( button.icon ).to.equal( IconHtml );
		} );

		it( `should execute ${ featureName } command on model execute event and focus the view then switch to edit source mode` +
			'after inserting the element', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

			button.fire( 'execute' );

			sinon.assert.calledOnceWithExactly( executeSpy, featureName );
			sinon.assert.calledOnce( focusSpy );
			sinon.assert.callOrder( executeSpy, focusSpy );

			expect( document.activeElement.tagName ).to.equal( 'TEXTAREA' );
			expect( document.activeElement.classList.contains( 'raw-html-embed__source' ) ).to.be.true;
		} );

		it( `should bind #isEnabled to ${ featureName } command`, () => {
			const command = editor.commands.get( featureName );

			expect( button.isOn ).to.be.false;

			const initState = command.isEnabled;
			expect( button.isEnabled ).to.equal( initState );

			command.isEnabled = !initState;
			expect( button.isEnabled ).to.equal( !initState );
		} );
	}
} );
