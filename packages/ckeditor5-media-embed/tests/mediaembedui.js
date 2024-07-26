/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import MediaEmbed from '../src/mediaembed.js';
import MediaEmbedUI from '../src/mediaembedui.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import mediaIcon from '../theme/icons/media.svg';
import { ButtonView, DialogViewPosition, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';

describe( 'MediaEmbedUI', () => {
	let editorElement, editor, button;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ MediaEmbed ],
				mediaEmbed: {
					providers: [
						{
							name: 'valid-media',
							url: /^https:\/\/valid\/(.*)/,
							html: id => `<iframe src="${ id }"></iframe>`
						}
					]
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				button = editor.ui.componentFactory.create( 'mediaEmbed' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( MediaEmbedUI.pluginName ).to.equal( 'MediaEmbedUI' );
	} );

	it( 'should allow creating two instances', () => {
		let secondInstance;

		expect( function createSecondInstance() {
			secondInstance = editor.ui.componentFactory.create( 'mediaEmbed' );
		} ).not.to.throw();
		expect( button ).to.not.equal( secondInstance );
	} );

	describe( 'toolbar button', () => {
		testButton( 'Insert media', ButtonView );

		it( 'should enable tooltips for the #buttonView', () => {
			expect( button.tooltip ).to.be.true;
		} );
	} );

	describe( 'menuBar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:mediaEmbed' );
		} );

		testButton( 'Media', MenuBarMenuListItemButtonView );
	} );

	describe( 'dialog', () => {
		let form, dialog;

		beforeEach( () => {
			button.fire( 'execute' );
			dialog = editor.plugins.get( 'Dialog' );
			form = editor.plugins.get( 'MediaEmbedUI' )._formView;
		} );

		it( 'has two action buttons', () => {
			expect( dialog.view.actionsView.children ).to.have.length( 2 );
			expect( dialog.view.actionsView.children.get( 0 ).label ).to.equal( 'Cancel' );
			expect( dialog.view.actionsView.children.get( 1 ).label ).to.equal( 'Accept' );
		} );

		it( 'should be open as modal', () => {
			expect( dialog.view.isModal ).to.be.true;
		} );

		it( 'should be open at screen center', () => {
			expect( dialog.view.position ).to.be.equal( DialogViewPosition.SCREEN_CENTER );
		} );

		testSubmit( 'Accept button', () => {
			const acceptButton = dialog.view.actionsView.children.get( 1 );

			acceptButton.fire( 'execute' );
		} );

		testSubmit( 'Form submit (enter key)', () => {
			form.fire( 'submit' );
		} );

		function testSubmit( suiteName, action ) {
			describe( suiteName, () => {
				it( 'checks if the form is valid', () => {
					const spy = sinon.spy( form, 'isValid' );

					action();

					sinon.assert.calledOnce( spy );
				} );

				it( 'executes the command and closes the UI (if the form is valid)', async () => {
					const commandSpy = sinon.spy( editor.commands.get( 'mediaEmbed' ), 'execute' );

					// The form is invalid.
					form.url = 'https://invalid/url';

					action();

					sinon.assert.notCalled( commandSpy );

					expect( dialog.id ).to.be.equal( 'mediaEmbed' );

					// The form is valid.
					form.url = 'https://valid/url';
					action();

					sinon.assert.calledOnce( commandSpy );
					sinon.assert.calledWithExactly( commandSpy, 'https://valid/url' );

					await wait( 10 );

					expect( dialog.id ).to.be.null;
				} );
			} );
		}

		describe( 'Cancel button', () => {
			let cancelButton;

			beforeEach( () => {
				cancelButton = dialog.view.actionsView.children.get( 0 );
			} );

			it( 'closes the UI', async () => {
				cancelButton.fire( 'execute' );

				await wait( 10 );

				expect( dialog.id ).to.be.null;
			} );
		} );

		describe( 'form', () => {
			it( 'should trim URL input value', () => {
				form.urlInputView.fieldView.element.value = '   ';
				form.urlInputView.fieldView.fire( 'input' );

				expect( form.mediaURLInputValue ).to.equal( '' );

				form.urlInputView.fieldView.element.value = '   test   ';
				form.urlInputView.fieldView.fire( 'input' );

				expect( form.mediaURLInputValue ).to.equal( 'test' );
			} );

			it( 'should implement the CSS transition disabling feature', () => {
				expect( form.disableCssTransitions ).to.be.a( 'function' );
			} );

			describe( 'validators', () => {
				it( 'check the empty URL', () => {
					form.url = '';
					expect( form.isValid() ).to.be.false;

					form.url = 'https://valid/url';
					expect( form.isValid() ).to.be.true;
				} );

				it( 'check the supported media', () => {
					form.url = 'https://invalid/url';
					expect( form.isValid() ).to.be.false;

					form.url = 'https://valid/url';
					expect( form.isValid() ).to.be.true;
				} );
			} );
		} );
	} );

	function testButton( label, expectedType ) {
		it( 'should add the "mediaEmbed" component to the factory', () => {
			expect( button ).to.be.instanceOf( expectedType );
		} );

		it( 'should bind #isEnabled to the command', () => {
			const command = editor.commands.get( 'mediaEmbed' );

			expect( button.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( button.isEnabled ).to.be.false;
		} );

		it( 'should set a #label of the #buttonView', () => {
			expect( button.label ).to.equal( label );
		} );

		it( 'should set an #icon of the #buttonView', () => {
			expect( button.icon ).to.equal( mediaIcon );
		} );

		it( 'should open media embed dialog', () => {
			const dialogPlugin = editor.plugins.get( 'Dialog' );
			expect( dialogPlugin.id ).to.be.null;

			button.fire( 'execute' );

			expect( dialogPlugin.id ).to.equal( 'mediaEmbed' );
		} );

		it( 'should hide media embed dialog on second click', () => {
			const dialogPlugin = editor.plugins.get( 'Dialog' );
			expect( dialogPlugin.id ).to.be.null;

			button.fire( 'execute' );
			button.fire( 'execute' );

			expect( dialogPlugin.id ).to.be.null;
		} );
	}
} );

function wait( time ) {
	return new Promise( res => {
		global.window.setTimeout( res, time );
	} );
}
