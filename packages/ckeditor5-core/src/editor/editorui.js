/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/editor/editorui
 */

import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import log from '@ckeditor/ckeditor5-utils/src/log';

/**
 * A class providing the minimal interface that is required to successfully bootstrap any editor UI.
 *
 * @mixes module:utils/emittermixin~EmitterMixin
 */
export default class EditorUI {
	/**
	 * Creates an instance of the editor UI class.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {module:ui/editorui/editoruiview~EditorUIView} [view] The view of the UI. This parameter is **deprecated**
	 * since `v12.0.0` and should not be used.
	 */
	constructor( editor, view ) {
		/**
		 * The editor that the UI belongs to.
		 *
		 * @readonly
		 * @member {module:core/editor/editor~Editor} #editor
		 */
		this.editor = editor;

		/**
		 * An instance of the {@link module:ui/componentfactory~ComponentFactory}, a registry used by plugins
		 * to register factories of specific UI components.
		 *
		 * @readonly
		 * @member {module:ui/componentfactory~ComponentFactory} #componentFactory
		 */
		this.componentFactory = new ComponentFactory( editor );

		/**
		 * Stores the information about the editor UI focus and propagates it so various plugins and components
		 * are unified as a focus group.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker} #focusTracker
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * Stores all editable elements used by the editor instance.
		 *
		 * @protected
		 * @member {Map.<String,HTMLElement>}
		 */
		this._editableElements = new Map();

		/**
		 * The main (top–most) view of the editor UI.
		 *
		 * @private
		 * @member {module:ui/editorui/editoruiview~EditorUIView} #_view
		 */
		this._view = view; // This property was created in order to deprecate `this.view`. Should be removed with removal of `view` getter.

		// Check if `view` parameter was passed. It is deprecated and should not be used.
		if ( view ) {
			/**
			 * This error is thrown when  the deprecated `view` parameter is passed to the
			 * {@link module:core/editor/editorui~EditorUI#constructor EditorUI constructor}. Only subclass (for example
			 * {@link module:editor-classic/classiceditorui~ClassicEditorUI}) should use it without passing it further.
			 *
			 * @error deprecated-editorui-view-param-in-constructor
			 */
			log.warn( 'deprecated-editorui-view-param-in-constructor: The EditorUI#constructor `view` parameter is deprecated.' );
		}

		// Informs UI components that should be refreshed after layout change.
		this.listenTo( editor.editing.view.document, 'layoutChanged', () => this.update() );

		// Delegate `ready` as `editor.uiReady` event. The `uiReady` is deprecated and should be fired too.
		this.delegate( 'ready' ).to( this.editor, 'uiReady' );
	}

	/**
	 * **Deprecated** since `v12.0.0`. This property is deprecated and should not be used. Use the property
	 * from the subclass directly instead, for example
	 * {@link module:editor-classic/classiceditorui~ClassicEditorUI#view ClassicEditorUI#view}.
	 *
	 * The main (top–most) view of the editor UI.
	 *
	 * @deprecated v12.0.0 This property is deprecated and should not be used. Use the property
	 * from the subclass directly instead, for example
	 * {@link module:editor-classic/classiceditorui~ClassicEditorUI#view ClassicEditorUI#view}.
	 * @readonly
	 * @member {module:ui/editorui/editoruiview~EditorUIView} #view
	 */
	get view() {
		/**
		 * This error is thrown when a component tries to access deprecated
		 * {@link module:core/editor/editorui~EditorUI#element `EditorUI view`} property. Instead the `view` property
		 * from the subclass (for example {@link module:editor-classic/classiceditorui~ClassicEditorUI#view ClassicEditorUI#view})
		 * should be accessed directly.
		 *
		 * @error deprecated-editorui-view
		 */
		log.warn( 'deprecated-editorui-view: The EditorUI#view property is deprecated.' );

		return this._view;
	}

	/**
	 * The main (outermost) DOM element of the editor UI.
	 *
	 * For example, in {@link module:editor-classic/classiceditor~ClassicEditor} it is a `<div>` which
	 * wraps the editable element and the toolbar. In {@link module:editor-inline/inlineeditor~InlineEditor}
	 * it is the editable element itself (as there is no other wrapper). However, in
	 * {@link module:editor-decoupled/decouplededitor~DecoupledEditor} it is set to `null` because this editor does not
	 * come with a single "main" HTML element (its editable element and toolbar are separate).
	 *
	 * This property can be understood as a shorthand for retrieving the element that a specific editor integration
	 * considers to be its main DOM element.
	 *
	 * @readonly
	 * @member {HTMLElement|null} #element
	 */
	get element() {
		return null;
	}

	/**
	 * Fires the {@link module:core/editor/editorui~EditorUI#event:update `update`} event.
	 *
	 * This method should be called when the editor UI (e.g. positions of its balloons) needs to be updated due to
	 * some environmental change which CKEditor 5 is not aware of (e.g. resize of a container in which it is used).
	 */
	update() {
		this.fire( 'update' );
	}

	/**
	 * Destroys the UI.
	 */
	destroy() {
		this.stopListening();

		this._editableElements = [];

		if ( this._view ) {
			this._view.destroy();
		}
	}

	/**
	 * Returns the editable editor element with the given name or null if editable does not exist.
	 *
	 * @param {String} [rootName=main] The editable name.
	 * @returns {HTMLElement|null}
	 */
	getEditableElement( rootName = 'main' ) {
		return this._editableElements.has( rootName ) ? this._editableElements.get( rootName ) : null;
	}

	/**
	 * Returns array of names of all editor editable elements.
	 *
	 * @returns {Iterable.<String>}
	 */
	getEditableElementsNames() {
		return this._editableElements.keys();
	}

	/**
	 * Fired when the editor UI is ready.
	 *
	 * Fired after {@link module:core/editor/editor~Editor#event:pluginsReady} and before
	 * {@link module:core/editor/editor~Editor#event:dataReady}.
	 *
	 * @event ready
	 */

	/**
	 * Fired whenever the UI (all related components) should be refreshed.
	 *
	 * **Note:**: The event is fired after each {@link module:engine/view/document~Document#event:layoutChanged}.
	 * It can also be fired manually via the {@link module:core/editor/editorui~EditorUI#update} method.
	 *
	 * @event update
	 */
}

mix( EditorUI, EmitterMixin );
