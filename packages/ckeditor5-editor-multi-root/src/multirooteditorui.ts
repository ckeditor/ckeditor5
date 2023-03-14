/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-multi-root/multirooteditorui
 */

import {
	type Editor
} from 'ckeditor5/src/core';

import {
	EditorUI,
	type EditorUIReadyEvent
} from 'ckeditor5/src/ui';

import { enablePlaceholder } from 'ckeditor5/src/engine';

import type MultiRootEditorUIView from './multirooteditoruiview';

/**
 * The multi-root editor UI class.
 */
export default class MultiRootEditorUI extends EditorUI {
	/**
	 * The main (top–most) view of the editor UI.
	 */
	public readonly view: MultiRootEditorUIView;

	/**
	 * Creates an instance of the multi-root editor UI class.
	 *
	 * @param editor The editor instance.
	 * @param view The view of the UI.
	 */
	constructor( editor: Editor, view: MultiRootEditorUIView ) {
		super( editor );

		this.view = view;
	}

	/**
	 * Initializes the UI.
	 */
	public init(): void {
		const view = this.view;
		const editor = this.editor;
		const editingView = editor.editing.view;

		let lastFocusedEditableElement: HTMLElement | null;

		for ( const editableName of Object.keys( view.editables ) ) {
			view.editables[ editableName ].name = editableName;
		}

		view.render();

		// Keep track of the last focused editable element. Knowing which one was focused
		// is useful when the focus moves from editable to other UI components like balloons
		// (especially inputs) but the editable remains the "focus context" (e.g. link balloon
		// attached to a link in an editable). In this case, the editable should preserve visual
		// focus styles.
		this.focusTracker.on( 'change:focusedElement', ( evt, name, focusedElement ) => {
			for ( const editable of Object.values( this.view.editables ) ) {
				if ( focusedElement === editable.element ) {
					lastFocusedEditableElement = editable.element;
				}
			}
		} );

		// If the focus tracker loses focus, stop tracking the last focused editable element.
		// Wherever the focus is restored, it will no longer be in the context of that editable
		// because the focus "came from the outside", as opposed to the focus moving from one element
		// to another within the editor UI.
		this.focusTracker.on( 'change:isFocused', ( evt, name, isFocused ) => {
			if ( !isFocused ) {
				lastFocusedEditableElement = null;
			}
		} );

		for ( const editable of Object.values( this.view.editables ) ) {
			// The editable UI element in DOM is available for sure only after the editor UI view has been rendered.
			// But it can be available earlier if a DOM element has been passed to `MultiRootEditor.create()`.
			const editableElement = editable.element!;

			// Register each editable UI view in the editor.
			this.setEditableElement( editable.name!, editableElement );

			// Let the editable UI element respond to the changes in the global editor focus
			// tracker. It has been added to the same tracker a few lines above but, in reality, there are
			// many focusable areas in the editor, like balloons, toolbars or dropdowns and as long
			// as they have focus, the editable should act like it is focused too (although technically
			// it isn't), e.g. by setting the proper CSS class, visually announcing focus to the user.
			// Doing otherwise will result in editable focus styles disappearing, once e.g. the
			// toolbar gets focused.
			editable.bind( 'isFocused' ).to( this.focusTracker, 'isFocused', this.focusTracker, 'focusedElement',
				( isFocused: boolean, focusedElement: Element | null ) => {
					// When the focus tracker is blurred, it means the focus moved out of the editor UI.
					// No editable will maintain focus then.
					if ( !isFocused ) {
						return false;
					}

					// If the focus tracker says the editor UI is focused and currently focused element
					// is the editable, then the editable should be visually marked as focused too.
					if ( focusedElement === editableElement ) {
						return true;
					}
					// If the focus tracker says the editor UI is focused but the focused element is
					// not an editable, it is possible that the editable is still (context–)focused.
					// For instance, the focused element could be an input inside of a balloon attached
					// to the content in the editable. In such case, the editable should remain _visually_
					// focused even though technically the focus is somewhere else. The focus moved from
					// the editable to the input but the focus context remained the same.
					else {
						return lastFocusedEditableElement === editableElement;
					}
				} );

			// Bind the editable UI element to the editing view, making it an end– and entry–point
			// of the editor's engine. This is where the engine meets the UI.
			editingView.attachDomRoot( editableElement, editable.name! );
		}

		this._initPlaceholder();
		this._initToolbar();
		this.fire<EditorUIReadyEvent>( 'ready' );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		const view = this.view;
		const editingView = this.editor.editing.view;

		for ( const editable of Object.values( this.view.editables ) ) {
			editingView.detachDomRoot( editable.name! );
		}

		view.destroy();
	}

	/**
	 * Initializes the editor main toolbar and its panel.
	 */
	private _initToolbar(): void {
		const editor = this.editor;
		const view = this.view;
		const toolbar = view.toolbar;

		toolbar.fillFromConfig( editor.config.get( 'toolbar' ), this.componentFactory );

		// Register the toolbar so it becomes available for Alt+F10 and Esc navigation.
		this.addToolbar( view.toolbar );
	}

	/**
	 * Enable the placeholder text on the editing roots, if any was configured.
	 */
	private _initPlaceholder(): void {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const placeholder = editor.config.get( 'placeholder' );

		if ( !placeholder ) {
			return;
		}

		for ( const editable of Object.values( this.view.editables ) ) {
			const editingRoot = editingView.document.getRoot( editable.name! )!;
			const placeholderText = typeof placeholder === 'string' ? placeholder : placeholder[ editable.name! ];

			if ( placeholderText ) {
				enablePlaceholder( {
					view: editingView,
					element: editingRoot,
					text: placeholderText,
					isDirectHost: false,
					keepOnFocus: true
				} );
			}
		}
	}
}
