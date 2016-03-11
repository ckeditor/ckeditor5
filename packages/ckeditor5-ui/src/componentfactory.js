/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEditorError from '../utils/ckeditorerror.js';

/**
 * Class implementing the UI component factory.
 *
 * Factories of specific UI components can be registered under their unique names. Registered
 * components can be later instantiated by providing the name of the component. The model is shared between all
 * instances of that component and has to be provided upon registering its factory.
 *
 * The main use case for the component factory is the {@link core.editorUI.EditorUI#featureComponents} factory.
 *
 * @memberOf ui
 */

export default class ComponentFactory {
	/**
	 * Creates ComponentFactory instance.
	 *
	 * @constructor
	 * @param {core.Editor} editor The editor instance.
	 */
	constructor( editor ) {
		/**
		 * @readonly
		 * @member {core.Editor} ui.ComponentFactory#editor
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
	 * @param {ui.Model} model The model of the component.
	 */
	add( name, ControllerClass, ViewClass, model ) {
		if ( this._components.get( name ) ) {
			throw new CKEditorError(
				'componentfactory-item-exists: The item already exists in the component factory.', { name }
			);
		}

		this._components.set( name, {
			ControllerClass,
			ViewClass,
			model
		} );
	}

	/**
	 * Creates a component instance.
	 *
	 * @param {String} name The name of the component.
	 * @returns {ui.Controller} The instantiated component.
	 */
	create( name ) {
		const component = this._components.get( name );

		const model = component.model;
		const view = new component.ViewClass( model, this.editor.locale );
		const controller = new component.ControllerClass( model, view, this.editor );

		return controller;
	}
}
