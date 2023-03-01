/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-balloon/ballooneditorui
 */

import {
	type Editor,
	type ElementApi
} from 'ckeditor5/src/core';

import {
	EditorUI,
	type EditorUIReadyEvent
} from 'ckeditor5/src/ui';

import { enablePlaceholder } from 'ckeditor5/src/engine';

import type BalloonEditorUIView from './ballooneditoruiview';

/**
 * The balloon editor UI class.
 */
export default class BalloonEditorUI extends EditorUI {
	/**
	 * The main (top–most) view of the editor UI.
	 */
	public readonly view: BalloonEditorUIView;

	/**
	 * Creates an instance of the balloon editor UI class.
	 *
	 * @param editor The editor instance.
	 * @param view The view of the UI.
	 */
	constructor( editor: Editor, view: BalloonEditorUIView ) {
		super( editor );

		this.view = view;
	}

	/**
	 * @inheritDoc
	 */
	public override get element(): HTMLElement | null {
		return this.view.editable.element;
	}

	/**
	 * Initializes the UI.
	 */
	public init(): void {
		const editor = this.editor;
		const view = this.view;
		const editingView = editor.editing.view;
		const editable = view.editable;
		const editingRoot = editingView.document.getRoot()!;

		// The editable UI and editing root should share the same name. Then name is used
		// to recognize the particular editable, for instance in ARIA attributes.
		editable.name = editingRoot.rootName;

		view.render();

		// The editable UI element in DOM is available for sure only after the editor UI view has been rendered.
		// But it can be available earlier if a DOM element has been passed to BalloonEditor.create().
		const editableElement = editable.element!;

		// Register the editable UI view in the editor. A single editor instance can aggregate multiple
		// editable areas (roots) but the balloon editor has only one.
		this.setEditableElement( editable.name, editableElement );

		// Let the editable UI element respond to the changes in the global editor focus
		// tracker. It has been added to the same tracker a few lines above but, in reality, there are
		// many focusable areas in the editor, like balloons, toolbars or dropdowns and as long
		// as they have focus, the editable should act like it is focused too (although technically
		// it isn't), e.g. by setting the proper CSS class, visually announcing focus to the user.
		// Doing otherwise will result in editable focus styles disappearing, once e.g. the
		// toolbar gets focused.
		editable.bind( 'isFocused' ).to( this.focusTracker );

		// Bind the editable UI element to the editing view, making it an end– and entry–point
		// of the editor's engine. This is where the engine meets the UI.
		editingView.attachDomRoot( editableElement );

		this._initPlaceholder();
		this.fire<EditorUIReadyEvent>( 'ready' );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		const view = this.view;
		const editingView = this.editor.editing.view;

		editingView.detachDomRoot( view.editable.name! );
		view.destroy();
	}

	/**
	 * Enable the placeholder text on the editing root, if any was configured.
	 */
	private _initPlaceholder(): void {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const editingRoot = editingView.document.getRoot()!;
		const sourceElement = ( editor as Editor & ElementApi ).sourceElement;

		const placeholder = editor.config.get( 'placeholder' );

		if ( placeholder ) {
			const placeholderText = typeof placeholder === 'string' ? placeholder : placeholder[ editingRoot.rootName ];

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
