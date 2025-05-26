/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconFindReplace } from '@ckeditor/ckeditor5-icons';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Dialog, DialogView, DialogViewPosition, IconView } from '../../src/index.js';
import { env, keyCodes, KeystrokeHandler } from '@ckeditor/ckeditor5-utils';

describe( 'Dialog', () => {
	let editor, editorElement, dialogPlugin;

	beforeEach( () => {
		Dialog._visibleDialogPlugin = undefined;

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

	afterEach( async () => {
		await editor.destroy();
		editorElement.remove();
		Dialog._visibleDialogPlugin = undefined;
	} );

	it( 'should have a name', () => {
		expect( Dialog.pluginName ).to.equal( 'Dialog' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Dialog.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Dialog.isPremiumPlugin ).to.be.false;
	} );

	it( 'should initialize with isOpen=false', () => {
		expect( dialogPlugin.isOpen ).to.be.false;
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'navigation' ).groups.get( 'common' ).keystrokes ).to.deep.include( {
			label: 'Move focus in and out of an active dialog window',
			keystroke: 'Ctrl+F6',
			mayRequireFn: true
		} );
	} );

	it( 'should initialise without #_visibleDialogPlugin set', () => {
		expect( Dialog._visibleDialogPlugin ).to.be.undefined;
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
					dialogPlugin.show( {} );

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

					dialogPlugin.show( {} );

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
	} );

	describe( 'destroy()', () => {
		it( 'should unlock scrolling on the document if modal was displayed', () => {
			dialogPlugin._show( {
				position: DialogViewPosition.EDITOR_CENTER,
				isModal: true,
				className: 'foo'
			} );

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).to.be.true;

			dialogPlugin.destroy();

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).to.be.false;
		} );

		it( 'should not unlock scrolling on the document if modal was displayed by another plugin instance', () => {
			const tempDialogPlugin = new Dialog( editor );

			tempDialogPlugin._show( {
				position: DialogViewPosition.EDITOR_CENTER,
				isModal: true,
				className: 'foo'
			} );

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).to.be.true;

			dialogPlugin.destroy();

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).to.be.true;

			tempDialogPlugin.destroy();
		} );
	} );

	describe( 'show()', () => {
		it( 'should fire the `show` event with id in namespace', () => {
			const spy = sinon.spy();

			dialogPlugin.on( 'show:first', spy );

			dialogPlugin.show( { id: 'first' } );

			sinon.assert.calledOnce( spy );
		} );

		describe( 'should hide the previously visible dialog', () => {
			it( 'in the same editor instance', () => {
				const methodSpy = sinon.spy( dialogPlugin, 'hide' );
				const eventSpy = sinon.spy();

				dialogPlugin.on( 'hide', eventSpy );

				dialogPlugin.show( { id: 'first' } );
				dialogPlugin.show( { id: 'second' } );

				sinon.assert.calledTwice( methodSpy );
				sinon.assert.calledOnce( eventSpy );
			} );

			it( 'in another editor instance', async () => {
				const secondEditorElement = document.createElement( 'div' );
				document.body.appendChild( secondEditorElement );

				let secondEditor, secondDialogPlugin;

				dialogPlugin.show( { id: 'first' } );

				await ClassicTestEditor
					.create( secondEditorElement, {
						plugins: [ Paragraph, Dialog ]
					} )
					.then( newEditor => {
						secondEditor = newEditor;
						secondDialogPlugin = secondEditor.plugins.get( Dialog );
					} );

				const firstMethodSpy = sinon.spy( dialogPlugin, 'hide' );
				const secondMethodSpy = sinon.spy( secondDialogPlugin, 'hide' );

				const firstEventSpy = sinon.spy();
				const secondEventSpy = sinon.spy();

				dialogPlugin.on( 'hide:first', firstEventSpy );
				secondDialogPlugin.on( 'hide:second', secondEventSpy );

				secondDialogPlugin.show( { id: 'second' } );

				// A little explanation:
				// 1. The first dialog is shown before the spies start, so its hide() method isn't called.
				// 2. The second dialog is shown after the spies start, so its hide() method is called.
				// 3. In the second dialog's hide() method, the first dialog fires its `hide` event.
				// 4. The second dialog doesn't fire the `hide` event, because its dialog was not hidden.
				sinon.assert.notCalled( firstMethodSpy );
				sinon.assert.calledOnce( firstEventSpy );
				sinon.assert.calledOnce( secondMethodSpy );
				sinon.assert.notCalled( secondEventSpy );

				secondEditor.destroy();
				secondEditorElement.remove();
			} );
		} );
	} );

	describe( '_show()', () => {
		it( 'should create the dialog view', () => {
			dialogPlugin._show( {} );

			expect( dialogPlugin.view ).to.be.instanceOf( DialogView );
		} );

		it( 'should attach the `close` event listener to the dialog view by default', () => {
			const spy = sinon.spy( dialogPlugin, 'hide' );

			dialogPlugin._show( {} );

			dialogPlugin.view.fire( 'close' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'the `close` event listener should be overridable', () => {
			const spy = sinon.spy( dialogPlugin, 'hide' );

			dialogPlugin._show( {} );

			dialogPlugin.view.on( 'close', evt => {
				evt.stop();
			}, { priority: 'high' } );

			dialogPlugin.view.fire( 'close' );

			sinon.assert.notCalled( spy );
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

		it( 'should set the dialog view `_isVisible` property to `true`', () => {
			dialogPlugin._show( {} );

			expect( dialogPlugin.view._isVisible ).to.be.true;
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

		it( 'should properly setup the header view with the passed arguments', () => {
			dialogPlugin._show( {
				icon: IconFindReplace,
				title: 'foo',
				hasCloseButton: false
			} );

			expect( dialogPlugin.view.headerView, 'headerView should be created' ).to.not.be.undefined;
			expect( dialogPlugin.view.headerView.children.get( 0 ), 'iconView should be created' ).to.be.instanceOf( IconView );
			expect( dialogPlugin.view.headerView.children.length ).to.equal( 2 );
		} );

		it( 'should set the plugin properties', () => {
			dialogPlugin._show( {
				id: 'foo',
				onHide: () => {}
			} );

			expect( dialogPlugin.id, 'id should be set' ).to.equal( 'foo' );
			expect( dialogPlugin._onHide, '`_onHide` should be set' ).to.be.a( 'function' );
			expect( Dialog._visibleDialogPlugin, '`_visibleDialogPlugin` instance should be set' ).to.equal( dialogPlugin );
		} );

		it( 'should lock document scroll if the dialog is a modal', () => {
			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).to.be.false;

			dialogPlugin._show( {
				position: DialogViewPosition.EDITOR_CENTER,
				isModal: true,
				className: 'foo'
			} );

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).to.be.true;
		} );

		it( 'should not lock document scroll if the dialog is not a modal', () => {
			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).to.be.false;

			dialogPlugin._show( {
				position: DialogViewPosition.EDITOR_CENTER,
				className: 'foo'
			} );

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).to.be.false;
		} );

		it( 'should pass keystrokeHandlerOptions to its view', () => {
			// The 'keystrokeHandlerOptions' are not stored anywhere so we need to somehow
			// detect if those are passed correctly. It is passed like shown below:
			//
			// Dialog._show -> new DialogView( { ..., keystrokeHandlerOptions } )
			// DialogView.constructor -> new FocusCycler( { ..., keystrokeHandler, keystrokeHandlerOptions } )
			// FocusCycler.constructor -> keystrokeHandler.set( { ..., keystrokeHandlerOptions } )
			//
			// And so we spy on the `set` method of the KeystrokeHandler to check if options is passed there.
			const spy = sinon.spy( KeystrokeHandler.prototype, 'set' );

			const keystrokeHandlerOptions = {
				filter: () => {}
			};

			dialogPlugin._show( {
				keystrokeHandlerOptions
			} );

			expect( spy.args[ 0 ][ 2 ] ).to.equal( keystrokeHandlerOptions );
			expect( spy.args[ 1 ][ 2 ] ).to.equal( keystrokeHandlerOptions );
		} );
	} );

	describe( 'hide()', () => {
		it( 'should do nothing if dialog is not visible', () => {
			expect( dialogPlugin._visibleDialogPlugin ).to.be.undefined;

			const spy = sinon.spy( dialogPlugin, '_hide' );

			dialogPlugin.fire( 'hide' );

			sinon.assert.notCalled( spy );
		} );

		it( 'should fire the `hide` event with id in namespace', () => {
			const spy = sinon.spy();
			const stub = sinon.stub( dialogPlugin, '_hide' );

			dialogPlugin.show( { id: 'first' } );
			dialogPlugin.on( 'hide:first', spy );

			dialogPlugin.hide();

			sinon.assert.calledOnce( spy );

			stub.restore();
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

			expect( dialogPlugin.id, 'id should be reset' ).to.be.null;
			expect( dialogPlugin._onHide, '`_onHide` should be reset' ).to.be.undefined;
			expect( Dialog._visibleDialogPlugin, '`_visibleDialogPlugin` instance should be reset' ).to.be.null;
		} );

		it( 'should unlock document scroll if the dialog is a modal', () => {
			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).to.be.false;

			dialogPlugin._show( {
				position: DialogViewPosition.EDITOR_CENTER,
				isModal: true,
				className: 'foo'
			} );

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).to.be.true;

			dialogPlugin._hide();

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).to.be.false;
		} );
	} );
} );
