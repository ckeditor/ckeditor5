/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-inline/inlineeditorui
 */

import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui';
import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';
import normalizeToolbarConfig from '@ckeditor/ckeditor5-ui/src/toolbar/normalizetoolbarconfig';
import { enablePlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder';

/**
 * The inline editor UI class.
 *
 * @extends module:core/editor/editorui~EditorUI
 */
export default class InlineEditorUI extends EditorUI {
	/**
	 * Creates an instance of the inline editor UI class.
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

		/**
		 * A normalized `config.toolbar` object.
		 *
		 * @type {Object}
		 * @private
		 */
		this._toolbarConfig = normalizeToolbarConfig( editor.config.get( 'toolbar' ) );
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
		const editingView = editor.editing.view;
		const editable = view.editable;
		const editingRoot = editingView.document.getRoot();

		// The editable UI and editing root should share the same name. Then name is used
		// to recognize the particular editable, for instance in ARIA attributes.
		editable.name = editingRoot.rootName;

		view.render();

		// The editable UI element in DOM is available for sure only after the editor UI view has been rendered.
		// But it can be available earlier if a DOM element has been passed to InlineEditor.create().
		const editableElement = editable.element;

		// Register the editable UI view in the editor. A single editor instance can aggregate multiple
		// editable areas (roots) but the inline editor has only one.
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
		editable.bind( 'isFocused' ).to( this.focusTracker );

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
		const editableElement = view.editable.element;
		const editingView = editor.editing.view;
		const toolbar = view.toolbar;

		// Set–up the view#panel.
		view.panel.bind( 'isVisible' ).to( this.focusTracker, 'isFocused' );

		if ( this._toolbarConfig.viewportTopOffset ) {
			view.viewportTopOffset = this._toolbarConfig.viewportTopOffset;
		}

		// https://github.com/ckeditor/ckeditor5-editor-inline/issues/4
		view.listenTo( editor.ui, 'update', () => {
			// Don't pin if the panel is not already visible. It prevents the panel
			// showing up when there's no focus in the UI.
			if ( view.panel.isVisible ) {
				view.panel.pin( {
					target: editableElement,
					positions: view.panelPositions
				} );
			}
		} );

		toolbar.fillFromConfig( this._toolbarConfig.items, this.componentFactory );

		enableToolbarKeyboardFocus( {
			origin: editingView,
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
				isDirectHost: false
			} );
		}
	}
}
