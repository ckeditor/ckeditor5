/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEditorError from '../ckeditorerror.js';

/**
 * @class core.ui.ComponentRepository
 */

export default class ComponentRepository {
	constructor( editor ) {
		/**
		 * @readonly
		 * @type {core.Editor}
		 */
		this.editor = editor;

		this._components = new Map();
	}

	add( name, ControllerClass, ViewClass, model ) {
		if ( this._components.get( name ) ) {
			throw new CKEditorError(
				'componentrepository-item-exists: The item already exists in the component registry', { name }
			);
		}

		this._components.set( name, {
			ControllerClass,
			ViewClass,
			model
		} );
	}

	create( name ) {
		const component = this._components.get( name );

		const model = component.model;
		const view = new component.ViewClass( model );
		const controller = new component.ControllerClass( this.editor, model, view );

		return controller;
	}
}
