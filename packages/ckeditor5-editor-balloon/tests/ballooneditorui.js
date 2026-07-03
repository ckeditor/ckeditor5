/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { BalloonEditor } from '../src/ballooneditor.js';
import { BalloonEditorUI } from '../src/ballooneditorui.js';
import { EditorUI, BalloonToolbar } from '@ckeditor/ckeditor5-ui';
import { BalloonEditorUIView } from '../src/ballooneditoruiview.js';
import { Image, ImageCaption, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';

import { keyCodes } from '@ckeditor/ckeditor5-utils';
import { isElement } from 'es-toolkit/compat';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { _setModelData } from '@ckeditor/ckeditor5-engine';
import { assertBinding } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { normalizeRootsConfig, Plugin } from '@ckeditor/ckeditor5-core';

describe( 'BalloonEditorUI', () => {
	let editor, view, ui, viewElement;

	beforeEach( () => {
		return VirtualBalloonTestEditor
			.create( 'foo', {
				plugins: [ BalloonToolbar ]
			} )
			.then( newEditor => {
				editor = newEditor;
				ui = editor.ui;
				view = ui.view;
				viewElement = view.editable.element;
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'extends EditorUI', () => {
			expect( ui ).toBeInstanceOf( EditorUI );
		} );
	} );

	describe( 'init()', () => {
		it( 'initializes the #view', () => {
			expect( view.isRendered ).toBe( true );
		} );

		describe( 'editable', () => {
			let editable;

			beforeEach( () => {
				editable = editor.editing.view.document.getRoot();
			} );

			it( 'registers view.editable#element in editor focus tracker', () => {
				ui.focusTracker.isFocused = false;

				view.editable.element.dispatchEvent( new Event( 'focus' ) );
				expect( ui.focusTracker.isFocused ).toBe( true );
			} );

			it( 'sets view.editable#name', () => {
				expect( view.editable.name ).toBe( editable.rootName );
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
		} );

		describe( 'inline root', () => {
			it( 'leaves view.editable#isInlineRoot false for a block root', () => {
				expect( view.editable.isInlineRoot ).toBe( false );
				expect( view.editable.element.classList.contains( 'ck-editor__editable_inline-root' ) ).toBe( false );
			} );

			it( 'sets view.editable#isInlineRoot to true when the root is $inlineRoot', () => {
				return VirtualBalloonTestEditor
					.create( '', {
						extraPlugins: [ BalloonToolbar ],
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

				return VirtualBalloonTestEditor
					.create( '', {
						extraPlugins: [ BalloonToolbar, CustomBlockRootPlugin ],
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

				return VirtualBalloonTestEditor
					.create( '', {
						extraPlugins: [ BalloonToolbar, CustomInlineRootPlugin ],
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

		describe( 'placeholder', () => {
			it( 'sets placeholder from editor.config.root.placeholder - string', () => {
				return VirtualBalloonTestEditor
					.create( 'foo', {
						extraPlugins: [ BalloonToolbar, Paragraph ],
						root: { placeholder: 'placeholder-text' }
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).toBe( 'placeholder-text' );

						return newEditor.destroy();
					} );
			} );

			it( 'sets the placeholder directly on the root for an inline root (no block child to host it)', () => {
				return VirtualBalloonTestEditor
					.create( '', {
						extraPlugins: [ BalloonToolbar ],
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
				return VirtualBalloonTestEditor
					.create( 'foo', {
						extraPlugins: [ BalloonToolbar, Paragraph ],
						placeholder: 'placeholder-text'
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).toBe( 'placeholder-text' );

						return newEditor.destroy();
					} );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'detaches the DOM root then destroys the UI view', () => {
			return VirtualBalloonTestEditor
				.create( '', {
					plugins: [ BalloonToolbar ]
				} )
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

			return VirtualBalloonTestEditor
				.create( domElement, {
					plugins: [ BalloonToolbar ]
				} )
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
			const newEditor = await VirtualBalloonTestEditor.create( '' );
			const parentEditorUIPrototype = Object.getPrototypeOf( newEditor.ui.constructor.prototype );

			const parentDestroySpy = vi.spyOn( parentEditorUIPrototype, 'destroy' );
			const viewDestroySpy = vi.spyOn( newEditor.ui.view, 'destroy' );

			await newEditor.destroy();

			expect( parentDestroySpy ).toHaveBeenCalled();
			expect( viewDestroySpy ).toHaveBeenCalled();
			expect( parentDestroySpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( viewDestroySpy.mock.invocationCallOrder[ 0 ] );
		} );

		it( 'should not crash if called twice', async () => {
			const newEditor = await VirtualBalloonTestEditor.create( '' );

			await newEditor.destroy();
			await newEditor.destroy();
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
} );

describe( 'Focus handling and navigation between editing root and editor toolbar', () => {
	let editorElement, editor, ui, toolbarView, domRoot;

	beforeEach( async () => {
		editorElement = document.body.appendChild( document.createElement( 'div' ) );

		editor = await BalloonEditor.create( editorElement, {
			plugins: [ BalloonToolbar, Heading, Paragraph, Image, ImageToolbar, ImageCaption ],
			toolbar: [ 'heading', 'imageTextAlternative' ],
			image: {
				toolbar: [ 'toggleImageCaption' ]
			}
		} );

		domRoot = editor.editing.view.domRoots.get( 'main' );

		ui = editor.ui;
		toolbarView = editor.plugins.get( 'BalloonToolbar' ).toolbarView;
	} );

	afterEach( () => {
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

			pressAltF10();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should do nothing if the toolbar is already focused', () => {
			const domRootFocusSpy = vi.spyOn( domRoot, 'focus' );
			const toolbarFocusSpy = vi.spyOn( toolbarView, 'focus' );

			_setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			// Focus the toolbar.
			pressAltF10();
			ui.focusTracker.focusedElement = toolbarView.element;

			// Try Alt+F10 again.
			pressAltF10();

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
			pressAltF10();
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
			pressAltF10();
			ui.focusTracker.focusedElement = toolbarView.element;

			pressEsc();

			expect( toolbarFocusSpy ).toHaveBeenCalled();
			expect( domRootFocusSpy ).toHaveBeenCalled();
			expect( toolbarFocusSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( domRootFocusSpy.mock.invocationCallOrder[ 0 ] );
		} );

		it( 'should do nothing if it was pressed when no toolbar was focused', () => {
			const domRootFocusSpy = vi.spyOn( domRoot, 'focus' );
			const toolbarFocusSpy = vi.spyOn( toolbarView, 'focus' );

			_setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			pressEsc();

			expect( domRootFocusSpy ).not.toHaveBeenCalled();
			expect( toolbarFocusSpy ).not.toHaveBeenCalled();
		} );
	} );

	function pressAltF10() {
		editor.keystrokes.press( {
			keyCode: keyCodes.f10,
			altKey: true,
			preventDefault: vi.fn(),
			stopPropagation: vi.fn()
		} );
	}

	function pressEsc() {
		editor.keystrokes.press( {
			keyCode: keyCodes.esc,
			preventDefault: vi.fn(),
			stopPropagation: vi.fn()
		} );
	}
} );

class VirtualBalloonTestEditor extends VirtualTestEditor {
	constructor( sourceElementOrData, config ) {
		super( config );

		normalizeRootsConfig( sourceElementOrData, this.config );

		if ( isElement( sourceElementOrData ) ) {
			this.sourceElement = sourceElementOrData;
		}

		const view = new BalloonEditorUIView( this.locale, this.editing.view );
		this.ui = new BalloonEditorUI( this, view );
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
