/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-decoupled/decouplededitorui
 */

import { EditorUI } from 'ckeditor5/src/core';
import { enableToolbarKeyboardFocus } from 'ckeditor5/src/ui';
import { enablePlaceholder } from 'ckeditor5/src/engine';

/**
 * The decoupled editor UI class.
 *
 * @extends module:core/editor/editorui~EditorUI
 */
export default class DecoupledEditorUI extends EditorUI {
	/**
	 * Creates an instance of the decoupled editor UI class.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {module:ui/editorui/editoruiview~EditorUIView} view The view of the UI.
	 */
	constructor( editor, view ) {
		super( editor );

		/**
		 * The main (top–most) view of the editor UI.
		 *
		 * @readonly
		 * @member {module:ui/editorui/editoruiview~EditorUIView} #view
		 */
		this.view = view;
	}

	/**
	 * Initializes the UI.
	 */
	init() {
		const editor = this.editor;
		const view = this.view;
		const editingView = editor.editing.view;
		const editable = view.editable;
		const editingRoot = editingView.document.getRoot();

		// The editable UI and editing root should share the same name. Then name is used
		// to recognize the particular editable, for instance in ARIA attributes.
		view.editable.name = editingRoot.rootName;

		view.render();

		// The editable UI element in DOM is available for sure only after the editor UI view has been rendered.
		// But it can be available earlier if a DOM element has been passed to DecoupledEditor.create().
		const editableElement = editable.element;

		// Register the editable UI view in the editor. A single editor instance can aggregate multiple
		// editable areas (roots) but the decoupled editor has only one.
		this.setEditableElement( editable.name, editableElement );

		// Let the global focus tracker know that the editable UI element is focusable and
		// belongs to the editor. From now on, the focus tracker will sustain the editor focus
		// as long as the editable is focused (e.g. the user is typing).
		this.focusTracker.add( editableElement );

		// Let the editable UI element respond to the changes in the global editor focus
		// tracker. It has been added to the same tracker a few lines above but, in reality, there are
		// many focusable areas in the editor, like balloons, toolbars or dropdowns and as long
		// as they have focus, the editable should act like it is focused too (although technically
		// it isn't), e.g. by setting the proper CSS class, visually announcing focus to the user.
		// Doing otherwise will result in editable focus styles disappearing, once e.g. the
		// toolbar gets focused.
		view.editable.bind( 'isFocused' ).to( this.focusTracker );

		// Bind the editable UI element to the editing view, making it an end– and entry–point
		// of the editor's engine. This is where the engine meets the UI.
		editingView.attachDomRoot( editableElement );

		this._initPlaceholder();
		this._initToolbar();
		this.fire( 'ready' );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		const view = this.view;
		const editingView = this.editor.editing.view;

		editingView.detachDomRoot( view.editable.name );
		view.destroy();

		super.destroy();
	}

	/**
	 * Initializes the inline editor toolbar and its panel.
	 *
	 * @private
	 */
	_initToolbar() {
		const editor = this.editor;
		const view = this.view;
		const toolbar = view.toolbar;

		toolbar.fillFromConfig( editor.config.get( 'toolbar' ), this.componentFactory );

		enableToolbarKeyboardFocus( {
			origin: editor.editing.view,
			originFocusTracker: this.focusTracker,
			originKeystrokeHandler: editor.keystrokes,
			toolbar
		} );
	}

	/**
	 * Enable the placeholder text on the editing root, if any was configured.
	 *
	 * @private
	 */
	_initPlaceholder() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const editingRoot = editingView.document.getRoot();
		const sourceElement = editor.sourceElement;

		const placeholderText = editor.config.get( 'placeholder' ) ||
			sourceElement && sourceElement.tagName.toLowerCase() === 'textarea' && sourceElement.getAttribute( 'placeholder' );

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
