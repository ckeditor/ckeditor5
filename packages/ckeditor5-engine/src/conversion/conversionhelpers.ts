/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/conversion/conversionhelpers
 */

/**
 * Base class for conversion helpers.
 */
export default class ConversionHelpers<TDispatcher> {
	private readonly _dispatchers: Array<TDispatcher>;

	/**
	 * Creates a conversion helpers instance.
	 */
	constructor( dispatchers: Array<TDispatcher> ) {
		this._dispatchers = dispatchers;
	}

	/**
	 * Registers a conversion helper.
	 *
	 * **Note**: See full usage example in the `{@link module:engine/conversion/conversion~Conversion#for conversion.for()}`
	 * method description.
	 *
	 * @param conversionHelper The function to be called on event.
	 */
	public add( conversionHelper: ( dispatcher: TDispatcher ) => void ): this {
		for ( const dispatcher of this._dispatchers ) {
			conversionHelper( dispatcher );
		}

		return this;
	}
}
