/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/conversion/conversionhelpers
 */

/**
 * Base class for conversion helpers.
 */
export default class ConversionHelpers {
	/**
	 * Creates a conversion helpers instance.
	 *
	 * @param {Array.<module:engine/conversion/downcastdispatcher~DowncastDispatcher|
	 * module:engine/conversion/upcastdispatcher~UpcastDispatcher>} dispatcher
	 */
	constructor( dispatcher ) {
		this._dispatchers = Array.isArray( dispatcher ) ? dispatcher : [ dispatcher ];
	}

	/**
	 * Registers a conversion helper.
	 *
	 * **Note**: See full usage example in the `{@link module:engine/conversion/conversion~Conversion#for conversion.for()}`
	 * method description.
	 *
	 * @param {Function} conversionHelper The function to be called on event.
	 * @returns {module:engine/conversion/downcasthelpers~DowncastHelpers|module:engine/conversion/upcasthelpers~UpcastHelpers}
	 */
	add( conversionHelper ) {
		this._addToDispatchers( conversionHelper );

		return this;
	}

	/**
	 * Helper function for the `Conversion` `.add()` method.
	 *
	 * Calls `conversionHelper` on each dispatcher from the group specified earlier in the `.for()` call, effectively
	 * adding converters to all specified dispatchers.
	 *
	 * @private
	 * @param {Function} conversionHelper
	 */
	_addToDispatchers( conversionHelper ) {
		for ( const dispatcher of this._dispatchers ) {
			conversionHelper( dispatcher );
		}
	}
}
