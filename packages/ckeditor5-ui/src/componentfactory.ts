/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/componentfactory
 */

import { CKEditorError, type Locale } from '@ckeditor/ckeditor5-utils';
import type { Editor } from '@ckeditor/ckeditor5-core';

import type View from './view';

/**
 * A helper class implementing the UI component ({@link module:ui/view~View view}) factory.
 *
 * It allows functions producing specific UI components to be registered under their unique names
 * in the factory. A registered component can be then instantiated by providing its name.
 * Note that the names are case insensitive.
 *
 * ```ts
 * // The editor provides localization tools for the factory.
 * const factory = new ComponentFactory( editor );
 *
 * factory.add( 'foo', locale => new FooView( locale ) );
 * factory.add( 'bar', locale => new BarView( locale ) );
 *
 * // An instance of FooView.
 * const fooInstance = factory.create( 'foo' );
 *
 * // Names are case insensitive so this is also allowed:
 * const barInstance = factory.create( 'Bar' );
 * ```
 *
 * The {@link module:core/editor/editor~Editor#locale editor locale} is passed to the factory
 * function when {@link module:ui/componentfactory~ComponentFactory#create} is called.
 */
export default class ComponentFactory {
	/**
	 * The editor instance that the factory belongs to.
	 */
	public readonly editor: Editor;

	/**
	 * Registered component factories.
	 */
	private readonly _components = new Map<string, { originalName: string; callback: ( locale: Locale ) => View }>();

	/**
	 * Creates an instance of the factory.
	 *
	 * @param editor The editor instance.
	 */
	constructor( editor: Editor ) {
		this.editor = editor;
	}

	/**
	 * Returns an iterator of registered component names. Names are returned in lower case.
	 */
	public* names(): IterableIterator<string> {
		for ( const value of this._components.values() ) {
			yield value.originalName;
		}
	}

	/**
	 * Registers a component factory function that will be used by the
	 * {@link #create create} method and called with the
	 * {@link module:core/editor/editor~Editor#locale editor locale} as an argument,
	 * allowing localization of the {@link module:ui/view~View view}.
	 *
	 * @param name The name of the component.
	 * @param callback The callback that returns the component.
	 */
	public add( name: string, callback: ( locale: Locale ) => View ): void {
		this._components.set( getNormalized( name ), { callback, originalName: name } );
	}

	/**
	 * Creates an instance of a component registered in the factory under a specific name.
	 *
	 * When called, the {@link module:core/editor/editor~Editor#locale editor locale} is passed to
	 * the previously {@link #add added} factory function, allowing localization of the
	 * {@link module:ui/view~View view}.
	 *
	 * @param name The name of the component.
	 * @returns The instantiated component view.
	 */
	public create( name: string ): View {
		if ( !this.has( name ) ) {
			/**
			 * The required component is not registered in the component factory. Please make sure
			 * the provided name is correct and the component has been correctly
			 * {@link module:ui/componentfactory~ComponentFactory#add added} to the factory.
			 *
			 * @error componentfactory-item-missing
			 * @param name The name of the missing component.
			 */
			throw new CKEditorError(
				'componentfactory-item-missing',
				this,
				{ name }
			);
		}

		return this._components.get( getNormalized( name ) )!.callback( this.editor.locale );
	}

	/**
	 * Checks if a component of a given name is registered in the factory.
	 *
	 * @param name The name of the component.
	 */
	public has( name: string ): boolean {
		return this._components.has( getNormalized( name ) );
	}
}

/**
 * Ensures that the component name used as the key in the internal map is in lower case.
 */
function getNormalized( name: unknown ) {
	return String( name ).toLowerCase();
}
