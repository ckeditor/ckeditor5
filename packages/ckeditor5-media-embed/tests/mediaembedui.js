/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import MediaEmbed from '../src/mediaembed';
import MediaEmbedUI from '../src/mediaembedui';
import MediaFormView from '../src/ui/mediaformview';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import mediaIcon from '../theme/icons/media.svg';

describe( 'MediaEmbedUI', () => {
	let editorElement, editor, dropdown, button, form;

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
				dropdown = editor.ui.componentFactory.create( 'mediaEmbed' );
				button = dropdown.buttonView;
				form = dropdown.panelView.children.get( 0 );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( MediaEmbedUI.pluginName ).to.equal( 'MediaEmbedUI' );
	} );

	it( 'should add the "mediaEmbed" component to the factory', () => {
		expect( dropdown ).to.be.instanceOf( DropdownView );
	} );

	it( 'should allow creating two instances', () => {
		let secondInstance;

		expect( function createSecondInstance() {
			secondInstance = editor.ui.componentFactory.create( 'mediaEmbed' );
		} ).not.to.throw();
		expect( dropdown ).to.be.not.equal( secondInstance );
	} );

	describe( 'dropdown', () => {
		it( 'should bind #isEnabled to the command', () => {
			const command = editor.commands.get( 'mediaEmbed' );

			expect( dropdown.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( dropdown.isEnabled ).to.be.false;
		} );

		it( 'should add a form to the panelView#children collection', () => {
			expect( dropdown.panelView.children.length ).to.equal( 1 );
			expect( dropdown.panelView.children.get( 0 ) ).to.be.instanceOf( MediaFormView );
		} );

		describe( 'button', () => {
			it( 'should set a #label of the #buttonView', () => {
				expect( dropdown.buttonView.label ).to.equal( 'Insert media' );
			} );

			it( 'should set an #icon of the #buttonView', () => {
				expect( dropdown.buttonView.icon ).to.equal( mediaIcon );
			} );

			it( 'should enable tooltips for the #buttonView', () => {
				expect( dropdown.buttonView.tooltip ).to.be.true;
			} );

			describe( '#open event', () => {
				it( 'executes the actions with the "low" priority', () => {
					const spy = sinon.spy();
					const selectSpy = sinon.spy( form.urlInputView.fieldView, 'select' );

					button.on( 'open', () => {
						spy();
					} );

					button.fire( 'open' );
					sinon.assert.callOrder( spy, selectSpy );
				} );

				it( 'should update form\'s #url', () => {
					const command = editor.commands.get( 'mediaEmbed' );

					button.fire( 'open' );
					expect( form.url ).to.equal( '' );

					command.value = 'foo';
					button.fire( 'open' );
					expect( form.url ).to.equal( 'foo' );
				} );

				it( 'should select the content of the input', () => {
					const spy = sinon.spy( form.urlInputView.fieldView, 'select' );

					button.fire( 'open' );
					sinon.assert.calledOnce( spy );
				} );

				it( 'should focus the form', () => {
					const spy = sinon.spy( form, 'focus' );

					button.fire( 'open' );
					sinon.assert.calledOnce( spy );
				} );
			} );
		} );

		describe( '#submit event', () => {
			it( 'checks if the form is valid', () => {
				const spy = sinon.spy( form, 'isValid' );

				dropdown.fire( 'submit' );

				sinon.assert.calledOnce( spy );
			} );

			it( 'executes the command and closes the UI (if the form is valid)', () => {
				const viewFocusSpy = sinon.spy( editor.editing.view, 'focus' );
				const commandSpy = sinon.spy( editor.commands.get( 'mediaEmbed' ), 'execute' );

				// The form is invalid.
				form.url = 'https://invalid/url';
				dropdown.isOpen = true;

				dropdown.fire( 'submit' );

				sinon.assert.notCalled( commandSpy );
				sinon.assert.notCalled( viewFocusSpy );
				expect( dropdown.isOpen ).to.be.true;

				// The form is valid.
				form.url = 'https://valid/url';
				dropdown.fire( 'submit' );

				sinon.assert.calledOnce( commandSpy );
				sinon.assert.calledWithExactly( commandSpy, 'https://valid/url' );
				sinon.assert.calledOnce( viewFocusSpy );
				expect( dropdown.isOpen ).to.be.false;
			} );
		} );

		describe( '#change:isOpen event', () => {
			it( 'resets form status', () => {
				const spy = sinon.spy( form, 'resetFormStatus' );

				dropdown.fire( 'change:isOpen' );

				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( '#cancel event', () => {
			it( 'closes the UI', () => {
				const viewFocusSpy = sinon.spy( editor.editing.view, 'focus' );

				dropdown.isOpen = true;
				dropdown.fire( 'cancel' );

				sinon.assert.calledOnce( viewFocusSpy );
				expect( dropdown.isOpen ).to.be.false;
			} );
		} );
	} );

	describe( 'form', () => {
		it( 'delegates #submit to the dropdown', done => {
			dropdown.once( 'submit', () => done() );

			form.fire( 'submit' );
		} );

		it( 'delegates #cancel to the dropdown', done => {
			dropdown.once( 'submit', () => done() );

			form.fire( 'submit' );
		} );

		it( 'binds urlInputView#isReadOnly to command#isEnabled', () => {
			const command = editor.commands.get( 'mediaEmbed' );

			expect( form.urlInputView.isReadOnly ).to.be.false;

			command.isEnabled = false;
			expect( form.urlInputView.isReadOnly ).to.be.true;
		} );

		it( 'binds saveButtonView#isEnabled to command#isEnabled', () => {
			const command = editor.commands.get( 'mediaEmbed' );

			expect( form.saveButtonView.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( form.saveButtonView.isEnabled ).to.be.false;
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
