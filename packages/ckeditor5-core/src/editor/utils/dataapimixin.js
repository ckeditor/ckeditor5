/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/editor/utils/dataapimixin
 */

/**
 * Mixin provides methods for setting and getting data to/from editor main root element of the model tree
 * using {@link module:core/editor/editor~Editor#data data pipeline}.
 *
 * @mixin DataApiMixin
 * @implements module:core/editor/utils/dataapimixin~DataApi
 */
const DataApiMixin = {
	/**
	 * Sets the data in the editor's main root.
	 *
	 * @method #setData
	 * @param {*} data The data to load.
	 */
	setData( data ) {
		this.data.set( data );
	},

	/**
	 * Gets the data from the editor's main root.
	 *
	 * @method #getData
	 */
	getData() {
		return this.data.get();
	}
};

export default DataApiMixin;

/**
 * Interface representing classes which mix in {@link module:core/editor/utils/dataapimixin~DataApiMixin}.
 *
 * @interface DataApi
 */
