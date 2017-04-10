/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-inline/inlineeditorui
 */

import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';

/**
 * The inline editor UI class.
 *
 * @implements module:core/editor/editorui~EditorUI
 */
export default class InlineEditorUI {
	/**
	 * Creates an instance of the editor UI class.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {module:ui/editorui/editoruiview~EditorUIView} view View of the ui.
	 */
	constructor( editor, view ) {
		/**
		 * @inheritDoc
		 */
		this.editor = editor;

		/**
		 * @inheritDoc
		 */
		this.view = view;

		/**
		 * @inheritDoc
		 */
		this.componentFactory = new ComponentFactory( editor );

		/**
		 * @inheritDoc
		 */
		this.focusTracker = new FocusTracker();

		// Set–up the view#panel.
		const { nw, sw, ne, se } = InlineEditorUI.defaultPositions;
		const panelOptions = {
			target: view.editableElement,
			positions: [ nw, sw, ne, se ]
		};

		view.panel.bind( 'isVisible' ).to( this.focusTracker, 'isFocused' );

		// https://github.com/ckeditor/ckeditor5-editor-inline/issues/4
		view.listenTo( editor.editing.view, 'render', () => {
			view.panel.pin( panelOptions );
		} );

		// Setup the editable.
		const editingRoot = editor.editing.createRoot( view.editableElement );
		view.editable.bind( 'isReadOnly' ).to( editingRoot );

		// Bind to focusTracker instead of editor.editing.view because otherwise
		// focused editable styles disappear when view#toolbar is focused.
		view.editable.bind( 'isFocused' ).to( this.focusTracker );
		view.editable.name = editingRoot.rootName;

		this.focusTracker.add( view.editableElement );
	}

	/**
	 * Initializes the UI.
	 *
	 * @returns {Promise} A Promise resolved when the initialization process is finished.
	 */
	init() {
		const editor = this.editor;

		return this.view.init()
			.then( () => {
				return this.view.toolbar.fillFromConfig( editor.config.get( 'toolbar' ), this.componentFactory );
			} )
			.then( () => {
				enableToolbarKeyboardFocus( {
					origin: editor.editing.view,
					originFocusTracker: this.focusTracker,
					originKeystrokeHandler: editor.keystrokes,
					toolbar: this.view.toolbar
				} );
			} );
	}

	/**
	 * Destroys the UI.
	 *
	 * @returns {Promise} A Promise resolved when the destruction process is finished.
	 */
	destroy() {
		return this.view.destroy();
	}
}

/**
 * A default set of positioning functions used by the toolbar to float around
 * {@link module:editor-inline/inlineeditoruiview~InlineEditorUIView#editableElement}.
 *
 * The available positioning functions are as follows:
 *
 * * South east:
 *
 *		+------------------+
 *		| #editableElement |
 *		+------------------+
 *		           [ Panel ]
 *
 * * South west:
 *
 *		+------------------+
 *		| #editableElement |
 *		+------------------+
 *		[ Panel ]
 *
 * * North east:
 *
 *		           [ Panel ]
 *		+------------------+
 *		| #editableElement |
 *		+------------------+
 *
 *
 * * North west:
 *
 *		[ Panel ]
 *		+------------------+
 *		| #editableElement |
 *		+------------------+
 *
 * Positioning functions must be compatible with {@link module:utils/dom/position~Position}.
 *
 * @member {Object} module:editor-inline/inlineeditorui~InlineEditorUI.defaultPositions
 */
InlineEditorUI.defaultPositions = {
	nw: ( targetRect, panelRect ) => ( {
		top: targetRect.top - panelRect.height,
		left: targetRect.left,
		name: 'toolbar_nw'
	} ),

	sw: ( targetRect ) => ( {
		top: targetRect.bottom,
		left: targetRect.left,
		name: 'toolbar_sw'
	} ),

	ne: ( targetRect, panelRect ) => ( {
		top: targetRect.top - panelRect.height,
		left: targetRect.left + targetRect.width - panelRect.width,
		name: 'toolbar_ne'
	} ),

	se: ( targetRect, panelRect ) => ( {
		top: targetRect.bottom,
		left: targetRect.left + targetRect.width - panelRect.width,
		name: 'toolbar_se'
	} )
};
