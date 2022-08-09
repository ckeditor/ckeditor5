/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-classic/classiceditorui
 */

import { EditorUI } from 'ckeditor5/src/core';
import { normalizeToolbarConfig } from 'ckeditor5/src/ui';
import { enablePlaceholder } from 'ckeditor5/src/engine';
import { ElementReplacer } from 'ckeditor5/src/utils';

/**
 * The classic editor UI class.
 *
 * @extends module:core/editor/editorui~EditorUI
 */
export default class ClassicEditorUI extends EditorUI {
	/**
	 * Creates an instance of the classic editor UI class.
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
		 * @private
		 * @member {Object}
		 */
		this._toolbarConfig = normalizeToolbarConfig( editor.config.get( 'toolbar' ) );

		/**
		 * The element replacer instance used to hide the editor's source element.
		 *
		 * @protected
		 * @member {module:utils/elementreplacer~ElementReplacer}
		 */
		this._elementReplacer = new ElementReplacer();
	}

	/**
	 * @inheritDoc
	 */
	get element() {
		return this.view.element;
	}

	/**
	 * Initializes the UI.
	 *
	 * @param {HTMLElement|null} replacementElement The DOM element that will be the source for the created editor.
	 */
	init( replacementElement ) {
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
		// But it can be available earlier if a DOM element has been passed to BalloonEditor.create().
		const editableElement = editable.element;

		// Register the editable UI view in the editor. A single editor instance can aggregate multiple
		// editable areas (roots) but the classic editor has only one.
		this.setEditableElement( editable.name, editableElement );

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

		// If an element containing the initial data of the editor was provided, replace it with
		// an editor instance's UI in DOM until the editor is destroyed. For instance, a <textarea>
		// can be such element.
		if ( replacementElement ) {
			this._elementReplacer.replace( replacementElement, this.element );
		}

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

		this._elementReplacer.restore();
		editingView.detachDomRoot( view.editable.name );
		view.destroy();

		super.destroy();
	}

	/**
	 * Initializes the editor toolbar.
	 *
	 * @private
	 */
	_initToolbar() {
		const view = this.view;

		// Set–up the sticky panel with toolbar.
		view.stickyPanel.bind( 'isActive' ).to( this.focusTracker, 'isFocused' );
		view.stickyPanel.limiterElement = view.element;
		view.stickyPanel.bind( 'viewportTopOffset' ).to( this, 'viewportOffset', ( { top } ) => top );

		view.toolbar.fillFromConfig( this._toolbarConfig, this.componentFactory );

		// Register the toolbar so it becomes available for Alt+F10 and Esc navigation.
		this.addToolbar( view.toolbar );
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

