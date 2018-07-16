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
	 * @param {module:ui/editorui/editoruiview~EditorUIView} view The view of the UI.
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
		 * The main (top–most) view of the editor UI.
		 *
		 * @readonly
		 * @member {module:ui/editorui/editoruiview~EditorUIView} #view
		 */
		this.view = view;

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

		// Informs UI components that should be refreshed after layout change.
		this.listenTo( editor.editing.view.document, 'layoutChanged', () => this.update() );
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
		this.view.destroy();
	}

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
