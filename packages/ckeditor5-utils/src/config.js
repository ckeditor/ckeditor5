/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/config
 */

import isPlainObject from './lib/lodash/isPlainObject';

/**
 * Handles a configuration dictionary.
 */
export default class Config {
	/**
	 * Creates an instance of the {@link ~Config} class.
	 *
	 * @param {Object} [configurations] The initial configurations to be set. Usually, provided by the user.
	 * @param {Object} [defaultConfigurations] The default configurations. Usually, provided by the system.
	 */
	constructor( configurations, defaultConfigurations ) {
		/**
		 * Store for the whole configuration.
		 *
		 * @private
		 * @member {Object}
		 */
		this._config = {};

		// Set default configuration.
		if ( defaultConfigurations ) {
			this.define( defaultConfigurations );
		}

		// Set initial configuration.
		if ( configurations ) {
			this._setObjectToTarget( this._config, configurations );
		}
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
	 *		config.get( 'toolbar.collapsed' ); // true
	 *		config.get( 'toolbar.color' ); // 'red'
	 *
	 * @param {String|Object} name The configuration name or an object from which take properties as
	 * configuration entries. Configuration names are case-sensitive.
	 * @param {*} value The configuration value. Used if a name is passed.
	 */
	set( name, value ) {
		this._setToTarget( this._config, name, value );
	}

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
	define( name, value ) {
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
	get( name ) {
		return this._getFromSource( this._config, name );
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
	_setToTarget( target, name, value, isDefine = false ) {
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
	_getFromSource( source, name ) {
		// The configuration name should be split into parts if it has dots. E.g. `resize.width` -> [`resize`, `width`].
		const parts = name.split( '.' );

		// Take the name of the configuration out of the parts. E.g. `resize.width` -> `width`.
		name = parts.pop();

		// Iterate over parts to check if currently stored configuration has proper structure.
		for ( const part of parts ) {
			if ( !isPlainObject( source[ part ] ) ) {
				source = null;
				break;
			}

			// Nested object becomes a source.
			source = source[ part ];
		}

		// Always returns undefined for non existing configuration
		return source ? source[ name ] : undefined;
	}

	/**
	 * Iterates through passed object and calls {@link #_setToTarget} method with object key and value for each property.
	 *
	 * @private
	 * @param {Object} target Nested config object.
	 * @param {Object} configuration Configuration data set
	 * @param {Boolean} [isDefine] Defines if passed configuration is default configuration or not.
	 */
	_setObjectToTarget( target, configuration, isDefine ) {
		Object.keys( configuration ).forEach( key => {
			this._setToTarget( target, key, configuration[ key ], isDefine );
		} );
	}
}
