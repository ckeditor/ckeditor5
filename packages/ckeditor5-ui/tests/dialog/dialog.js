/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IconFindReplace } from '@ckeditor/ckeditor5-icons';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

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
		vi.restoreAllMocks();
	} );

	it( 'should have a name', () => {
		expect( Dialog.pluginName ).toBe( 'Dialog' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Dialog.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Dialog.isPremiumPlugin ).toBe( false );
	} );

	it( 'should initialize with isOpen=false', () => {
		expect( dialogPlugin.isOpen ).toBe( false );
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'navigation' ).groups.get( 'common' ).keystrokes ).toEqual(
			expect.arrayContaining( [ {
				label: 'Move focus in and out of an active dialog window',
				keystroke: 'Ctrl+F6',
				mayRequireFn: true
			} ] )
		);
	} );

	it( 'should initialise without #_visibleDialogPlugin set', () => {
		expect( Dialog._visibleDialogPlugin ).toBeUndefined();
	} );

	describe( 'constructor()', () => {
		describe( 'should initialise', () => {
			describe( '`show` event listeners', () => {
				it( 'executing `_show()` method', () => {
					const spy = vi.spyOn( dialogPlugin, '_show' );

					dialogPlugin.fire( 'show', {} );

					expect( spy ).toHaveBeenCalledOnce();
				} );

				it( 'executing `onShow` callback', () => {
					const spy = vi.fn();

					dialogPlugin.fire( 'show', { onShow: spy } );

					expect( spy ).toHaveBeenCalledOnce();
				} );

				it( 'should execute `_show()` before `onShow`', () => {
					const _showSpy = vi.spyOn( dialogPlugin, '_show' );
					const onShowSpy = vi.fn();

					dialogPlugin.on( 'show', () => {
						expect( _showSpy ).not.toHaveBeenCalled();
						expect( onShowSpy ).not.toHaveBeenCalled();
					}, { priority: 'high' } );

					dialogPlugin.on( 'show', () => {
						expect( _showSpy ).toHaveBeenCalledOnce();
						expect( onShowSpy ).not.toHaveBeenCalled();
					}, { priority: -1 } );

					dialogPlugin.on( 'show', () => {
						expect( _showSpy ).toHaveBeenCalledOnce();
						expect( onShowSpy ).toHaveBeenCalledOnce();
					}, { priority: 'lowest' } );

					dialogPlugin.fire( 'show', { onShow: onShowSpy } );
				} );
			} );

			describe( '`hide` event listeners', () => {
				it( 'executing `_hide()` method ', () => {
					dialogPlugin.show( {} );

					const spy = vi.spyOn( dialogPlugin, '_hide' );

					dialogPlugin.fire( 'hide' );

					expect( spy ).toHaveBeenCalledOnce();
				} );

				it( 'executing `_onHide` callback', () => {
					const spy = vi.fn();

					dialogPlugin._onHide = spy;

					dialogPlugin.fire( 'hide' );

					expect( spy ).toHaveBeenCalledOnce();
				} );

				it( 'clearing the `_onHide` callback after execution', () => {
					const spy = vi.fn();

					dialogPlugin._onHide = spy;

					dialogPlugin.fire( 'hide' );

					dialogPlugin.fire( 'show', {} );

					dialogPlugin.fire( 'hide' );

					expect( spy ).toHaveBeenCalledOnce();
				} );

				it( 'should execute `_hide()` before `_onHide`', () => {
					const _hideSpy = vi.spyOn( dialogPlugin, '_hide' );
					const onHideSpy = vi.fn();

					dialogPlugin._onHide = onHideSpy;

					dialogPlugin.on( 'hide', () => {
						expect( _hideSpy ).not.toHaveBeenCalled();
						expect( onHideSpy ).not.toHaveBeenCalled();
					}, { priority: 'high' } );

					dialogPlugin.on( 'hide', () => {
						expect( _hideSpy ).toHaveBeenCalledOnce();
						expect( onHideSpy ).not.toHaveBeenCalled();
					}, { priority: -1 } );

					dialogPlugin.on( 'hide', () => {
						expect( _hideSpy ).toHaveBeenCalledOnce();
						expect( onHideSpy ).toHaveBeenCalledOnce();
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
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					it( 'should do nothing if dialog view is not open', () => {
						editor.keystrokes.press( keyEvtData );

						expect( keyEvtData.preventDefault ).not.toHaveBeenCalled();
						expect( keyEvtData.stopPropagation ).not.toHaveBeenCalled();
					} );

					it( 'should do nothing if dialog view is a modal', () => {
						dialogPlugin.show( { isModal: true } );
						dialogPlugin.view.focusTracker.isFocused = true;

						editor.keystrokes.press( keyEvtData );

						expect( keyEvtData.preventDefault ).not.toHaveBeenCalled();
						expect( keyEvtData.stopPropagation ).not.toHaveBeenCalled();
					} );

					it( 'should focus the editing view if dialog view is focused', () => {
						const spy = vi.spyOn( editor.editing.view, 'focus' );

						dialogPlugin.show( {} );
						dialogPlugin.view.focusTracker.isFocused = true;

						editor.keystrokes.press( keyEvtData );

						expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
						expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
						expect( spy ).toHaveBeenCalledOnce();
					} );

					it( 'should focus the dialog if editing view is focused', () => {
						dialogPlugin.show( {} );
						editor.editing.view.focus();

						const spy = vi.spyOn( dialogPlugin.view, 'focus' );

						editor.keystrokes.press( keyEvtData );

						expect( spy ).toHaveBeenCalledOnce();
					} );
				} );
			} );

			describe( 'multiroot integration', () => {
				it( 'should update the dialog view position whenever a root state is changed', () => {
					dialogPlugin.show( {} );

					const spy = vi.spyOn( dialogPlugin.view, 'updatePosition' );

					editor.model.change( writer => {
						writer.detachRoot( 'main' );

						const rootChanges = editor.model.document.differ.getChangedRoots();

						expect( rootChanges.length ).toBe( 1 );
					} );

					expect( spy ).toHaveBeenCalledOnce();
				} );

				it( 'should do nothing if a root attribute is changed', () => {
					dialogPlugin.show( {} );

					const spy = vi.spyOn( dialogPlugin.view, 'updatePosition' );

					editor.model.change( writer => {
						writer.setAttribute( 'foo', 'bar', editor.model.document.getRoot() );

						const rootChanges = editor.model.document.differ.getChangedRoots();

						expect( rootChanges.length ).toBe( 1 );
					} );

					expect( spy ).not.toHaveBeenCalled();
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

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).toBe( true );

			dialogPlugin.destroy();

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).toBe( false );
		} );

		it( 'should not unlock scrolling on the document if modal was displayed by another plugin instance', () => {
			const tempDialogPlugin = new Dialog( editor );

			tempDialogPlugin._show( {
				position: DialogViewPosition.EDITOR_CENTER,
				isModal: true,
				className: 'foo'
			} );

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).toBe( true );

			dialogPlugin.destroy();

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).toBe( true );

			tempDialogPlugin.destroy();
		} );
	} );

	describe( 'show()', () => {
		it( 'should fire the `show` event with id in namespace', () => {
			const spy = vi.fn();

			dialogPlugin.on( 'show:first', spy );

			dialogPlugin.show( { id: 'first' } );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		describe( 'should hide the previously visible dialog', () => {
			it( 'in the same editor instance', () => {
				const methodSpy = vi.spyOn( dialogPlugin, 'hide' );
				const eventSpy = vi.fn();

				dialogPlugin.on( 'hide', eventSpy );

				dialogPlugin.show( { id: 'first' } );
				dialogPlugin.show( { id: 'second' } );

				expect( methodSpy ).toHaveBeenCalledTimes( 2 );
				expect( eventSpy ).toHaveBeenCalledOnce();
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

				const firstMethodSpy = vi.spyOn( dialogPlugin, 'hide' );
				const secondMethodSpy = vi.spyOn( secondDialogPlugin, 'hide' );

				const firstEventSpy = vi.fn();
				const secondEventSpy = vi.fn();

				dialogPlugin.on( 'hide:first', firstEventSpy );
				secondDialogPlugin.on( 'hide:second', secondEventSpy );

				secondDialogPlugin.show( { id: 'second' } );

				// A little explanation:
				// 1. The first dialog is shown before the spies start, so its hide() method isn't called.
				// 2. The second dialog is shown after the spies start, so its hide() method is called.
				// 3. In the second dialog's hide() method, the first dialog fires its `hide` event.
				// 4. The second dialog doesn't fire the `hide` event, because its dialog was not hidden.
				expect( firstMethodSpy ).not.toHaveBeenCalled();
				expect( firstEventSpy ).toHaveBeenCalledOnce();
				expect( secondMethodSpy ).toHaveBeenCalledOnce();
				expect( secondEventSpy ).not.toHaveBeenCalled();

				secondEditor.destroy();
				secondEditorElement.remove();
			} );
		} );
	} );

	describe( '_show()', () => {
		it( 'should create the dialog view', () => {
			dialogPlugin._show( {} );

			expect( dialogPlugin.view ).toBeInstanceOf( DialogView );
		} );

		describe( 'DOM root element resolution (DialogView#getDomRootElement)', () => {
			it( 'should resolve the DOM root using the name returned by the #getRootName callback', () => {
				const getRootName = vi.fn().mockReturnValue( 'main' );

				dialogPlugin._show( { getRootName } );

				expect( dialogPlugin.view._getDomRootElement() ).toBe( editor.editing.view.getDomRoot( 'main' ) );
				expect( getRootName ).toHaveBeenCalled();
			} );

			it( 'should resolve the DOM root using the selection anchor root when #getRootName is not provided', () => {
				dialogPlugin._show( {} );

				expect( dialogPlugin.view._getDomRootElement() ).to.equal( editor.editing.view.getDomRoot( 'main' ) );
			} );

			it( 'should fall back to the selection anchor root when #getRootName returns null', () => {
				dialogPlugin._show( { getRootName: () => null } );

				expect( dialogPlugin.view._getDomRootElement() ).to.equal( editor.editing.view.getDomRoot( 'main' ) );
			} );

			it( 'should return null when the resolved root name is empty', () => {
				dialogPlugin._show( { getRootName: () => '' } );

				expect( dialogPlugin.view._getDomRootElement() ).to.be.null;
			} );

			it( 'should return null when the resolved root name does not exist among the editing DOM roots', () => {
				dialogPlugin._show( { getRootName: () => 'non-existent-root' } );

				expect( dialogPlugin.view._getDomRootElement() ).to.be.null;
			} );

			it( 'should return null when there is no DOM root for the resolved root name', () => {
				// Defensive: the root is registered but its DOM root is unavailable (e.g. detached).
				vi.spyOn( editor.editing.view, 'getDomRoot' ).mockReturnValue( undefined );

				dialogPlugin._show( { getRootName: () => 'main' } );

				expect( dialogPlugin.view._getDomRootElement() ).toBeNull();
			} );
		} );

		it( 'should attach the `close` event listener to the dialog view by default', () => {
			const spy = vi.spyOn( dialogPlugin, 'hide' );

			dialogPlugin._show( {} );

			dialogPlugin.view.fire( 'close' );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'the `close` event listener should be overridable', () => {
			const spy = vi.spyOn( dialogPlugin, 'hide' );

			dialogPlugin._show( {} );

			dialogPlugin.view.on( 'close', evt => {
				evt.stop();
			}, { priority: 'high' } );

			dialogPlugin.view.fire( 'close' );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should add the dialog view to the body collection', () => {
			dialogPlugin._show( {} );

			expect( editor.ui.view.body.has( dialogPlugin.view ) ).toBe( true );
		} );

		it( 'should add the dialog view to the editor focus tracker', () => {
			dialogPlugin._show( {} );

			expect( editor.ui.focusTracker._elements.has( dialogPlugin.view.element ) ).toBe( true );
		} );

		it( 'should set the dialog view properties based on passed args', () => {
			dialogPlugin._show( {
				position: DialogViewPosition.EDITOR_CENTER,
				isModal: true,
				className: 'foo'
			} );

			expect( dialogPlugin.view.position ).toBe( DialogViewPosition.EDITOR_CENTER );
			expect( dialogPlugin.view.isModal ).toBe( true );
			expect( dialogPlugin.view.className ).toBe( 'foo' );
		} );

		it( 'should set the DialogViewPosition.SCREEN_CENTER position for modal if not defined otherwise', () => {
			dialogPlugin._show( {
				isModal: true
			} );

			expect( dialogPlugin.view.position ).toBe( DialogViewPosition.SCREEN_CENTER );
		} );

		it( 'should set the dialog view `_isVisible` property to `true`', () => {
			dialogPlugin._show( {} );

			expect( dialogPlugin.view._isVisible ).toBe( true );
		} );

		it( 'should setup the view parts with the passed arguments', () => {
			dialogPlugin._show( {
				title: 'foo',
				content: [],
				actionButtons: []
			} );

			expect( dialogPlugin.view.headerView, 'headerView should be created' ).not.toBeUndefined();
			expect( dialogPlugin.view.contentView, 'contentView should be created' ).not.toBeUndefined();
			expect( dialogPlugin.view.actionsView, 'actionsView should be created' ).not.toBeUndefined();
		} );

		it( 'should properly setup the header view with the passed arguments', () => {
			dialogPlugin._show( {
				icon: IconFindReplace,
				title: 'foo',
				hasCloseButton: false
			} );

			expect( dialogPlugin.view.headerView, 'headerView should be created' ).not.toBeUndefined();
			expect( dialogPlugin.view.headerView.children.get( 0 ), 'iconView should be created' ).toBeInstanceOf( IconView );
			expect( dialogPlugin.view.headerView.children.length ).toBe( 2 );
		} );

		it( 'should set the plugin properties', () => {
			dialogPlugin._show( {
				id: 'foo',
				onHide: () => {}
			} );

			expect( dialogPlugin.id, 'id should be set' ).toBe( 'foo' );
			expect( typeof dialogPlugin._onHide, '`_onHide` should be set' ).toBe( 'function' );
			expect( Dialog._visibleDialogPlugin, '`_visibleDialogPlugin` instance should be set' ).toBe( dialogPlugin );
		} );

		it( 'should lock document scroll if the dialog is a modal', () => {
			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).toBe( false );

			dialogPlugin._show( {
				position: DialogViewPosition.EDITOR_CENTER,
				isModal: true,
				className: 'foo'
			} );

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).toBe( true );
		} );

		it( 'should not lock document scroll if the dialog is not a modal', () => {
			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).toBe( false );

			dialogPlugin._show( {
				position: DialogViewPosition.EDITOR_CENTER,
				className: 'foo'
			} );

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).toBe( false );
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
			const spy = vi.spyOn( KeystrokeHandler.prototype, 'set' );

			const keystrokeHandlerOptions = {
				filter: () => {}
			};

			dialogPlugin._show( {
				keystrokeHandlerOptions
			} );

			expect( spy.mock.calls[ 0 ][ 2 ] ).toBe( keystrokeHandlerOptions );
			expect( spy.mock.calls[ 1 ][ 2 ] ).toBe( keystrokeHandlerOptions );
		} );
	} );

	describe( 'hide()', () => {
		it( 'should do nothing if dialog is not visible', () => {
			expect( dialogPlugin._visibleDialogPlugin ).toBeUndefined();

			const spy = vi.spyOn( dialogPlugin, '_hide' );

			dialogPlugin.fire( 'hide' );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should fire the `hide` event with id in namespace', () => {
			const spy = vi.fn();
			const stub = vi.spyOn( dialogPlugin, '_hide' ).mockImplementation( () => {} );

			dialogPlugin.show( { id: 'first' } );
			dialogPlugin.on( 'hide:first', spy );

			dialogPlugin.hide();

			expect( spy ).toHaveBeenCalledOnce();

			stub.mockRestore();
		} );
	} );

	describe( '_hide()', () => {
		it( 'should not throw if there is no dialog view stored', () => {
			expect( () => dialogPlugin._hide() ).not.toThrow();
		} );

		it( 'should reset the dialog view content part', () => {
			dialogPlugin._show( {
				content: []
			} );

			const spy = vi.spyOn( dialogPlugin.view.contentView, 'reset' );

			dialogPlugin._hide();

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should remove the dialog view from body collection', () => {
			dialogPlugin._show( {} );

			dialogPlugin._hide();

			expect( editor.ui.view.body.has( dialogPlugin.view ) ).toBe( false );
		} );

		it( 'should remove the dialog view from the editor focus tracker', () => {
			dialogPlugin._show( {} );

			dialogPlugin._hide();

			expect( editor.ui.focusTracker._elements.has( dialogPlugin.view.element ) ).toBe( false );
		} );

		it( 'should reset the plugin properties', () => {
			dialogPlugin._show( {} );

			dialogPlugin._hide();

			expect( dialogPlugin.id, 'id should be reset' ).toBeNull();
			expect( dialogPlugin._onHide, '`_onHide` should be reset' ).toBeUndefined();
			expect( Dialog._visibleDialogPlugin, '`_visibleDialogPlugin` instance should be reset' ).toBeNull();
		} );

		it( 'should unlock document scroll if the dialog is a modal', () => {
			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).toBe( false );

			dialogPlugin._show( {
				position: DialogViewPosition.EDITOR_CENTER,
				isModal: true,
				className: 'foo'
			} );

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).toBe( true );

			dialogPlugin._hide();

			expect( document.documentElement.classList.contains( 'ck-dialog-scroll-locked' ) ).toBe( false );
		} );
	} );
} );
