/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/config
 */

import { isPlainObject, isElement, cloneDeepWith } from 'lodash-es';

/**
 * Handles a configuration dictionary.
 */
export default class Config<Cfg> {
	private readonly _config: Record<string, any>;

	/**
	 * Creates an instance of the {@link ~Config} class.
	 *
	 * @param {Object} [configurations] The initial configurations to be set. Usually, provided by the user.
	 * @param {Object} [defaultConfigurations] The default configurations. Usually, provided by the system.
	 */
	constructor( configurations?: Partial<Cfg>, defaultConfigurations?: Partial<Cfg> ) {
		/**
		 * Store for the whole configuration.
		 *
		 * @private
		 * @member {Object}
		 */
		this._config = {};

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

	public set<K extends string>( name: K, value: GetSubConfig<Cfg, K> ): void;
	public set( config: Partial<Cfg> ): void;

	/**
	 * Set configuration values.
	 *
	 * It accepts both a name/value pair or an object, which properties and values will be used to set
	 * configurations.
	 *
	 * It also accepts setting a "deep configuration" by using dots in the name. For example, `'resize.width'` sets
	 * the value for the `width` configuration in the `resize` subset.
	 *
	 *		config.set( 'width', 500 );
	 *		config.set( 'toolbar.collapsed', true );
	 *
	 *		// Equivalent to:
	 *		config.set( {
	 *			width: 500
	 *			toolbar: {
	 *				collapsed: true
	 *			}
	 *		} );
	 *
	 * Passing an object as the value will amend the configuration, not replace it.
	 *
	 *		config.set( 'toolbar', {
	 *			collapsed: true,
	 *		} );
	 *
	 *		config.set( 'toolbar', {
	 *			color: 'red',
	 *		} );
	 *
	 *		config.get( 'toolbar.collapsed' ); // true
	 *		config.get( 'toolbar.color' ); // 'red'
	 *
	 * @param {String|Object} name The configuration name or an object from which take properties as
	 * configuration entries. Configuration names are case-sensitive.
	 * @param {*} value The configuration value. Used if a name is passed.
	 */
	public set( name: string | Record<string, any>, value?: any ): void {
		this._setToTarget( this._config, name, value );
	}

	public define<K extends string>( name: K, value: GetSubConfig<Cfg, K> ): void;
	public define( config: Partial<Cfg> ): void;

	/**
	 * Does exactly the same as {@link #set} with one exception – passed configuration extends
	 * existing one, but does not overwrite already defined values.
	 *
	 * This method is supposed to be called by plugin developers to setup plugin's configurations. It would be
	 * rarely used for other needs.
	 *
	 * @param {String|Object} name The configuration name or an object from which take properties as
	 * configuration entries. Configuration names are case-sensitive.
	 * @param {*} value The configuration value. Used if a name is passed.
	 */
	public define( name: string | Record<string, any>, value?: any ): void {
		const isDefine = true;

		this._setToTarget( this._config, name, value, isDefine );
	}

	/**
	 * Gets the value for a configuration entry.
	 *
	 *		config.get( 'name' );
	 *
	 * Deep configurations can be retrieved by separating each part with a dot.
	 *
	 *		config.get( 'toolbar.collapsed' );
	 *
	 * @param {String} name The configuration name. Configuration names are case-sensitive.
	 * @returns {*} The configuration value or `undefined` if the configuration entry was not found.
	 */
	public get<K extends string>( name: K ): GetSubConfig<Cfg, K> | undefined {
		return this._getFromSource( this._config, name );
	}

	/**
	 * Iterates over all top level configuration names.
	 *
	 * @returns {Iterable.<String>}
	 */
	public* names(): Iterable<string> {
		for ( const name of Object.keys( this._config ) ) {
			yield name;
		}
	}

	/**
	 * Saves passed configuration to the specified target (nested object).
	 *
	 * @private
	 * @param {Object} target Nested config object.
	 * @param {String|Object} name The configuration name or an object from which take properties as
	 * configuration entries. Configuration names are case-sensitive.
	 * @param {*} value The configuration value. Used if a name is passed.
	 * @param {Boolean} [isDefine=false] Define if passed configuration should overwrite existing one.
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
				target[ part ] = {};
			}

			// Nested object becomes a target.
			target = target[ part ];
		}

		// In case of value is an object.
		if ( isPlainObject( value ) ) {
			// We take care of proper config structure.
			if ( !isPlainObject( target[ name ] ) ) {
				target[ name ] = {};
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
	 * @private
	 * @param {Object} source level of nested object.
	 * @param {String} name The configuration name. Configuration names are case-sensitive.
	 * @returns {*} The configuration value or `undefined` if the configuration entry was not found.
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
	 * @private
	 * @param {Object} target Nested config object.
	 * @param {Object} configuration Configuration data set
	 * @param {Boolean} [isDefine] Defines if passed configuration is default configuration or not.
	 */
	private _setObjectToTarget( target: any, configuration: any, isDefine?: boolean ): void {
		Object.keys( configuration ).forEach( key => {
			this._setToTarget( target, key, configuration[ key ], isDefine );
		} );
	}
}

// Clones configuration object or value.
// @param {*} source Source configuration
// @returns {*} Cloned configuration value.
function cloneConfig<T>( source: T ): T {
	return cloneDeepWith( source, leaveDOMReferences );
}

// A customized function for cloneDeepWith.
// It will leave references to DOM Elements instead of cloning them.
//
// @param {*} value
// @returns {Element|undefined}
function leaveDOMReferences( value: unknown ): unknown {
	return isElement( value ) ? value : undefined;
}

type OnlyObject<T> = Exclude<T, undefined | null | string | number | boolean | Array<any>>;

type GetSubConfig<T, K> = K extends keyof T ?
	T[ K ] :
	K extends `${ infer K1 }.${ infer K2 }` ?
		K1 extends keyof T ?
			GetSubConfig<OnlyObject<T[ K1 ]>, K2> :
			unknown :
		unknown;
