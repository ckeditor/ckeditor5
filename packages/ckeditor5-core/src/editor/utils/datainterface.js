/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/editor/utils/datainterface
 */

/**
 * @mixin module:core/editor/utils/datainterface~DataInterface
 */
const DataInterface = {
	/**
	 * Sets the data in the editor's main root.
	 *
	 * @method module:core/editor/utils/datainterface~DataInterface#setData
	 * @param {*} data The data to load.
	 */
	setData( data ) {
		this.data.set( data );
	},

	/**
	 * Gets the data from the editor's main root.
	 *
	 * @method module:core/editor/utils/datainterface~DataInterface#getData
	 */
	getData() {
		return this.data.get();
	}
};

export default DataInterface;
