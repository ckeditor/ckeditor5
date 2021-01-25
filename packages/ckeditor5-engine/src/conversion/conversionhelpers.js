/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
	 * module:engine/conversion/upcastdispatcher~UpcastDispatcher>} dispatchers
	 */
	constructor( dispatchers ) {
		this._dispatchers = dispatchers;
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
		for ( const dispatcher of this._dispatchers ) {
			conversionHelper( dispatcher );
		}

		return this;
	}
}
