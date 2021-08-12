/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import env from '@ckeditor/ckeditor5-utils/src/env';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import FindAndReplaceUI from '../src/findandreplaceui';
import FindAndReplace from '../src/findandreplace';
import loupeIcon from '../theme/icons/find-replace.svg';

describe( 'FindAndReplaceUI', () => {
	let editorElement;
	let editor;
	let dropdown;
	let findCommand;
	let form;
	let plugin;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ FindAndReplace ]
			} )
			.then( newEditor => {
				editor = newEditor;
				dropdown = editor.ui.componentFactory.create( 'findAndReplace' );
				form = dropdown.panelView.children.get( 0 );
				findCommand = editor.commands.get( 'find' );
				plugin = editor.plugins.get( 'FindAndReplaceUI' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( FindAndReplaceUI.pluginName ).to.equal( 'FindAndReplaceUI' );
	} );

	describe( 'constructor()', () => {
		it( 'should set #matchCount', () => {
			expect( plugin.matchCount ).to.equal( 0 );
		} );

		it( 'should set #highlightOffset', () => {
			expect( plugin.highlightOffset ).to.equal( 0 );
		} );

		it( 'should set #formView', () => {
			expect( plugin.formView ).to.equal( form );
		} );
	} );

	describe( 'init()', () => {
		it( 'should add the findAndReplace component to the factory', () => {
			expect( dropdown ).to.be.instanceOf( DropdownView );
		} );

		it( 'should allow creating two instances of the findAndReplace dropdown', () => {
			let secondInstance;

			expect( function createSecondInstance() {
				secondInstance = editor.ui.componentFactory.create( 'findAndReplace' );
			} ).not.to.throw();

			expect( dropdown ).to.not.equal( secondInstance );
		} );

		describe( 'findAndReplace dropdown', () => {
			it( 'should not enable dropdown when find command is disabled', () => {
				findCommand.isEnabled = true;
				expect( dropdown ).to.have.property( 'isEnabled', true );

				findCommand.isEnabled = false;
				expect( dropdown ).to.have.property( 'isEnabled', false );
			} );

			describe( 'upon dropdown open', () => {
				it( 'CSS transitions should be disabled to avoid unnecessary animations (and then enable them again)', () => {
					// (#10008)
					const disableCssTransitionsSpy = sinon.spy( form, 'disableCssTransitions' );
					const enableCssTransitionsSpy = sinon.spy( form, 'enableCssTransitions' );
					const selectSpy = sinon.spy( form._findInputView.fieldView, 'select' );

					dropdown.isOpen = true;

					sinon.assert.callOrder( disableCssTransitionsSpy, selectSpy, enableCssTransitionsSpy );
				} );

				it( 'the form should be reset', () => {
					const spy = sinon.spy( form, 'reset' );

					dropdown.isOpen = true;

					sinon.assert.calledOnce( spy );
				} );

				it( 'the find input content should be selected', () => {
					const spy = sinon.spy( form._findInputView.fieldView, 'select' );

					dropdown.isOpen = true;

					sinon.assert.calledOnce( spy );
				} );

				it( 'the form input content should be focused', () => {
					const spy = sinon.spy( form, 'focus' );

					dropdown.isOpen = true;

					sinon.assert.calledOnce( spy );
				} );

				it( 'all actions should be executed using the "low" priority to let the default open lister act first', () => {
					const spy = sinon.spy();
					const selectSpy = sinon.spy( form._findInputView.fieldView, 'select' );

					dropdown.on( 'change:isOpen', () => {
						spy();
					} );

					dropdown.isOpen = true;

					sinon.assert.callOrder( spy, selectSpy );
				} );
			} );

			describe( 'upon dropdown close', () => {
				it( 'the editing view should be focused', () => {
					dropdown.isOpen = true;

					const spy = sinon.spy( editor.editing.view, 'focus' );

					dropdown.isOpen = false;

					sinon.assert.calledOnce( spy );
				} );

				it( 'the #searchReseted event should be emitted', () => {
					dropdown.isOpen = true;

					const spy = sinon.spy();

					plugin.on( 'searchReseted', spy );

					dropdown.isOpen = false;

					sinon.assert.calledOnce( spy );
				} );
			} );

			describe( 'button', () => {
				it( 'should set an #icon of the #buttonView', () => {
					expect( dropdown.buttonView.icon ).to.equal( loupeIcon );
				} );

				it( 'should set a #label of the #buttonView', () => {
					expect( dropdown.buttonView.label ).to.equal( 'Find and replace' );
				} );

				it( 'should set a #tooltip of the #buttonView', () => {
					expect( dropdown.buttonView.tooltip ).to.be.true;
				} );

				it( 'should set a #keystroke of the #buttonView', () => {
					expect( dropdown.buttonView.keystroke ).to.equal( 'CTRL+F' );
				} );

				it( 'should open the dropdown when CTRL+F was pressed', () => {
					const spy = sinon.spy( form._findInputView.fieldView, 'select' );

					expect( dropdown.isOpen ).to.be.false;

					const keyEventData = ( {
						keyCode: keyCodes.f,
						ctrlKey: !env.isMac,
						metaKey: env.isMac,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					} );

					const wasHandled = editor.keystrokes.press( keyEventData );

					expect( wasHandled ).to.be.true;
					expect( keyEventData.preventDefault.calledOnce ).to.be.true;

					expect( dropdown.isOpen ).to.be.true;
					sinon.assert.calledOnce( spy );
				} );
			} );
		} );

		describe( 'form events and bindings', () => {
			it( 'should bind form\'s #matchCount and #highlightOffset to the UI', () => {
				expect( form.matchCount ).to.equal( 0 );
				expect( form.highlightOffset ).to.equal( 0 );

				plugin.matchCount = 2;
				plugin.highlightOffset = 1;

				expect( form.matchCount ).to.equal( 2 );
				expect( form.highlightOffset ).to.equal( 1 );
			} );

			it( 'should bind form\'s #areCommandsEnabled to various editor commands', () => {
				const commands = editor.commands;

				expect( form.areCommandsEnabled ).to.deep.equal( {
					findNext: false,
					findPrevious: false,
					replace: true,
					replaceAll: true
				} );

				commands.get( 'findNext' ).isEnabled = true;
				commands.get( 'findPrevious' ).isEnabled = true;
				commands.get( 'replace' ).isEnabled = false;
				commands.get( 'replaceAll' ).isEnabled = false;

				expect( form.areCommandsEnabled ).to.deep.equal( {
					findNext: true,
					findPrevious: true,
					replace: false,
					replaceAll: false
				} );
			} );

			it( 'should delegate various form events to the UI', () => {
				const findNextSpy = sinon.spy();
				const findPreviousSpy = sinon.spy();
				const replaceSpy = sinon.spy();
				const replaceAllSpy = sinon.spy();

				plugin.on( 'findNext', findNextSpy );
				plugin.on( 'findPrevious', findPreviousSpy );
				plugin.on( 'replace', replaceSpy );
				plugin.on( 'replaceAll', replaceAllSpy );

				form.fire( 'findNext', { searchText: 'foo' } );
				form.fire( 'findPrevious', { searchText: 'foo' } );
				form.fire( 'replace', { searchText: 'foo' } );
				form.fire( 'replaceAll', { searchText: 'foo' } );

				sinon.assert.calledOnce( findNextSpy );
				sinon.assert.calledOnce( findPreviousSpy );
				sinon.assert.calledOnce( replaceSpy );
				sinon.assert.calledOnce( replaceAllSpy );
			} );

			it( 'should fire #searchReseted when the form becomes disty', () => {
				form.isDirty = false;

				const spy = sinon.spy();

				plugin.on( 'searchReseted', spy );

				form.isDirty = true;
				sinon.assert.calledOnce( spy );

				form.isDirty = false;
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );
} );
