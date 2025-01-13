/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/config
 */

import { isPlainObject, isElement, cloneDeepWith } from 'es-toolkit/compat';

/**
 * Handles a configuration dictionary.
 *
 * @typeParam Cfg A type of the configuration dictionary.
 */
export default class Config<Cfg> {
	/**
	 * Store for the whole configuration.
	 */
	private readonly _config: Record<string, any>;

	/**
	 * Creates an instance of the {@link ~Config} class.
	 *
	 * @param configurations The initial configurations to be set. Usually, provided by the user.
	 * @param defaultConfigurations The default configurations. Usually, provided by the system.
	 */
	constructor( configurations?: Partial<Cfg>, defaultConfigurations?: Partial<Cfg> ) {
		this._config = Object.create( null );

		// Set default configuration.
		if ( defaultConfigurations ) {
			// Clone the configuration to make sure that the properties will not be shared
			// between editors and make the watchdog feature work correctly.
			this.define( cloneConfig( defaultConfigurations ) );
		}

		// Set initial configuration.
		if ( configurations ) {
			this._setObjectToTarget( this._config, configurations );
		}
	}

	/**
	 * Set configuration values.
	 *
	 * It also accepts setting a "deep configuration" by using dots in the name. For example, `'resize.width'` sets
	 * the value for the `width` configuration in the `resize` subset.
	 *
	 * ```ts
	 * config.set( 'resize.width', 500 );
	 * ```
	 *
	 * It accepts both a name/value pair or an object, which properties and values will be used to set
	 * configurations. See {@link #set:CONFIG_OBJECT}.
	 *
	 * @label KEY_VALUE
	 * @param name The configuration name. Configuration names are case-sensitive.
	 * @param value The configuration value.
	 */
	public set<K extends string>( name: K, value: GetSubConfig<Cfg, K> ): void;

	/**
	 * Set configuration values.
	 *
	 * It accepts an object, which properties and values will be used to set configurations.
	 *
	 * ```ts
	 * config.set( {
	 * 	width: 500
	 * 	toolbar: {
	 * 		collapsed: true
	 * 	}
	 * } );
	 *
	 * // Equivalent to:
	 * config.set( 'width', 500 );
	 * config.set( 'toolbar.collapsed', true );
	 * ```
	 *
	 * Passing an object as the value will amend the configuration, not replace it.
	 *
	 * ```ts
	 * config.set( 'toolbar', {
	 * 	collapsed: true,
	 * } );
	 *
	 * config.set( 'toolbar', {
	 * 	color: 'red',
	 * } );
	 *
	 * config.get( 'toolbar.collapsed' ); // true
	 * config.get( 'toolbar.color' ); // 'red'
	 * ```
	 *
	 * It accepts both a name/value pair or an object, which properties and values will be used to set
	 * configurations. See {@link #set:KEY_VALUE}.
	 *
	 * @label CONFIG_OBJECT
	 * @param config The configuration object from which take properties as
	 * configuration entries. Configuration names are case-sensitive.
	 */
	public set( config: Partial<Cfg> ): void;

	public set( name: string | Record<string, any>, value?: any ): void {
		this._setToTarget( this._config, name, value );
	}

	/**
	 * Does exactly the same as {@link #set:KEY_VALUE} with one exception – passed configuration extends
	 * existing one, but does not overwrite already defined values.
	 *
	 * This method is supposed to be called by plugin developers to setup plugin's configurations. It would be
	 * rarely used for other needs.
	 *
	 * @label KEY_VALUE
	 * @param name The configuration name. Configuration names are case-sensitive.
	 * @param value The configuration value.
	 */
	public define<K extends string>( name: K, value: GetSubConfig<Cfg, K> ): void;

	/**
	 * Does exactly the same as {@link #set:CONFIG_OBJECT} with one exception – passed configuration extends
	 * existing one, but does not overwrite already defined values.
	 *
	 * This method is supposed to be called by plugin developers to setup plugin's configurations. It would be
	 * rarely used for other needs.
	 *
	 * @label CONFIG_OBJECT
	 * @param config The configuration object from which take properties as
	 * configuration entries. Configuration names are case-sensitive.
	 */
	public define( config: Partial<Cfg> ): void;

	public define( name: string | Record<string, any>, value?: any ): void {
		const isDefine = true;

		this._setToTarget( this._config, name, value, isDefine );
	}

	/**
	 * Gets the value for a configuration entry.
	 *
	 * ```ts
	 * config.get( 'name' );
	 * ```
	 *
	 * Deep configurations can be retrieved by separating each part with a dot.
	 *
	 * ```ts
	 * config.get( 'toolbar.collapsed' );
	 * ```
	 *
	 * @param name The configuration name. Configuration names are case-sensitive.
	 * @returns The configuration value or `undefined` if the configuration entry was not found.
	 */
	public get<K extends string>( name: K ): GetSubConfig<Cfg, K> | undefined {
		return this._getFromSource( this._config, name );
	}

	/**
	 * Iterates over all top level configuration names.
	 */
	public* names(): Iterable<string> {
		for ( const name of Object.keys( this._config ) ) {
			yield name;
		}
	}

	/**
	 * Saves passed configuration to the specified target (nested object).
	 *
	 * @param target Nested config object.
	 * @param name The configuration name or an object from which take properties as
	 * configuration entries. Configuration names are case-sensitive.
	 * @param value The configuration value. Used if a name is passed.
	 * @param isDefine Define if passed configuration should overwrite existing one.
	 */
	private _setToTarget( target: any, name: any, value: any, isDefine: boolean = false ): void {
		// In case of an object, iterate through it and call `_setToTarget` again for each property.
		if ( isPlainObject( name ) ) {
			this._setObjectToTarget( target, name, isDefine );

			return;
		}

		// The configuration name should be split into parts if it has dots. E.g. `resize.width` -> [`resize`, `width`].
		const parts = name.split( '.' );

		// Take the name of the configuration out of the parts. E.g. `resize.width` -> `width`.
		name = parts.pop();

		// Iterate over parts to check if currently stored configuration has proper structure.
		for ( const part of parts ) {
			// If there is no object for specified part then create one.
			if ( !isPlainObject( target[ part ] ) ) {
				target[ part ] = Object.create( null );
			}

			// Nested object becomes a target.
			target = target[ part ];
		}

		// In case of value is an object.
		if ( isPlainObject( value ) ) {
			// We take care of proper config structure.
			if ( !isPlainObject( target[ name ] ) ) {
				target[ name ] = Object.create( null );
			}

			target = target[ name ];

			// And iterate through this object calling `_setToTarget` again for each property.
			this._setObjectToTarget( target, value, isDefine );

			return;
		}

		// Do nothing if we are defining configuration for non empty name.
		if ( isDefine && typeof target[ name ] != 'undefined' ) {
			return;
		}

		target[ name ] = value;
	}

	/**
	 * Get specified configuration from specified source (nested object).
	 *
	 * @param source level of nested object.
	 * @param name The configuration name. Configuration names are case-sensitive.
	 * @returns The configuration value or `undefined` if the configuration entry was not found.
	 */
	private _getFromSource( source: any, name: string ): any {
		// The configuration name should be split into parts if it has dots. E.g. `resize.width` -> [`resize`, `width`].
		const parts = name.split( '.' );

		// Take the name of the configuration out of the parts. E.g. `resize.width` -> `width`.
		name = parts.pop()!;

		// Iterate over parts to check if currently stored configuration has proper structure.
		for ( const part of parts ) {
			if ( !isPlainObject( source[ part ] ) ) {
				source = null;
				break;
			}

			// Nested object becomes a source.
			source = source[ part ];
		}

		// Always returns undefined for non existing configuration.
		return source ? cloneConfig( source[ name ] ) : undefined;
	}

	/**
	 * Iterates through passed object and calls {@link #_setToTarget} method with object key and value for each property.
	 *
	 * @param target Nested config object.
	 * @param configuration Configuration data set
	 * @param isDefine Defines if passed configuration is default configuration or not.
	 */
	private _setObjectToTarget( target: any, configuration: any, isDefine?: boolean ): void {
		Object.keys( configuration ).forEach( key => {
			this._setToTarget( target, key, configuration[ key ], isDefine );
		} );
	}
}

/**
 * Clones configuration object or value.
 */
function cloneConfig<T>( source: T ): T {
	return cloneDeepWith( source, leaveItemReferences );
}

/**
 * A customized function for cloneDeepWith.
 * In case if it's a DOM Element it will leave references to DOM Elements instead of cloning them.
 * If it's a function it will leave reference to actuall function.
 */
function leaveItemReferences( value: unknown ): unknown {
	return isElement( value ) || typeof value === 'function' ? value : undefined;
}

/**
 * An utility type excluding primitive values and arrays from the union.
 */
export type OnlyObject<T> = Exclude<T, undefined | null | string | number | boolean | Array<any>>;

/**
 * An utility type extracting configuration value from the given name.
 *
 * @typeParam T The type of a configuration dictionary.
 * @typeParam K The literal type of configuration name (dot-separated path).
 */
export type GetSubConfig<T, K> = K extends keyof T ?
	T[ K ] :
	K extends `${ infer K1 }.${ infer K2 }` ?
		K1 extends keyof T ?
			GetSubConfig<OnlyObject<T[ K1 ]>, K2> :
			unknown :
		unknown;
