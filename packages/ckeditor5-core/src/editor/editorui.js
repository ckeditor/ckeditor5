/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/editor/editorui
 */

/* globals console */

import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

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
	 */
	constructor( editor ) {
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
		 * Stores viewport offsets from every direction.
		 *
		 * Viewport offset can be used to constrain balloons or other UI elements into an element smaller than the viewport.
		 * This can be useful if there are any other absolutely positioned elements that may interfere with editor UI.
		 *
		 * Example `editor.ui.viewportOffset` returns:
		 *
		 * ```js
		 * {
		 * 	top: 50,
		 * 	right: 50,
		 * 	bottom: 50,
		 * 	left: 50
		 * }
		 * ```
		 *
		 * This property can be overriden after editor already being initialized:
		 *
		 * ```js
		 * editor.ui.viewportOffset = {
		 * 	top: 100,
		 * 	right: 0,
		 * 	bottom: 0,
		 * 	left: 0
		 * };
		 * ```
		 *
		 * @observable
		 * @member {Object} #viewportOffset
		 */
		this.set( 'viewportOffset', this._readViewportOffsetFromConfig() );

		/**
		 * Stores all editable elements used by the editor instance.
		 *
		 * @private
		 * @member {Map.<String,HTMLElement>}
		 */
		this._editableElementsMap = new Map();

		// Informs UI components that should be refreshed after layout change.
		this.listenTo( editor.editing.view.document, 'layoutChanged', () => this.update() );
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

		this.focusTracker.destroy();

		// Clean–up the references to the CKEditor instance stored in the native editable DOM elements.
		for ( const domElement of this._editableElementsMap.values() ) {
			domElement.ckeditorInstance = null;
		}

		this._editableElementsMap = new Map();
	}

	/**
	 * Store the native DOM editable element used by the editor under
	 * a unique name.
	 *
	 * @param {String} rootName The unique name of the editable element.
	 * @param {HTMLElement} domElement The native DOM editable element.
	 */
	setEditableElement( rootName, domElement ) {
		this._editableElementsMap.set( rootName, domElement );

		// Put a reference to the CKEditor instance in the editable native DOM element.
		// It helps 3rd–party software (browser extensions, other libraries) access and recognize
		// CKEditor 5 instances (editing roots) and use their API (there is no global editor
		// instance registry).
		if ( !domElement.ckeditorInstance ) {
			domElement.ckeditorInstance = this.editor;
		}
	}

	/**
	 * Returns the editable editor element with the given name or null if editable does not exist.
	 *
	 * @param {String} [rootName=main] The editable name.
	 * @returns {HTMLElement|undefined}
	 */
	getEditableElement( rootName = 'main' ) {
		return this._editableElementsMap.get( rootName );
	}

	/**
	 * Returns array of names of all editor editable elements.
	 *
	 * @returns {Iterable.<String>}
	 */
	getEditableElementsNames() {
		return this._editableElementsMap.keys();
	}

	/**
	 * Stores all editable elements used by the editor instance.
	 *
	 * @protected
	 * @deprecated
	 * @member {Map.<String,HTMLElement>}
	 */
	get _editableElements() {
		/**
		 * The {@link module:core/editor/editorui~EditorUI#_editableElements `EditorUI#_editableElements`} property has been
		 * deprecated and will be removed in the near future. Please use {@link #setEditableElement `setEditableElement()`} and
		 * {@link #getEditableElement `getEditableElement()`} methods instead.
		 *
		 * @error editor-ui-deprecated-editable-elements
		 * @param {module:core/editor/editorui~EditorUI} editorUI Editor UI instance the deprecated property belongs to.
		 */
		console.warn(
			'editor-ui-deprecated-editable-elements: ' +
			'The EditorUI#_editableElements property has been deprecated and will be removed in the near future.',
			{ editorUI: this } );

		return this._editableElementsMap;
	}

	/**
	 * Returns viewport offsets object:
	 *
	 * ```js
	 * {
	 * 	top: Number,
	 * 	right: Number,
	 * 	bottom: Number,
	 * 	left: Number
	 * }
	 * ```
	 *
	 * Only top property is currently supported.
	 *
	 * @private
	 * @return {Object}
	 */
	_readViewportOffsetFromConfig() {
		const editor = this.editor;
		const viewportOffsetConfig = editor.config.get( 'ui.viewportOffset' );

		if ( viewportOffsetConfig ) {
			return viewportOffsetConfig;
		}

		const legacyOffsetConfig = editor.config.get( 'toolbar.viewportTopOffset' );

		// Fall back to deprecated toolbar config.
		if ( legacyOffsetConfig ) {
			/**
			 * The {@link module:core/editor/editorconfig~EditorConfig#toolbar `EditorConfig#toolbar.viewportTopOffset`}
			 * property has been deprecated and will be removed in the near future. Please use
			 * {@link module:core/editor/editorconfig~EditorConfig#ui `EditorConfig#ui.viewportOffset`} instead.
			 *
			 * @error editor-ui-deprecated-viewport-offset-config
			 */
			console.warn(
				'editor-ui-deprecated-viewport-offset-config: ' +
				'The `toolbar.vieportTopOffset` configuration option is deprecated. ' +
				'It will be removed from future CKEditor versions. Use `ui.viewportOffset.top` instead.'
			);

			return { top: legacyOffsetConfig };
		}

		// More keys to come in the future.
		return { top: 0 };
	}

	/**
	 * Fired when the editor UI is ready.
	 *
	 * Fired before {@link module:engine/controller/datacontroller~DataController#event:ready}.
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

mix( EditorUI, ObservableMixin );
