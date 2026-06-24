/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { View, EditorUI, ContextualBalloon, Dialog, DialogViewPosition } from '@ckeditor/ckeditor5-ui';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { ClassicEditor } from '../src/classiceditor.js';
import { ClassicEditorUI } from '../src/classiceditorui.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ClassicEditorUIView } from '../src/classiceditoruiview.js';
import { Image, ImageCaption, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { keyCodes, env } from '@ckeditor/ckeditor5-utils';
import { assertBinding } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { isElement } from 'es-toolkit/compat';
import { normalizeRootsConfig, Plugin } from '@ckeditor/ckeditor5-core';

describe( 'ClassicEditorUI', () => {
	let editor, view, ui, viewElement;

	beforeEach( () => {
		return VirtualClassicTestEditor
			.create( '', {
				toolbar: [ 'foo', 'bar' ]
			} )
			.then( newEditor => {
				editor = newEditor;

				ui = editor.ui;
				view = ui.view;
				viewElement = view.element;
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		it( 'extends EditorUI', () => {
			expect( ui ).toBeInstanceOf( EditorUI );
		} );
	} );

	describe( 'init()', () => {
		it( 'renders the #view', () => {
			expect( view.isRendered ).toBe( true );
		} );

		describe( 'stickyPanel', () => {
			it( 'binds view.stickyToolbar#isActive to editor.focusTracker#isFocused', () => {
				ui.focusTracker.isFocused = false;
				expect( view.stickyPanel.isActive ).toBe( false );

				ui.focusTracker.isFocused = true;
				expect( view.stickyPanel.isActive ).toBe( true );
			} );

			it( 'sets view.stickyToolbar#limiterElement', () => {
				expect( view.stickyPanel.limiterElement ).toBe( view.element );
			} );

			it( 'doesn\'t set view.stickyToolbar#viewportTopOffset, if not specified in the config', () => {
				expect( view.stickyPanel.viewportTopOffset ).toBe( 0 );
			} );

			it( 'sets view.stickyPanel#viewportTopOffset, when specified in the config', () => {
				return VirtualClassicTestEditor
					.create( '', {
						ui: {
							viewportOffset: {
								top: 100
							}
						}
					} )
					.then( editor => {
						expect( editor.ui.viewportOffset.top ).toBe( 100 );
						expect( editor.ui.view.stickyPanel.viewportTopOffset ).toBe( 100 );

						return editor.destroy();
					} );
			} );

			it( 'sets view.stickyPanel#viewportTopOffset if legacy toolbar.vierportTopOffset specified', () => {
				vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

				return VirtualClassicTestEditor
					.create( 'foo', {
						toolbar: {
							viewportTopOffset: 100
						}
					} )
					.then( editor => {
						expect( editor.ui.viewportOffset.top ).toBe( 100 );
						expect( editor.ui.view.stickyPanel.viewportTopOffset ).toBe( 100 );

						return editor.destroy();
					} );
			} );

			it( 'warns if legacy toolbar.vierportTopOffset specified', () => {
				const spy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

				return VirtualClassicTestEditor
					.create( 'foo', {
						toolbar: {
							viewportTopOffset: 100
						}
					} )
					.then( editor => {
						expect( spy ).toHaveBeenCalled();
						expect( spy.mock.calls[ 0 ][ 0 ] ).toContain( 'editor-ui-deprecated-viewport-offset-config' );

						return editor.destroy();
					} );
			} );

			it( 'updates the view.stickyPanel#viewportTopOffset to the visible part of viewport top offset (iOS + visual viewport)', () => {
				ui.viewportOffset = { top: 70 };

				let offsetTop = 0;
				vi.spyOn( env, 'isiOS', 'get' ).mockReturnValue( true );
				vi.spyOn( window.visualViewport, 'offsetTop', 'get' ).mockImplementation( () => offsetTop );

				offsetTop = 0;
				window.visualViewport.dispatchEvent( new Event( 'scroll' ) );

				expect( ui.view.stickyPanel.viewportTopOffset ).toBe( 70 );

				offsetTop = 10;
				window.visualViewport.dispatchEvent( new Event( 'scroll' ) );

				expect( ui.view.stickyPanel.viewportTopOffset ).toBe( 60 );

				offsetTop = 50;
				window.visualViewport.dispatchEvent( new Event( 'scroll' ) );

				expect( ui.view.stickyPanel.viewportTopOffset ).toBe( 20 );

				offsetTop = 80;
				window.visualViewport.dispatchEvent( new Event( 'scroll' ) );

				expect( ui.view.stickyPanel.viewportTopOffset ).toBe( 0 );
			} );
		} );

		describe( 'editable', () => {
			it( 'registers view.editable#element in editor focus tracker', () => {
				ui.focusTracker.isFocused = false;

				view.editable.element.dispatchEvent( new Event( 'focus' ) );
				expect( ui.focusTracker.isFocused ).toBe( true );
			} );

			it( 'binds view.editable#isFocused', () => {
				assertBinding(
					view.editable,
					{ isFocused: false },
					[
						[ ui.focusTracker, { isFocused: true } ]
					],
					{ isFocused: true }
				);
			} );

			it( 'set view.editable#name', () => {
				const editable = editor.editing.view.document.getRoot();

				expect( view.editable.name ).toBe( editable.rootName );
			} );

			describe( 'inline root', () => {
				it( 'leaves view.editable#isInlineRoot false for a block root', () => {
					expect( view.editable.isInlineRoot ).toBe( false );
					expect( view.editable.element.classList.contains( 'ck-editor__editable_inline-root' ) ).toBe( false );
				} );

				it( 'sets view.editable#isInlineRoot to true when the root is $inlineRoot', () => {
					return VirtualClassicTestEditor
						.create( '', {
							root: { modelElement: '$inlineRoot' }
						} )
						.then( newEditor => {
							const editable = newEditor.ui.view.editable;

							expect( editable.isInlineRoot ).toBe( true );
							expect( editable.element.classList.contains( 'ck-editor__editable_inline-root' ) ).toBe( true );

							return newEditor.destroy();
						} );
				} );

				it( 'sets isInlineRoot=false for a custom block-like root registered by a plugin', () => {
					class CustomBlockRootPlugin extends Plugin {
						init() {
							this.editor.model.schema.register( 'customBlockRoot', {
								isLimit: true,
								allowContentOf: '$root'
							} );
						}
					}

					return VirtualClassicTestEditor
						.create( '', {
							extraPlugins: [ CustomBlockRootPlugin ],
							root: { modelElement: 'customBlockRoot' }
						} )
						.then( newEditor => {
							const editable = newEditor.ui.view.editable;

							expect( editable.isInlineRoot ).toBe( false );
							expect( editable.element.classList.contains( 'ck-editor__editable_inline-root' ) ).toBe( false );

							return newEditor.destroy();
						} );
				} );

				it( 'sets isInlineRoot=true for a custom inline-only root registered by a plugin', () => {
					class CustomInlineRootPlugin extends Plugin {
						init() {
							this.editor.model.schema.register( 'customInlineRoot', {
								isLimit: true,
								allowContentOf: '$inlineRoot'
							} );
						}
					}

					return VirtualClassicTestEditor
						.create( '', {
							extraPlugins: [ CustomInlineRootPlugin ],
							root: { modelElement: 'customInlineRoot' }
						} )
						.then( newEditor => {
							const editable = newEditor.ui.view.editable;

							expect( editable.isInlineRoot ).toBe( true );
							expect( editable.element.classList.contains( 'ck-editor__editable_inline-root' ) ).toBe( true );

							return newEditor.destroy();
						} );
				} );
			} );
		} );

		describe( 'placeholder', () => {
			it( 'sets placeholder from editor.config.placeholder - string', () => {
				return VirtualClassicTestEditor
					.create( 'foo', {
						extraPlugins: [ Paragraph ],
						root: { placeholder: 'placeholder-text' }
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).toBe( 'placeholder-text' );

						return newEditor.destroy();
					} );
			} );

			it( 'sets placeholder from the "placeholder" attribute of a passed <textarea>', () => {
				const element = document.createElement( 'textarea' );

				element.setAttribute( 'placeholder', 'placeholder-text' );

				return VirtualClassicTestEditor
					.create( element, {
						extraPlugins: [ Paragraph ]
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).toBe( 'placeholder-text' );

						return newEditor.destroy();
					} );
			} );

			it( 'uses editor.config.placeholder rather than the "placeholder" attribute of a passed <textarea>', () => {
				const element = document.createElement( 'textarea' );

				element.setAttribute( 'placeholder', 'placeholder-text' );

				return VirtualClassicTestEditor
					.create( element, {
						root: { placeholder: 'config takes precedence' },
						extraPlugins: [ Paragraph ]
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).toBe( 'config takes precedence' );

						return newEditor.destroy();
					} );
			} );

			it( 'sets the placeholder directly on the root for an inline root (no block child to host it)', () => {
				return VirtualClassicTestEditor
					.create( '', {
						root: { modelElement: '$inlineRoot', placeholder: 'placeholder-text' }
					} )
					.then( newEditor => {
						const root = newEditor.editing.view.document.getRoot();

						// Inline roots have no block children, so the placeholder is hosted on the root itself
						// (isDirectHost: true) rather than on the first child.
						expect( root.getAttribute( 'data-placeholder' ) ).toBe( 'placeholder-text' );

						return newEditor.destroy();
					} );
			} );
		} );

		describe( 'placeholder - legacy config', () => {
			it( 'sets placeholder from editor.config.placeholder - string', () => {
				return VirtualClassicTestEditor
					.create( 'foo', {
						extraPlugins: [ Paragraph ],
						placeholder: 'placeholder-text'
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).toBe( 'placeholder-text' );

						return newEditor.destroy();
					} );
			} );

			it( 'sets placeholder from the "placeholder" attribute of a passed <textarea>', () => {
				const element = document.createElement( 'textarea' );

				element.setAttribute( 'placeholder', 'placeholder-text' );

				return VirtualClassicTestEditor
					.create( element, {
						extraPlugins: [ Paragraph ]
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).toBe( 'placeholder-text' );

						return newEditor.destroy();
					} );
			} );

			it( 'uses editor.config.placeholder rather than the "placeholder" attribute of a passed <textarea>', () => {
				const element = document.createElement( 'textarea' );

				element.setAttribute( 'placeholder', 'placeholder-text' );

				return VirtualClassicTestEditor
					.create( element, {
						placeholder: 'config takes precedence',
						extraPlugins: [ Paragraph ]
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).toBe( 'config takes precedence' );

						return newEditor.destroy();
					} );
			} );
		} );

		describe( 'view.toolbar', () => {
			describe( '#items', () => {
				it( 'are filled with the config.toolbar (specified as an Array)', () => {
					return VirtualClassicTestEditor
						.create( '', {
							toolbar: [ 'foo', 'bar' ]
						} )
						.then( editor => {
							const items = editor.ui.view.toolbar.items;

							expect( items.get( 0 ).name ).toBe( 'foo' );
							expect( items.get( 1 ).name ).toBe( 'bar' );

							return editor.destroy();
						} );
				} );

				it( 'are filled with the config.toolbar (specified as an Object)', () => {
					return VirtualClassicTestEditor
						.create( '', {
							toolbar: {
								items: [ 'foo', 'bar' ]
							}
						} )
						.then( editor => {
							const items = editor.ui.view.toolbar.items;

							expect( items.get( 0 ).name ).toBe( 'foo' );
							expect( items.get( 1 ).name ).toBe( 'bar' );

							return editor.destroy();
						} );
				} );

				it( 'can be removed using config.toolbar.removeItems', () => {
					return VirtualClassicTestEditor
						.create( '', {
							toolbar: {
								items: [ 'foo', 'bar' ],
								removeItems: [ 'bar' ]
							}
						} )
						.then( editor => {
							const items = editor.ui.view.toolbar.items;

							expect( items.get( 0 ).name ).toBe( 'foo' );
							expect( items.length ).toBe( 1 );

							return editor.destroy();
						} );
				} );
			} );
		} );

		describe( 'integration with the Contextual Balloon plugin', () => {
			let editorWithUi, editorElement, contextualBalloon;

			beforeEach( async () => {
				editorElement = document.body.appendChild(
					document.createElement( 'div' )
				);

				editorWithUi = await ClassicEditor.create( editorElement, {
					plugins: [
						ContextualBalloon,
						Paragraph
					]
				} );

				contextualBalloon = editorWithUi.plugins.get( 'ContextualBalloon' );

				vi.spyOn( editorWithUi.ui.view.stickyPanel.element, 'getBoundingClientRect' ).mockReturnValue( {
					height: 50,
					bottom: 50
				} );

				vi.spyOn( editorWithUi.ui.view.editable.element, 'getBoundingClientRect' ).mockReturnValue( {
					top: 0,
					right: 300,
					bottom: 100,
					left: 0,
					width: 300,
					height: 100
				} );
			} );

			afterEach( async () => {
				await editorWithUi.destroy();
				editorElement.remove();
			} );

			it( 'should handle BalloonPlugin#getPositionOptions returning undefined value', () => {
				vi.spyOn( contextualBalloon, '_visibleStack', 'get' ).mockReturnValue( { values: () => [ { position: undefined } ] } );

				expect( contextualBalloon.getPositionOptions() ).toBeUndefined();
			} );

			it( 'should set proper viewportOffsetConfig top offset when sticky panel is visible', () => {
				editorWithUi.ui.view.stickyPanel.isSticky = true;

				_setModelData( editorWithUi.model, '<paragraph>foo[]</paragraph>' );

				const pinSpy = vi.spyOn( contextualBalloon.view, 'pin' );
				const contentView = new View( editorWithUi.locale );

				contentView.setTemplate( {
					tag: 'div',
					children: [ 'Hello World' ]
				} );

				contextualBalloon.add( {
					view: contentView,
					position: getBalloonPositionData()
				} );

				expect( pinSpy ).toHaveBeenCalledTimes( 1 );
				expect( pinSpy.mock.calls[ 0 ][ 0 ].viewportOffsetConfig.top ).toBe( 50 );
			} );

			it( 'should summarize ui viewportOffset and sticky panel height in the viewportOffset option', () => {
				editorWithUi.ui.view.stickyPanel.isSticky = true;
				editorWithUi.ui.viewportOffset = {
					top: 100
				};

				_setModelData( editorWithUi.model, '<paragraph>foo[]</paragraph>' );

				const pinSpy = vi.spyOn( contextualBalloon.view, 'pin' );
				const contentView = new View( editorWithUi.locale );

				contentView.setTemplate( {
					tag: 'div',
					children: [ 'Hello World' ]
				} );

				contextualBalloon.add( {
					view: contentView,
					position: getBalloonPositionData()
				} );

				expect( pinSpy ).toHaveBeenCalledTimes( 1 );
				expect( pinSpy.mock.calls[ 0 ][ 0 ].viewportOffsetConfig.top ).toBe( 150 );

				// Handle change of viewport offset.
				editorWithUi.ui.viewportOffset = {
					top: 200
				};

				expect( pinSpy ).toHaveBeenCalledTimes( 2 );
				expect( pinSpy.mock.calls[ 1 ][ 0 ].viewportOffsetConfig.top ).toBe( 250 );
			} );

			it( 'should set proper viewportOffsetConfig top offset when sticky panel is not visible', () => {
				editorWithUi.ui.view.stickyPanel.isSticky = false;

				_setModelData( editorWithUi.model, '<paragraph>foo[]</paragraph>' );

				const pinSpy = vi.spyOn( contextualBalloon.view, 'pin' );
				const contentView = new View( editorWithUi.locale );

				contentView.setTemplate( {
					tag: 'div',
					children: [ 'Hello World' ]
				} );

				contextualBalloon.add( {
					view: contentView,
					position: getBalloonPositionData()
				} );

				expect( pinSpy ).toHaveBeenCalledTimes( 1 );
				expect( pinSpy.mock.calls[ 0 ][ 0 ].viewportOffsetConfig.top ).toBe( 0 );
			} );

			it( 'should update viewportOffsetConfig top offset when sticky panel becomes visible', () => {
				_setModelData( editorWithUi.model, '<paragraph>foo[]</paragraph>' );

				const pinSpy = vi.spyOn( contextualBalloon.view, 'pin' );
				const contentView = new View( editorWithUi.locale );

				editorWithUi.ui.view.stickyPanel.isSticky = false;

				contentView.setTemplate( {
					tag: 'div',
					children: [ 'Hello World' ]
				} );

				contextualBalloon.add( {
					view: contentView,
					position: getBalloonPositionData()
				} );

				expect( pinSpy ).toHaveBeenCalledTimes( 1 );
				expect( pinSpy.mock.calls[ 0 ][ 0 ].viewportOffsetConfig.top ).toBe( 0 );

				editorWithUi.ui.view.stickyPanel.isSticky = true;

				expect( pinSpy.mock.calls[ 1 ][ 0 ].viewportOffsetConfig.top ).toBe( 50 );
			} );

			it( 'should not update viewportOffsetConfig top offset when sticky panel becomes visible', () => {
				_setModelData( editorWithUi.model, '<paragraph>foo[]</paragraph>' );
				editorWithUi.ui.view.stickyPanel.isSticky = true;

				const pinSpy = vi.spyOn( contextualBalloon.view, 'pin' );
				const contentView = new View( editorWithUi.locale );

				const targetElement = document.createElement( 'div' );
				const limiterElement = document.createElement( 'div' );

				targetElement.style.height = '400px';
				limiterElement.style.height = '200px';

				document.body.appendChild( targetElement );
				document.body.appendChild( limiterElement );

				contentView.setTemplate( {
					tag: 'div',
					children: [ 'Hello World' ]
				} );

				contextualBalloon.add( {
					view: contentView,
					position: {
						target: targetElement,
						limiter: limiterElement
					}
				} );

				expect( pinSpy ).toHaveBeenCalledTimes( 1 );
				expect( pinSpy.mock.calls[ 0 ][ 0 ].viewportOffsetConfig.top ).toBe( 0 );

				targetElement.remove();
				limiterElement.remove();
			} );

			function getBalloonPositionData() {
				const view = editorWithUi.editing.view;

				return {
					target: () => view.domConverter.viewRangeToDom( view.document.selection.getFirstRange() )
				};
			}
		} );

		describe( 'integration with the Dialog plugin and sticky panel (toolbar)', () => {
			let editorWithUi, editorElement, dialogPlugin, dialogContentView;

			beforeEach( async () => {
				editorElement = document.createElement( 'div' );

				document.body.appendChild( editorElement );

				editorWithUi = await ClassicEditor.create( editorElement, {
					plugins: [
						Dialog
					]
				} );

				dialogPlugin = editorWithUi.plugins.get( Dialog );

				dialogContentView = new View();

				dialogContentView.setTemplate( {
					tag: 'div',
					attributes: {
						style: {
							width: '100px',
							height: '50px'
						}
					}
				} );

				vi.spyOn( editorWithUi.ui.view.stickyPanel.contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
					height: 50,
					bottom: 50
				} );

				vi.spyOn( editorWithUi.ui.view.editable.element, 'getBoundingClientRect' ).mockReturnValue( {
					top: 0,
					right: 300,
					bottom: 100,
					left: 0,
					width: 300,
					height: 100
				} );
			} );

			afterEach( async () => {
				await editorWithUi.destroy();
				editorElement.remove();
			} );

			it( 'should move the dialog away from the sticky toolbar if there is a risk they will overlap', async () => {
				editorWithUi.ui.view.stickyPanel.isSticky = true;

				dialogPlugin.show( {
					label: 'Foo',
					content: dialogContentView,
					position: DialogViewPosition.EDITOR_TOP_SIDE
				} );

				vi.spyOn( dialogPlugin.view.element.firstChild, 'getBoundingClientRect' ).mockReturnValue( {
					top: 0,
					right: 100,
					bottom: 50,
					left: 0,
					width: 100,
					height: 50
				} );

				// Automatic positioning of the dialog on first show takes a while.
				await wait( 20 );

				expect( dialogPlugin.view.element.firstChild.style.left ).toBe( '185px' );
				expect( dialogPlugin.view.element.firstChild.style.top ).toBe( '65px' );
			} );

			it( 'should not move the dialog if the panel is not currently sticky', async () => {
				editorWithUi.ui.view.stickyPanel.isSticky = false;

				dialogPlugin.show( {
					label: 'Foo',
					content: dialogContentView,
					position: DialogViewPosition.EDITOR_TOP_SIDE
				} );

				vi.spyOn( dialogPlugin.view.element.firstChild, 'getBoundingClientRect' ).mockReturnValue( {
					top: 0,
					right: 100,
					bottom: 50,
					left: 0,
					width: 100,
					height: 50
				} );

				// Automatic positioning of the dialog on first show takes a while.
				await wait( 20 );

				expect( dialogPlugin.view.element.firstChild.style.left ).toBe( '185px' );
				expect( dialogPlugin.view.element.firstChild.style.top ).toBe( '15px' );
			} );

			it( 'should not move the dialog if it already respects the sticky toolbar offset', async () => {
				editorWithUi.ui.view.stickyPanel.isSticky = true;

				editorWithUi.ui.view.stickyPanel.contentPanelElement.getBoundingClientRect.mockReturnValue( {
					height: 0,
					bottom: 0
				} );

				dialogPlugin.show( {
					label: 'Foo',
					content: dialogContentView,
					position: DialogViewPosition.EDITOR_TOP_SIDE
				} );

				vi.spyOn( dialogPlugin.view.element.firstChild, 'getBoundingClientRect' ).mockReturnValue( {
					top: 0,
					right: 100,
					bottom: 50,
					left: 0,
					width: 100,
					height: 50
				} );

				// Automatic positioning of the dialog on first show takes a while.
				await wait( 20 );

				expect( dialogPlugin.view.element.firstChild.style.left ).toBe( '185px' );
				expect( dialogPlugin.view.element.firstChild.style.top ).toBe( '15px' );
			} );

			it( 'should not move the dialog away from the sticky toolbar if the user has already moved the dialog', async () => {
				editorWithUi.ui.view.stickyPanel.isSticky = true;

				dialogPlugin.show( {
					label: 'Foo',
					content: dialogContentView,
					position: DialogViewPosition.EDITOR_TOP_SIDE
				} );

				vi.spyOn( dialogPlugin.view.element.firstChild, 'getBoundingClientRect' ).mockReturnValue( {
					top: 0,
					right: 100,
					bottom: 50,
					left: 0,
					width: 100,
					height: 50
				} );

				// Automatic positioning of the dialog on first show takes a while.
				await wait( 20 );

				expect( dialogPlugin.view.element.firstChild.style.left ).toBe( '185px' );
				expect( dialogPlugin.view.element.firstChild.style.top ).toBe( '65px' );

				// Sticky panel could've unstuck in the meantime (document scroll). Let's make sure it stays sticky.
				editorWithUi.ui.view.stickyPanel.isSticky = true;

				// Simulate a user moving the dialog.
				dialogPlugin.view.fire( 'drag', { deltaX: 0, deltaY: -10 } );
				dialogPlugin.view.fire( 'drag', { deltaX: 0, deltaY: -10 } );
				dialogPlugin.view.fire( 'drag', { deltaX: 0, deltaY: -10 } );
				dialogPlugin.view.fire( 'drag', { deltaX: 0, deltaY: -10 } );
				dialogPlugin.view.fire( 'drag', { deltaX: 0, deltaY: -10 } );
				dialogPlugin.view.fire( 'drag', { deltaX: 0, deltaY: -10 } );

				expect( dialogPlugin.view.element.firstChild.style.left ).toBe( '185px' );
				expect( dialogPlugin.view.element.firstChild.style.top ).toBe( '5px' );
			} );

			it( 'should not move the dialog if it is a modal', async () => {
				editorWithUi.ui.view.stickyPanel.isSticky = true;

				dialogPlugin.show( {
					label: 'Foo',
					isModal: true,
					content: dialogContentView,
					position: DialogViewPosition.EDITOR_TOP_SIDE
				} );

				vi.spyOn( dialogPlugin.view.element.firstChild, 'getBoundingClientRect' ).mockReturnValue( {
					top: 0,
					right: 100,
					bottom: 50,
					left: 0,
					width: 100,
					height: 50
				} );

				// Automatic positioning of the dialog on first show takes a while.
				await wait( 20 );

				expect( dialogPlugin.view.element.firstChild.style.left ).toBe( '185px' );
				expect( dialogPlugin.view.element.firstChild.style.top ).toBe( '15px' );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'detaches the DOM root then destroys the UI view', () => {
			return VirtualClassicTestEditor.create( '' )
				.then( newEditor => {
					const destroySpy = vi.spyOn( newEditor.ui.view, 'destroy' );
					const detachSpy = vi.spyOn( newEditor.editing.view, 'detachDomRoot' );

					return newEditor.destroy()
						.then( () => {
							expect( detachSpy ).toHaveBeenCalled();
							expect( destroySpy ).toHaveBeenCalled();
							expect( detachSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( destroySpy.mock.invocationCallOrder[ 0 ] );
						} );
				} );
		} );

		it( 'restores the editor element back to its original state', () => {
			const domElement = document.createElement( 'div' );

			domElement.setAttribute( 'foo', 'bar' );
			domElement.setAttribute( 'data-baz', 'qux' );
			domElement.classList.add( 'foo-class' );

			return VirtualClassicTestEditor.create( domElement )
				.then( newEditor => {
					return newEditor.destroy()
						.then( () => {
							const attributes = {};

							for ( const attribute of Array.from( domElement.attributes ) ) {
								attributes[ attribute.name ] = attribute.value;
							}

							expect( attributes ).toEqual( {
								foo: 'bar',
								'data-baz': 'qux',
								class: 'foo-class'
							} );
						} );
				} );
		} );

		it( 'should call parent EditorUI#destroy() first before destroying the view', async () => {
			const newEditor = await VirtualClassicTestEditor.create( '' );
			const parentEditorUIPrototype = Object.getPrototypeOf( newEditor.ui.constructor.prototype );

			const parentDestroySpy = vi.spyOn( parentEditorUIPrototype, 'destroy' );
			const viewDestroySpy = vi.spyOn( newEditor.ui.view, 'destroy' );

			await newEditor.destroy();

			expect( parentDestroySpy ).toHaveBeenCalled();
			expect( viewDestroySpy ).toHaveBeenCalled();
			expect( parentDestroySpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( viewDestroySpy.mock.invocationCallOrder[ 0 ] );
		} );

		it( 'should not crash if called twice', async () => {
			const newEditor = await VirtualClassicTestEditor.create( '' );

			await newEditor.destroy();
			await newEditor.destroy(); // Should not throw.
		} );
	} );

	describe( 'view()', () => {
		it( 'returns view instance', () => {
			expect( ui.view ).toBe( view );
		} );
	} );

	describe( 'element()', () => {
		it( 'returns correct element instance', () => {
			expect( ui.element ).toBe( viewElement );
		} );
	} );

	describe( 'getEditableElement()', () => {
		it( 'returns editable element (default)', () => {
			expect( ui.getEditableElement() ).toBe( view.editable.element );
		} );

		it( 'returns editable element (root name passed)', () => {
			expect( ui.getEditableElement( 'main' ) ).toBe( view.editable.element );
		} );

		it( 'returns undefined if editable with the given name is absent', () => {
			expect( ui.getEditableElement( 'absent' ) ).toBeUndefined();
		} );
	} );

	describe( 'View#scrollToTheSelection integration', () => {
		it( 'should listen to View#scrollToTheSelection and inject the height of the panel into `viewportOffset` when sticky', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicEditor.create( editorElement, {
				ui: {
					viewportOffset: {
						top: 10,
						bottom: 20,
						left: 30,
						right: 40
					}
				}
			} );

			editor.ui.view.stickyPanel.isSticky = true;
			vi.spyOn( editor.ui.view.stickyPanel.element, 'getBoundingClientRect' ).mockReturnValue( {
				height: 50
			} );

			editor.editing.view.once( 'scrollToTheSelection', ( evt, data ) => {
				const range = editor.editing.view.document.selection.getFirstRange();

				expect( data ).toEqual( {
					target: editor.editing.view.domConverter.viewRangeToDom( range ),
					viewportOffset: {
						top: 160,
						bottom: 120,
						left: 130,
						right: 140
					},
					ancestorOffset: 20,
					alignToTop: undefined,
					forceScroll: undefined
				} );
			} );

			editor.editing.view.scrollToTheSelection( { viewportOffset: 100 } );

			editorElement.remove();
			await editor.destroy();
		} );

		it( 'should listen to View#scrollToTheSelection and re-scroll if the panel was not sticky at the moment of execution' +
			'but becomes sticky after a short while', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicEditor.create( editorElement, {
				ui: {
					viewportOffset: {
						top: 10,
						bottom: 20,
						left: 30,
						right: 40
					}
				}
			} );

			editor.ui.view.stickyPanel.isSticky = false;
			vi.spyOn( editor.ui.view.stickyPanel.element, 'getBoundingClientRect' ).mockReturnValue( {
				height: 50
			} );

			const spy = vi.fn();

			editor.editing.view.on( 'scrollToTheSelection', spy );
			editor.editing.view.scrollToTheSelection( { viewportOffset: 100 } );

			const range = editor.editing.view.document.selection.getFirstRange();

			// The first call will trigger another one shortly once the panel becomes sticky.
			expect( spy.mock.calls[ 0 ][ 1 ] ).toMatchObject( {
				target: editor.editing.view.domConverter.viewRangeToDom( range ),
				alignToTop: undefined,
				forceScroll: undefined,
				viewportOffset: { top: 110, bottom: 120, left: 130, right: 140 },
				ancestorOffset: 20
			} );

			await wait( 10 );
			editor.ui.view.stickyPanel.isSticky = true;

			// This is the second and final scroll that considers the geometry of a now-sticky panel.
			expect( spy.mock.calls[ 1 ][ 1 ] ).toMatchObject( {
				target: editor.editing.view.domConverter.viewRangeToDom( range ),
				alignToTop: undefined,
				forceScroll: undefined,
				viewportOffset: { top: 160, bottom: 120, left: 130, right: 140 },
				ancestorOffset: 20
			} );

			editorElement.remove();
			await editor.destroy();
		} );

		it( 'should listen to View#scrollToTheSelection and refuse re-scrolling if the panel was not sticky at the moment of execution' +
			'and its state it didn\'t change', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicEditor.create( editorElement, {
				ui: {
					viewportOffset: {
						top: 10,
						bottom: 20,
						left: 30,
						right: 40
					}
				}
			} );

			editor.ui.view.stickyPanel.isSticky = false;
			vi.spyOn( editor.ui.view.stickyPanel.element, 'getBoundingClientRect' ).mockReturnValue( {
				height: 50
			} );

			const spy = vi.fn();

			editor.editing.view.on( 'scrollToTheSelection', spy );
			editor.editing.view.scrollToTheSelection( { viewportOffset: 100 } );

			const range = editor.editing.view.document.selection.getFirstRange();

			// The first call can trigger another one shortly once the panel becomes sticky.
			expect( spy.mock.calls[ 0 ][ 1 ] ).toMatchObject( {
				target: editor.editing.view.domConverter.viewRangeToDom( range ),
				alignToTop: undefined,
				forceScroll: undefined,
				viewportOffset: { top: 110, bottom: 120, left: 130, right: 140 },
				ancestorOffset: 20
			} );

			// This timeout exceeds the time slot for scrollToTheSelection() affecting the stickiness of the panel.
			// If the panel hasn't become sticky yet as a result of window getting scrolled chances are this will never happen.
			await wait( 30 );

			expect( spy ).toHaveBeenCalledTimes( 1 );

			editor.ui.view.stickyPanel.isSticky = true;

			// There was no second scroll even though the panel became sticky. Too much time has passed and the change of its state
			// cannot be attributed to doings of scrollToTheSelection() anymore.
			expect( spy ).toHaveBeenCalledTimes( 1 );

			editorElement.remove();
			await editor.destroy();
		} );
	} );
} );

describe( 'Focus handling and navigation between editing root and editor toolbar', () => {
	let editorElement, editor, ui, toolbarView, domRoot;

	beforeEach( async () => {
		editorElement = document.body.appendChild( document.createElement( 'div' ) );

		editor = await ClassicEditor.create( editorElement, {
			plugins: [ Paragraph, Image, ImageToolbar, ImageCaption ],
			toolbar: [ 'imageTextAlternative' ],
			menuBar: { isVisible: true },
			image: {
				toolbar: [ 'toggleImageCaption' ]
			}
		} );

		domRoot = editor.editing.view.domRoots.get( 'main' );

		ui = editor.ui;
		toolbarView = ui.view.toolbar;
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'Focusing toolbars on Alt+F10 key press', () => {
		beforeEach( () => {
			ui.focusTracker.isFocused = true;
			ui.focusTracker.focusedElement = domRoot;
		} );

		it( 'should focus the main toolbar when the focus is in the editing root', () => {
			const spy = vi.spyOn( toolbarView, 'focus' );

			_setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			ui.focusTracker.isFocused = true;
			ui.focusTracker.focusedElement = domRoot;

			pressAltF10( editor );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should do nothing if the toolbar is already focused', () => {
			const domRootFocusSpy = vi.spyOn( domRoot, 'focus' );
			const toolbarFocusSpy = vi.spyOn( toolbarView, 'focus' );

			_setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			// Focus the toolbar.
			pressAltF10( editor );
			ui.focusTracker.focusedElement = toolbarView.element;

			// Try Alt+F10 again.
			pressAltF10( editor );

			expect( toolbarFocusSpy ).toHaveBeenCalledTimes( 1 );
			expect( domRootFocusSpy ).not.toHaveBeenCalled();
		} );

		it( 'should prioritize widget toolbar over the global toolbar', () => {
			const widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
			const imageToolbar = widgetToolbarRepository._toolbarDefinitions.get( 'image' ).view;

			const toolbarSpy = vi.spyOn( toolbarView, 'focus' );
			const imageToolbarSpy = vi.spyOn( imageToolbar, 'focus' );

			_setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'[<imageBlock src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/warsaw.jpg"><caption>bar</caption></imageBlock>]' +
				'<paragraph>baz</paragraph>'
			);

			// Focus the image balloon toolbar.
			pressAltF10( editor );
			ui.focusTracker.focusedElement = imageToolbar.element;

			expect( imageToolbarSpy ).toHaveBeenCalledTimes( 1 );
			expect( toolbarSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Restoring focus on Esc key press', () => {
		beforeEach( () => {
			ui.focusTracker.isFocused = true;
			ui.focusTracker.focusedElement = domRoot;
		} );

		it( 'should move the focus back from the main toolbar to the editing root', () => {
			const domRootFocusSpy = vi.spyOn( domRoot, 'focus' );
			const toolbarFocusSpy = vi.spyOn( toolbarView, 'focus' );

			_setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			// Focus the toolbar.
			pressAltF10( editor );
			ui.focusTracker.focusedElement = toolbarView.element;

			pressEsc( editor );

			expect( toolbarFocusSpy ).toHaveBeenCalled();
			expect( domRootFocusSpy ).toHaveBeenCalled();
			expect( toolbarFocusSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( domRootFocusSpy.mock.invocationCallOrder[ 0 ] );
		} );

		it( 'should do nothing if it was pressed when no toolbar was focused', () => {
			const domRootFocusSpy = vi.spyOn( domRoot, 'focus' );
			const toolbarFocusSpy = vi.spyOn( toolbarView, 'focus' );

			_setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			pressEsc( editor );

			expect( domRootFocusSpy ).not.toHaveBeenCalled();
			expect( toolbarFocusSpy ).not.toHaveBeenCalled();
		} );
	} );
} );

function pressAltF10( editor ) {
	editor.keystrokes.press( {
		keyCode: keyCodes.f10,
		altKey: true,
		preventDefault: vi.fn(),
		stopPropagation: vi.fn()
	} );
}

function pressEsc( editor ) {
	editor.keystrokes.press( {
		keyCode: keyCodes.esc,
		preventDefault: vi.fn(),
		stopPropagation: vi.fn()
	} );
}

function viewCreator( name ) {
	return locale => {
		const view = new View( locale );

		view.name = name;
		view.element = document.createElement( 'a' );

		return view;
	};
}

class VirtualClassicTestEditor extends VirtualTestEditor {
	constructor( sourceElementOrData, config ) {
		super( config );

		// Match real `ClassicEditor`: `separateAttachTo = true` so a DOM source element is routed to
		// `config.attachTo` rather than `rootConfig.element`.
		normalizeRootsConfig( sourceElementOrData, this.config, 'main', true );

		if ( isElement( sourceElementOrData ) ) {
			this.sourceElement = sourceElementOrData;
		}

		const view = new ClassicEditorUIView( this.locale, this.editing.view );
		this.ui = new ClassicEditorUI( this, view );

		this.ui.componentFactory.add( 'foo', viewCreator( 'foo' ) );
		this.ui.componentFactory.add( 'bar', viewCreator( 'bar' ) );
	}

	destroy() {
		this.ui.destroy();

		return super.destroy();
	}

	static create( sourceElementOrData, config ) {
		return new Promise( resolve => {
			const editor = new this( sourceElementOrData, config );

			resolve(
				editor.initPlugins()
					.then( () => {
						editor.ui.init();

						const initialData = isElement( sourceElementOrData ) ?
							sourceElementOrData.innerHTML :
							sourceElementOrData;

						editor.data.init( initialData );
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}

function wait( time ) {
	return new Promise( res => {
		window.setTimeout( res, time );
	} );
}
