/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import CKEditorError from '../utils/ckeditorerror.js';

/**
 * Class implementing the UI component factory.
 *
 * Factories of specific UI components can be registered under their unique names. Registered
 * components can be later instantiated by providing the name of the component.
 *
 * The main use case for the component factory is the {@link ui.editorUI.EditorUI#componentFactory} factory.
 *
 * @memberOf ui
 */
export default class ComponentFactory {
	/**
	 * Creates ComponentFactory instance.
	 *
	 * @constructor
	 * @param {core.editor.Editor} editor The editor instance.
	 */
	constructor( editor ) {
		/**
		 * The editor instance.
		 *
		 * @readonly
		 * @member {core.editor.Editor} ui.ComponentFactory#editor
		 */
		this.editor = editor;

		/**
		 * Registered component factories.
		 *
		 * @private
		 * @member {Map} ui.ComponentFactory#_components
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
	 * @returns {ui.View} The instantiated component view.
	 */
	create( name ) {
		return this._components.get( name )( this.editor.locale );
	}
}
