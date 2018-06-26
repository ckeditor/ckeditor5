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
import throttle from '@ckeditor/ckeditor5-utils/src/lib/lodash/throttle';

/**
 * Class providing the minimal interface that is required to successfully bootstrap any editor UI.
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
		 * Editor that the UI belongs to.
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
		 * Instance of the {@link module:ui/componentfactory~ComponentFactory}, a registry used by plugins
		 * to register factories of specific UI components.
		 *
		 * @readonly
		 * @member {module:ui/componentfactory~ComponentFactory} #componentFactory
		 */
		this.componentFactory = new ComponentFactory( editor );

		/**
		 * Keeps information about editor UI focus and propagates it among various plugins and components,
		 * unifying them in a uniform focus group.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker} #focusTracker
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * Fires throttled {@link module:core/editor/editorui~EditorUI#event:update} event.
		 *
		 * @protected
		 * @type {Function}
		 */
		this._throttledUpdate = throttle( () => this.fire( 'update' ), 50 );

		// Informs UI components that should be refreshed after layout change.
		this.listenTo( editor.editing.view.document, 'layoutChanged', () => this.update() );
	}

	/**
	 * Fires the UI update.
	 */
	update() {
		this._throttledUpdate();
	}

	/**
	 * Destroys the UI.
	 */
	destroy() {
		this.stopListening();
		this._throttledUpdate.cancel();
		this.view.destroy();
	}

	/**
	 * Fired whenever UI and all related components should be refreshed.
	 *
	 * It is fired after each {@link module:engine/view/document~Document#event:layoutChanged} event
	 * besides it can be fired manually through {@link module:core/editor/editorui~EditorUI#update} method.
	 *
	 * @event core/editor/editorui~EditorUI#event:update
	 */
}

mix( EditorUI, EmitterMixin );
