/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/editor/utils/dataapimixin
 */

/**
 * Implementation of the {@link module:core/editor/utils/dataapimixin~DataApi}.
 *
 * @mixin DataApiMixin
 * @implements module:core/editor/utils/dataapimixin~DataApi
 */
const DataApiMixin = {
	/**
	 * @inheritDoc
	 */
	setData( data ) {
		this.data.set( data );
	},

	/**
	 * @inheritDoc
	 */
	getData() {
		return this.data.get();
	}
};

export default DataApiMixin;

/**
 * Interface for setting and getting data to/from the editor's main root element
 * using the {@link module:core/editor/editor~Editor#data data pipeline}.
 *
 * @interface DataApi
 */

/**
 * Sets the data in the editor's main root.
 *
 * @method #setData
 * @param {String} data Input data.
 */

/**
 * Gets the data from the editor's main root.
 *
 * @method #getData
 * @returns {String} Output data.
 */
