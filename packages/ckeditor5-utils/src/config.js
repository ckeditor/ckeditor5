/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import isObject from './lib/lodash/isObject.js';
import isPlainObject from './lib/lodash/isPlainObject.js';

/**
 * Handles a configuration dictionary.
 *
 * @memberOf utils
 */
export default class Config {

	/**
	 * Creates an instance of the {@link Config} class.
	 *
	 * @param {Object} [configurations] The initial configurations to be set.
	 */
	constructor( configurations ) {
		if ( configurations ) {
			this._set( configurations );
		}

		/**
		 * Store for whole configuration. Configuration is hide it private property to be not accessible
		 * directly from Config instance to keep consistent API.
		 *
		 * @private
		 * @member {ConfigSubset} utils.config#_config
		 */
	}

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
	 *		config.toolbar.collapsed; // true
	 *		config.toolbar.color; // 'red'
	 *
	 * @param {String|Object} name The configuration name or an object from which take properties as
	 * configuration entries. Configuration names are case-insensitive.
	 * @param {*} [value=null] The configuration value. Used if a name is passed to nameOrConfigurations.
	 */
	set( name, value ) {
		this._set( name, value );
	}

	/**
	 * Does exactly the same as {@link utils.Config#set} with one exception - passed configuration extends
	 * existing one, but does not overwrite already defined values.
	 *
	 * @param {String|Object} name The configuration name or an object from which take properties as
	 * configuration entries. Configuration names are case-insensitive.
	 * @param {*} [value=null] The configuration value. Used if a name is passed to nameOrConfigurations.
	 */
	define( name, value ) {
		this._set( name, value, true );
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
	 * @param {String} name The configuration name. Configuration names are case-insensitive.
	 * @returns {*} The configuration value or `undefined` if the configuration entry was not found.
	 */
	get( name ) {
		// The target for this configuration is, for now, this object.
		let source = this;

		// Whole configuration is stored in private property.
		if ( !( source instanceof ConfigSubset ) ) {
			// Configuration is empty.
			if ( !source._config ) {
				return;
			}

			source = source._config;
		}

		// The configuration name should be split into parts if it has dots. E.g. `resize.width` -> [`resize`, `width`].
		const parts = name.toLowerCase().split( '.' );

		// Take the name of the configuration out of the parts. E.g. `resize.width` -> `width`.
		name = parts.pop();

		// Retrieves the source for this configuration recursively.
		for ( let i = 0; i < parts.length; i++ ) {
			// The target will always be an instance of Config.
			if ( !( source[ parts[ i ] ] instanceof ConfigSubset ) ) {
				source = null;
				break;
			}

			source = source[ parts[ i ] ];
		}

		// Always returns undefined for non existing configuration
		return source ? source[ name ] : undefined;
	}

	/**
	 * Converts and saves passed configuration.
	 *
	 * @private
	 * @param {String|Object} name The configuration name or an object from which take properties as
	 * configuration entries. Configuration names are case-insensitive.
	 * @param {*} [value=null] The configuration value. Used if a name is passed to nameOrConfigurations.
	 * @param {Boolean} [isDefine=false] Define if passed configuration should overwrite existing one.
	 */
	_set( name, value, isDefine ) {
		// In case of an object, iterate through it and call set( name, value ) again for each property.
		if ( isObject( name ) ) {
			this._setObject( name, isDefine );

			return;
		}

		// The target for this configuration is, for now, this object.
		let target = this;

		// If we are at the top of the configuration tree, hide configuration in private property
		// to prevent of getting properties directly from config, to keep consistent API.
		if ( !( target instanceof ConfigSubset ) ) {
			if ( !target._config ) {
				target._config = new ConfigSubset();
			}

			target = target._config;
		}

		// The configuration name should be split into parts if it has dots. E.g: `resize.width`.
		const parts = name.toLowerCase().split( '.' );

		// Take the name of the configuration out of the parts. E.g. `resize.width` -> `width`
		name = parts.pop();

		// Retrieves the final target for this configuration recursively.
		for ( let i = 0; i < parts.length; i++ ) {
			// The target will always be an instance of Config.
			if ( !( target[ parts[ i ] ] instanceof ConfigSubset ) ) {
				target.set( parts[ i ], new ConfigSubset() );
			}

			target = target[ parts[ i ] ];
		}

		// Values set as pure objects will be treated as Config subsets.
		if ( isPlainObject( value ) ) {
			// If the target is an instance of Config (a deep config subset).
			if ( target[ name ] instanceof ConfigSubset ) {
				// Amend the target with the value, instead of replacing it.
				target[ name ]._setObject( value, isDefine );

				return;
			}

			value = new ConfigSubset( value );
		}

		// Do nothing if there is already defined configuration for this name
		// and configuration is set as default.
		if ( isDefine && typeof target[ name ] != 'undefined' ) {
			return;
		}

		// Values will never be undefined.
		if ( typeof value == 'undefined' ) {
			value = null;
		}

		target[ name ] = value;
	}

	/**
	 * Iterate through passed object and call set method with object key and value for each property.
	 *
	 * @private
	 * @param {Object} configuration Configuration data set
	 * @param {Boolean} isDefine Defines if passed configuration is default configuration or not
	 */
	_setObject( configuration, isDefine ) {
		Object.keys( configuration ).forEach( ( key ) => {
			this._set( key, configuration[ key ], isDefine );
		}, this );
	}
}

/**
 * Helper class to recognize if current configuration is nested or the top.
 */
class ConfigSubset extends Config {}
