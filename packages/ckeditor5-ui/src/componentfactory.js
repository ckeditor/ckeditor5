/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/componentfactory
 */

import CKEditorError from 'ckeditor5-utils/src/ckeditorerror';

/**
 * Class implementing the UI component factory.
 *
 * Factories of specific UI components can be registered under their unique names. Registered
 * components can be later instantiated by providing the name of the component.
 *
 * The main use case for the component factory is the {@link module:core/editor/editorui~EditorUI#componentFactory} factory.
 */
export default class ComponentFactory {
	/**ś
	 * Creates ComponentFactory instance.
	 *
	 * @constructor
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 */
	constructor( editor ) {
		/**
		 * The editor instance.
		 *
		 * @readonly
		 * @member {module:core/editor/editor~Editor}
		 */
		this.editor = editor;

		/**
		 * Registered component factories.
		 *
		 * @private
		 * @member {Map}
		 */
		this._components = new Map();
	}

	/**
	 * Registers a component factory.
	 *
	 * @param {String} name The name of the component.
	 * @param {Function} ControllerClass The component controller constructor.
	 * @param {Function} ViewClass The component view constructor.
	 * @param {Function} [callback] The callback to process the view instance,
	 * i.e. to set attribute values, create attribute bindings, etc.
	 */
	add( name, callback ) {
		if ( this._components.get( name ) ) {
			throw new CKEditorError(
				'componentfactory-item-exists: The item already exists in the component factory.', { name }
			);
		}

		this._components.set( name, callback );
	}

	/**
	 * Creates a component view instance.
	 *
	 * @param {String} name The name of the component.
	 * @returns {module:ui/view~View} The instantiated component view.
	 */
	create( name ) {
		return this._components.get( name )( this.editor.locale );
	}
}
