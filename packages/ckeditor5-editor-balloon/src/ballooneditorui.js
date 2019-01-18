/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-balloon/ballooneditorui
 */

import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui';
import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';
import { attachPlaceholder, getPlaceholderElement } from '@ckeditor/ckeditor5-engine/src/view/placeholder';

/**
 * The balloon editor UI class.
 *
 * @extends module:core/editor/editorui~EditorUI
 */
export default class BalloonEditorUI extends EditorUI {
	/**
	 * Creates an instance of the balloon editor UI class.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {module:ui/editorui/editoruiview~EditorUIView} view The view of the UI.
	 */
	constructor( editor, view ) {
		super( editor );

		/**
		 * The main (top–most) view of the editor UI.
		 *
		 * @private
		 * @member {module:ui/editorui/editoruiview~EditorUIView} #_view
		 */
		this._view = view;
	}

	/**
	 * The main (top–most) view of the editor UI.
	 *
	 * @readonly
	 * @member {module:ui/editorui/editoruiview~EditorUIView} #view
	 */
	get view() {
		return this._view;
	}

	/**
	 * @inheritDoc
	 */
	get element() {
		return this.view.editable.element;
	}

	/**
	 * Initializes the UI.
	 */
	init() {
		const editor = this.editor;
		const view = this.view;
		const balloonToolbar = editor.plugins.get( 'BalloonToolbar' );
		const editingView = editor.editing.view;
		const editable = view.editable;
		const editingRoot = editingView.document.getRoot();

		view.render();

		// The editable UI element in DOM is available for sure only after the editor UI view has been rendered.
		// But it can be available earlier if a DOM element has been passed to BalloonEditor.create().
		const editableElement = editable.editableElement;

		// Register the editable UI view in the editor. A single editor instance can aggregate multiple
		// editable areas (roots) but the balloon editor has only one.
		this._editableElements.push( view.editable );

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

		// The editable UI and editing root should share the same name. Then name is used
		// to recognize the particular editable, for instance in ARIA attributes.
		view.editable.name = editingRoot.rootName;

		// Bind the editable UI element to the editing view, making it an end– and entry–point
		// of the editor's engine. This is where the engine meets the UI.
		editingView.attachDomRoot( editableElement );

		// The UI must wait until the data is ready to attach certain actions that operate
		// on the editing view–level. They use the view writer to set attributes on the editable
		// element and doing so before data is loaded into the model (ready) would destroy the
		// original content.
		editor.on( 'dataReady', () => {
			view.editable.enableDomRootActions();
			attachPlaceholder( editingView, getPlaceholderElement( editingRoot ), 'Type some text...' );
		} );

		enableToolbarKeyboardFocus( {
			origin: editingView,
			originFocusTracker: this.focusTracker,
			originKeystrokeHandler: editor.keystrokes,
			toolbar: balloonToolbar.toolbarView,
			beforeFocus() {
				balloonToolbar.show();
			},
			afterBlur() {
				balloonToolbar.hide();
			}
		} );

		this.ready();
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this.view.editable.disableDomRootActions();
		this.editor.editing.view.detachDomRoots();

		super.destroy();
	}
}
