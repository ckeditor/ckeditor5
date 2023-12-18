/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { env, keyCodes } from '@ckeditor/ckeditor5-utils';

import { Dialog, DialogView, DialogViewPosition } from '../../src';

/* global document */

describe( 'Dialog', () => {
	let editor, editorElement, dialogPlugin;

	beforeEach( () => {
		Dialog.visibleDialogPlugin = undefined;

		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, Dialog ]
			} )
			.then( newEditor => {
				editor = newEditor;
				dialogPlugin = editor.plugins.get( Dialog );
			} );
	} );

	afterEach( () => {
		editor.destroy();
		editorElement.remove();
		Dialog.visibleDialogPlugin = undefined;
	} );

	it( 'should initialise without #visibleDialogPlugin set', () => {
		expect( Dialog.visibleDialogPlugin ).to.be.undefined;
	} );

	describe( 'constructor()', () => {
		describe( 'should initialise', () => {
			describe( '`show` event listeners', () => {
				it( 'executing `_show()` method', () => {
					const spy = sinon.spy( dialogPlugin, '_show' );

					dialogPlugin.fire( 'show', {} );

					sinon.assert.calledOnce( spy );
				} );

				it( 'executing `onShow` callback', () => {
					const spy = sinon.spy( () => {} );

					dialogPlugin.fire( 'show', { onShow: spy } );

					sinon.assert.calledOnce( spy );
				} );

				it( 'should execute `_show()` before `onShow`', () => {
					const _showSpy = sinon.spy( dialogPlugin, '_show' );
					const onShowSpy = sinon.spy( () => {} );

					dialogPlugin.on( 'show', () => {
						sinon.assert.notCalled( _showSpy );
						sinon.assert.notCalled( onShowSpy );
					}, { priority: 'high' } );

					dialogPlugin.on( 'show', () => {
						sinon.assert.calledOnce( _showSpy );
						sinon.assert.notCalled( onShowSpy );
					}, { priority: -1 } );

					dialogPlugin.on( 'show', () => {
						sinon.assert.calledOnce( _showSpy );
						sinon.assert.calledOnce( onShowSpy );
					}, { priority: 'lowest' } );

					dialogPlugin.fire( 'show', { onShow: onShowSpy } );
				} );
			} );

			describe( '`hide` event listeners', () => {
				it( 'executing `_hide()` method ', () => {
					const spy = sinon.spy( dialogPlugin, '_hide' );

					dialogPlugin.fire( 'hide' );

					sinon.assert.calledOnce( spy );
				} );

				it( 'executing `_onHide` callback', () => {
					const spy = sinon.spy( () => {} );

					dialogPlugin._onHide = spy;

					dialogPlugin.fire( 'hide' );

					sinon.assert.calledOnce( spy );
				} );

				it( 'clearing the `_onHide` callback after execution', () => {
					const spy = sinon.spy( () => {} );

					dialogPlugin._onHide = spy;

					dialogPlugin.fire( 'hide' );

					dialogPlugin.fire( 'show', {} );

					dialogPlugin.fire( 'hide' );

					sinon.assert.calledOnce( spy );
				} );

				it( 'should execute `_hide()` before `_onHide`', () => {
					const _hideSpy = sinon.spy( dialogPlugin, '_hide' );
					const onHideSpy = sinon.spy( () => {} );

					dialogPlugin._onHide = onHideSpy;

					dialogPlugin.on( 'hide', () => {
						sinon.assert.notCalled( _hideSpy );
						sinon.assert.notCalled( onHideSpy );
					}, { priority: 'high' } );

					dialogPlugin.on( 'hide', () => {
						sinon.assert.calledOnce( _hideSpy );
						sinon.assert.notCalled( onHideSpy );
					}, { priority: -1 } );

					dialogPlugin.on( 'hide', () => {
						sinon.assert.calledOnce( _hideSpy );
						sinon.assert.calledOnce( onHideSpy );
					}, { priority: 'lowest' } );

					dialogPlugin.fire( 'hide' );
				} );
			} );

			describe( 'keystroke handling', () => {
				describe( 'on ctrl+F6 press', () => {
					const keyEvtData = {
						keyCode: keyCodes.f6,
						ctrlKey: !env.isMac,
						metaKey: env.isMac,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					it( 'should do nothing if dialog view is not open', () => {
						editor.keystrokes.press( keyEvtData );

						sinon.assert.notCalled( keyEvtData.preventDefault );
						sinon.assert.notCalled( keyEvtData.stopPropagation );
					} );

					it( 'should do nothing if dialog view is a modal', () => {
						dialogPlugin.show( { isModal: true } );
						dialogPlugin.view.focusTracker.isFocused = true;

						editor.keystrokes.press( keyEvtData );

						sinon.assert.notCalled( keyEvtData.preventDefault );
						sinon.assert.notCalled( keyEvtData.stopPropagation );
					} );

					it( 'should focus the editing view if dialog view is focused', () => {
						const spy = sinon.spy( editor.editing.view, 'focus' );

						dialogPlugin.show( {} );
						dialogPlugin.view.focusTracker.isFocused = true;

						editor.keystrokes.press( keyEvtData );

						sinon.assert.calledOnce( keyEvtData.preventDefault );
						sinon.assert.calledOnce( keyEvtData.stopPropagation );
						sinon.assert.calledOnce( spy );
					} );

					it( 'should focus the dialog if editing view is focused', () => {
						dialogPlugin.show( {} );
						editor.editing.view.focus();

						const spy = sinon.spy( dialogPlugin.view, 'focus' );

						editor.keystrokes.press( keyEvtData );

						sinon.assert.calledOnce( spy );
					} );
				} );
			} );

			describe( 'multiroot integration', () => {
				it( 'should update the dialog view position whenever a root state is changed', () => {
					dialogPlugin.show( {} );

					const spy = sinon.spy( dialogPlugin.view, 'updatePosition' );

					editor.model.change( writer => {
						writer.detachRoot( 'main' );

						const rootChanges = editor.model.document.differ.getChangedRoots();

						expect( rootChanges.length ).to.equal( 1 );
					} );

					sinon.assert.calledOnce( spy );
				} );

				it( 'should do nothing if a root attribute is changed', () => {
					dialogPlugin.show( {} );

					const spy = sinon.spy( dialogPlugin.view, 'updatePosition' );

					editor.model.change( writer => {
						writer.setAttribute( 'foo', 'bar', editor.model.document.getRoot() );

						const rootChanges = editor.model.document.differ.getChangedRoots();

						expect( rootChanges.length ).to.equal( 1 );
					} );

					sinon.assert.notCalled( spy );
				} );
			} );
		} );

		it( 'should set #isOpen to false', () => {
			expect( dialogPlugin.isOpen ).to.be.false;
		} );
	} );

	describe( 'afterInit', () => {
		describe( 'should initialize source editing integration', () => {
			let sourceEditingEditor, sourceEditingEditorElement, sourceEditingDialogPlugin, dialogPluginInstance;

			beforeEach( () => {
				Dialog.visibleDialogPlugin = undefined;

				sourceEditingEditorElement = document.createElement( 'div' );
				document.body.appendChild( sourceEditingEditorElement );

				return ClassicTestEditor
					.create( sourceEditingEditorElement, {
						plugins: [ Paragraph, Dialog, SourceEditing ]
					} )
					.then( newEditor => {
						sourceEditingEditor = newEditor;
						sourceEditingDialogPlugin = sourceEditingEditor.plugins.get( 'SourceEditing' );
						dialogPluginInstance = sourceEditingEditor.plugins.get( 'Dialog' );
					} );
			} );

			afterEach( () => {
				sourceEditingEditor.destroy();
				sourceEditingEditorElement.remove();
				Dialog.visibleDialogPlugin = undefined;
			} );

			describe( 'listening to `isSourceEditingMode` flag change', () => {
				describe( 'when changed to true', () => {
					it( 'should hide the dialog if it should not be visible in source mode', () => {
						const spy = sinon.spy( dialogPluginInstance, 'hide' );

						dialogPluginInstance.show( {} );

						sourceEditingDialogPlugin.isSourceEditingMode = true;

						sinon.assert.calledOnce( spy );
					} );

					it( 'should stick the dialog if it should be visible in source mode', () => {
						const spy = sinon.spy( dialogPluginInstance, 'hide' );

						dialogPluginInstance.show( { isVisibleInSourceMode: true } );

						sourceEditingDialogPlugin.isSourceEditingMode = true;

						sinon.assert.notCalled( spy );
						expect( dialogPluginInstance.view.isStuck ).to.be.true;
					} );
				} );
				describe( 'when changed to false', () => {
					it( 'should stick the dialog', () => {
						const spy = sinon.spy( dialogPluginInstance, 'hide' );

						sourceEditingDialogPlugin.isSourceEditingMode = true;

						dialogPluginInstance.show( { isVisibleInSourceMode: true } );

						sourceEditingDialogPlugin.isSourceEditingMode = false;

						sinon.assert.notCalled( spy );

						expect( dialogPluginInstance.view.isStuck ).to.be.true;
					} );
				} );
			} );
		} );
	} );

	describe( 'show()', () => {
		describe( 'should hide the previously visible dialog', () => {
			it( 'in the same editor instance', () => {
				const spy = sinon.spy( dialogPlugin, 'hide' );

				dialogPlugin.show( { id: 'first' } );
				dialogPlugin.show( { id: 'second' } );

				sinon.assert.calledOnce( spy );
			} );

			it( 'in another editor instance', async () => {
				const spy = sinon.spy( dialogPlugin, 'hide' );
				const secondEditorElement = document.createElement( 'div' );
				document.body.appendChild( secondEditorElement );

				let secondEditor, secondDialogPlugin;

				await ClassicTestEditor
					.create( secondEditorElement, {
						plugins: [ Paragraph, Dialog ]
					} )
					.then( newEditor => {
						secondEditor = newEditor;
						secondDialogPlugin = secondEditor.plugins.get( Dialog );
					} );

				dialogPlugin.show( {} );
				secondDialogPlugin.show( {} );

				sinon.assert.calledOnce( spy );

				secondEditor.destroy();
				secondEditorElement.remove();
			} );
		} );

		describe( 'should fire the `show` event', () => {
			it( 'with id in namespace if provided', () => {
				const spy = sinon.spy();

				dialogPlugin.on( 'show:first', spy );

				dialogPlugin.show( { id: 'first' } );

				sinon.assert.calledOnce( spy );
			} );

			it( 'without id if not provided', () => {
				const spy = sinon.spy();

				dialogPlugin.on( 'show', spy );

				dialogPlugin.show( {} );

				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( '_show()', () => {
		it( 'should create the dialog view', () => {
			dialogPlugin._show( {} );

			expect( dialogPlugin.view ).to.be.instanceOf( DialogView );
		} );

		it( 'should attach the `close` event listener to the dialog view', () => {
			const spy = sinon.spy( dialogPlugin, 'hide' );

			dialogPlugin._show( {} );

			dialogPlugin.view.fire( 'close' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should add the dialog view to the body collection', () => {
			dialogPlugin._show( {} );

			expect( editor.ui.view.body.has( dialogPlugin.view ) ).to.be.true;
		} );

		it( 'should add the dialog view to the editor focus tracker', () => {
			dialogPlugin._show( {} );

			expect( editor.ui.focusTracker._elements.has( dialogPlugin.view.element ) ).to.be.true;
		} );

		it( 'should set the dialog view properties based on passed args', () => {
			dialogPlugin._show( {
				position: DialogViewPosition.EDITOR_CENTER,
				isModal: true,
				className: 'foo'
			} );

			expect( dialogPlugin.view.position ).to.equal( DialogViewPosition.EDITOR_CENTER );
			expect( dialogPlugin.view.isModal ).to.be.true;
			expect( dialogPlugin.view.className ).to.equal( 'foo' );
		} );

		it( 'should set the DialogViewPosition.SCREEN_CENTER position for modal if not defined otherwise', () => {
			dialogPlugin._show( {
				isModal: true
			} );

			expect( dialogPlugin.view.position ).to.equal( DialogViewPosition.SCREEN_CENTER );
		} );

		it( 'should set the dialog view `isVisible` property to `true`', () => {
			dialogPlugin._show( {} );

			expect( dialogPlugin.view.isVisible ).to.be.true;
		} );

		it( 'should setup the view parts with the passed arguments', () => {
			dialogPlugin._show( {
				title: 'foo',
				content: [],
				actionButtons: []
			} );

			expect( dialogPlugin.view.headerView, 'headerView should be created' ).to.not.be.undefined;
			expect( dialogPlugin.view.contentView, 'contentView should be created' ).to.not.be.undefined;
			expect( dialogPlugin.view.actionsView, 'actionsView should be created' ).to.not.be.undefined;
		} );

		it( 'should set the plugin properties', () => {
			dialogPlugin._show( {
				id: 'foo',
				onHide: () => {}
			} );

			expect( dialogPlugin.id, 'id should be set' ).to.equal( 'foo' );
			expect( dialogPlugin.isOpen, '`isOpen` should be true' ).to.be.true;
			expect( dialogPlugin._onHide, '`_onHide` should be set' ).to.be.a( 'function' );
			expect( Dialog.visibleDialogPlugin, '`visibleDialogPlugin` instance should be set' ).to.equal( dialogPlugin );
		} );
	} );

	describe( 'hide()', () => {
		describe( 'should fire the `hide` event', () => {
			it( 'with id in namespace if available', () => {
				const spy = sinon.spy();
				const stub = sinon.stub( dialogPlugin, '_hide' );

				dialogPlugin.id = 'first';
				dialogPlugin.on( 'hide:first', spy );

				dialogPlugin.hide();

				sinon.assert.calledOnce( spy );

				stub.restore();
			} );

			it( 'without id if not available', () => {
				const spyNamespaced = sinon.spy();
				const spyNotNamespaced = sinon.spy();
				const stub = sinon.stub( dialogPlugin, '_hide' );

				dialogPlugin.on( 'hide:first', spyNamespaced );
				dialogPlugin.on( 'hide', spyNotNamespaced );

				dialogPlugin.hide();

				sinon.assert.notCalled( spyNamespaced );
				sinon.assert.calledOnce( spyNotNamespaced );

				stub.restore();
			} );
		} );
	} );

	describe( '_hide()', () => {
		it( 'should not throw if there is no dialog view stored', () => {
			expect( () => dialogPlugin._hide() ).to.not.throw();
		} );

		it( 'should reset the dialog view content part', () => {
			dialogPlugin._show( {
				content: []
			} );

			const spy = sinon.spy( dialogPlugin.view.contentView, 'reset' );

			dialogPlugin._hide();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should remove the dialog view from body collection', () => {
			dialogPlugin._show( {} );

			dialogPlugin._hide();

			expect( editor.ui.view.body.has( dialogPlugin.view ) ).to.be.false;
		} );

		it( 'should remove the dialog view from the editor focus tracker', () => {
			dialogPlugin._show( {} );

			dialogPlugin._hide();

			expect( editor.ui.focusTracker._elements.has( dialogPlugin.view.element ) ).to.be.false;
		} );

		it( 'should reset the plugin properties', () => {
			dialogPlugin._show( {} );

			dialogPlugin._hide();

			expect( dialogPlugin.id, 'id should be reset' ).to.equal( '' );
			expect( dialogPlugin.isOpen, '`isOpen` should be false' ).to.be.false;
			expect( dialogPlugin._onHide, '`_onHide` should be reset' ).to.be.undefined;
			expect( Dialog.visibleDialogPlugin, '`visibleDialogPlugin` instance should be reset' ).to.be.undefined;
		} );
	} );
} );
