/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Config from '../config.js';

/**
 * Abstract base DataProcessor class. This class should be extended by actual DataProcessor implementations.
 *
 * @abstract
 * @class dataProcessor.DataProcessor
 */
export default class DataProcessor {
	/**
	 * Creates a new instance of DataProcessor class.
	 *
	 *
	 * @param {Object} config DataProcessor's configuration.
	 * @constructor
	 */
	constructor( config ) {
		/**
		 * Holds configurations specific to this DataProcessor instance.
		 *
		 * @readonly
		 * @property {Config}
		 */
		this.config = new Config( config );
	}

	/**
	 * Converts DocumentFragment to data supported by DataProcessor.
	 *
	 * @method toData
	 * @param {DocumentFragment} fragment Document fragment to be processed.
	 * @returns {*} Data supported by DataProcessor implementation.
	 */

	/**
	 * Converts data supported by DataProcessor to DocumentFragment.
	 *
	 * @method toDom
	 * @param {*} data Data to be processed.
	 * @returns {DocumentFragment} DocumentFragment
	 */
}
