/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Config from '../config.js';

/**
 * Basic DataProcessor class. This class should be extended by actual DataProcessor implementations.
 *
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
	 * Converts DocumentFragment to output data supported by DataProcessor.
	 *
	 * @param {DocumentFragment} fragment
	 * @returns {*}
	 */
	toData( fragment ) {
		/*jshint unused:false*/
	}

	/**
	 * Converts data supported by DataProcessor to DocumentFragment.
	 *
	 * @param {*} data
	 * @returns {DocumentFragment}
	 */
	toDom( data ) {
		/*jshint unused:false*/
	}
}
