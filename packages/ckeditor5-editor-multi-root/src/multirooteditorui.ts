/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-multi-root/multirooteditorui
 */

import {
	type Editor
} from 'ckeditor5/src/core.js';

import {
	EditorUI,
	type EditorUIReadyEvent,
	type InlineEditableUIView
} from 'ckeditor5/src/ui.js';

import { enablePlaceholder } from 'ckeditor5/src/engine.js';

import type MultiRootEditorUIView from './multirooteditoruiview.js';

/**
 * The multi-root editor UI class.
 */
export default class MultiRootEditorUI extends EditorUI {
	/**
	 * The main (top–most) view of the editor UI.
	 */
	public readonly view: MultiRootEditorUIView;

	/**
	 * The editable element that was focused the last time when any of the editables had focus.
	 */
	private _lastFocusedEditableElement: HTMLElement | null;

	/**
	 * Creates an instance of the multi-root editor UI class.
	 *
	 * @param editor The editor instance.
	 * @param view The view of the UI.
	 */
	constructor( editor: Editor, view: MultiRootEditorUIView ) {
		super( editor );

		this.view = view;
		this._lastFocusedEditableElement = null;
	}

	/**
	 * Initializes the UI.
	 */
	public init(): void {
		const view = this.view;

		view.render();

		// Keep track of the last focused editable element. Knowing which one was focused
		// is useful when the focus moves from editable to other UI components like balloons
		// (especially inputs) but the editable remains the "focus context" (e.g. link balloon
		// attached to a link in an editable). In this case, the editable should preserve visual
		// focus styles.
		this.focusTracker.on( 'change:focusedElement', ( evt, name, focusedElement ) => {
			for ( const editable of Object.values( this.view.editables ) ) {
				if ( focusedElement === editable.element ) {
					this._lastFocusedEditableElement = editable.element;
				}
			}
		} );

		// If the focus tracker loses focus, stop tracking the last focused editable element.
		// Wherever the focus is restored, it will no longer be in the context of that editable
		// because the focus "came from the outside", as opposed to the focus moving from one element
		// to another within the editor UI.
		this.focusTracker.on( 'change:isFocused', ( evt, name, isFocused ) => {
			if ( !isFocused ) {
				this._lastFocusedEditableElement = null;
			}
		} );

		for ( const editable of Object.values( this.view.editables ) ) {
			this.addEditable( editable );
		}

		this._initToolbar();
		this._initMenuBar( this.view.menuBarView! );
		this.fire<EditorUIReadyEvent>( 'ready' );
	}

	/**
	 * Adds the editable to the editor UI.
	 *
	 * After the editable is added to the editor UI it can be considered "active".
	 *
	 * The editable is attached to the editor editing pipeline, which means that it will be updated as the editor model updates and
	 * changing its content will be reflected in the editor model. Keystrokes, focus handling and placeholder are initialized.
	 *
	 * @param editable The editable instance to add.
	 * @param placeholder Placeholder for the editable element. If not set, placeholder value from the
	 * {@link module:core/editor/editorconfig~EditorConfig#placeholder editor configuration} will be used (if it was provided).
	 */
	public addEditable( editable: InlineEditableUIView, placeholder?: string ): void {
		// The editable UI element in DOM is available for sure only after the editor UI view has been rendered.
		// But it can be available earlier if a DOM element has been passed to `MultiRootEditor.create()`.
		const editableElement = editable.element!;

		// Bind the editable UI element to the editing view, making it an end– and entry–point
		// of the editor's engine. This is where the engine meets the UI.
		this.editor.editing.view.attachDomRoot( editableElement, editable.name! );

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
					return this._lastFocusedEditableElement === editableElement;
				}
			} );

		this._initPlaceholder( editable, placeholder );
	}

	/**
	 * Removes the editable instance from the editor UI.
	 *
	 * Removed editable can be considered "deactivated".
	 *
	 * The editable is detached from the editing pipeline, so model changes are no longer reflected in it. All handling added in
	 * {@link #addEditable} is removed.
	 *
	 * @param editable Editable to remove from the editor UI.
	 */
	public removeEditable( editable: InlineEditableUIView ): void {
		this.editor.editing.view.detachDomRoot( editable.name! );
		editable.unbind( 'isFocused' );
		this.removeEditableElement( editable.name! );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		for ( const editable of Object.values( this.view.editables ) ) {
			this.removeEditable( editable );
		}

		this.view.destroy();
	}

	/**
	 * Initializes the editor main toolbar and its panel.
	 */
	private _initToolbar(): void {
		const editor = this.editor;
		const view = this.view;
		const toolbar = view.toolbar;

		toolbar.fillFromConfig( editor.config.get( 'toolbar' ), this.componentFactory );

		// Register the toolbar, so it becomes available for Alt+F10 and Esc navigation.
		this.addToolbar( view.toolbar );
	}

	/**
	 * Enables the placeholder text on a given editable.
	 *
	 * @param editable Editable on which the placeholder should be set.
	 * @param placeholder Placeholder for the editable element. If not set, placeholder value from the
	 * {@link module:core/editor/editorconfig~EditorConfig#placeholder editor configuration} will be used (if it was provided).
	 */
	private _initPlaceholder( editable: InlineEditableUIView, placeholder?: string ): void {
		if ( !placeholder ) {
			const configPlaceholder = this.editor.config.get( 'placeholder' );

			if ( configPlaceholder ) {
				placeholder = typeof configPlaceholder === 'string' ? configPlaceholder : configPlaceholder[ editable.name! ];
			}
		}

		const editingView = this.editor.editing.view;
		const editingRoot = editingView.document.getRoot( editable.name! )!;

		if ( placeholder ) {
			editingRoot.placeholder = placeholder;
		}

		enablePlaceholder( {
			view: editingView,
			element: editingRoot,
			isDirectHost: false,
			keepOnFocus: true
		} );
	}
}
