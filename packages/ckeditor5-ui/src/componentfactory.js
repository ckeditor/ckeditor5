/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/componentfactory
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * A helper class implementing the UI component ({@link module:ui/view~View view}) factory.
 *
 * It allows functions producing specific UI components to be registered under their unique names
 * in the factory. A registered component can be then instantiated by providing its name.
 *
 *		// Editor provides localization tools for the factory.
 *		const factory = new ComponentFactory( editor );
 *
 *		factory.add( 'foo', locale => new FooView( locale ) );
 *		factory.add( 'bar', locale => new BarView( locale ) );
 *
 *		// An instance of FooView.
 *		const fooInstance = factory.create( 'foo' );
 *
 * The {@link module:core/editor/editor~Editor#locale editor locale} is passed to the factory
 * function when {@link module:ui/componentfactory~ComponentFactory#create} is called.
 */
export default class ComponentFactory {
	/**
	 * Creates an instance of the factory.
	 *
	 * @constructor
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 */
	constructor( editor ) {
		/**
		 * The editor instance the factory belongs to.
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
	 * Returns an iterator of registered component names.
	 *
	 * @returns {Iterator.<String>}
	 */
	* names() {
		yield* this._components.keys();
	}

	/**
	 * Registers a component factory function that will be used by the
	 * {@link #create create} method and called with the
	 * {@link module:core/editor/editor~Editor#locale editor locale} as an argument,
	 * allowing localization of the {@link module:ui/view~View view}.
	 *
	 * @param {String} name The name of the component.
	 * @param {Function} callback The callback that returns the component.
	 */
	add( name, callback ) {
		if ( this.has( name ) ) {
			/**
			 * The item already exists in the component factory.
			 *
			 * @error componentfactory-item-exists
			 * @param {String} name The name of the component.
			 */
			throw new CKEditorError(
				'componentfactory-item-exists: The item already exists in the component factory.', { name }
			);
		}

		this._components.set( name, callback );
	}

	/**
	 * Creates an instance of a component registered in the factory under a specific name.
	 *
	 * When called, the {@link module:core/editor/editor~Editor#locale editor locale} is passed to
	 * the previously {@link #add added} factory function, allowing localization of the
	 * {@link module:ui/view~View view}.
	 *
	 * @param {String} name The name of the component.
	 * @returns {module:ui/view~View} The instantiated component view.
	 */
	create( name ) {
		if ( !this.has( name ) ) {
			/**
			 * The required component is not registered in the component factory. Please make sure
			 * the provided name is correct and the component has been correctly
			 * {@link #add added} to the factory.
			 *
			 * @error componentfactory-item-missing
			 * @param {String} name The name of the missing component.
			 */
			throw new CKEditorError(
				'componentfactory-item-missing: The required component is not registered in the factory.', { name }
			);
		}

		return this._components.get( name )( this.editor.locale );
	}

	/**
	 * Checks if a component of a given name is registered in the factory.
	 *
	 * @param {String} name The name of the component.
	 * @returns {Boolean}
	 */
	has( name ) {
		return this._components.has( name );
	}
}
