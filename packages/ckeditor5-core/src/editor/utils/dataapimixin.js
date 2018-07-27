/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
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
 * Interface defining editor methods for setting and getting data to and from the editor's main root element
 * using the {@link module:core/editor/editor~Editor#data data pipeline}.
 *
 * This interface is not a part of the {@link module:core/editor/editor~Editor} class because one may want to implement
 * an editor with multiple root elements, in which case the methods for setting and getting data will need to be implemented
 * differently.
 *
 * @interface DataApi
 */

/**
 * Sets the data in the editor.
 *
 *		editor.setData( '<p>This is editor!</p>' );
 *
 * By default the editor accepts HTML. This can be controlled by injecting a different data processor.
 * See the {@glink features/markdown Markdown output} guide for more details.
 *
 * Note: Not only is the format of the data configurable, but the type of the `setData()`'s parameter does not
 * have to be a string either. You can e.g. accept an object or a DOM `DocumentFragment` if you consider this
 * the right format for you.
 *
 * @method #setData
 * @param {String} data Input data.
 */

/**
 * Gets the data from the editor.
 *
 *		editor.getData(); // -> '<p>This is editor!</p>'
 *
 * By default the editor outputs HTML. This can be controlled by injecting a different data processor.
 * See the {@glink features/markdown Markdown output} guide for more details.
 *
 * Note: Not only is the format of the data configurable, but the type of the `getData()`'s return value does not
 * have to be a string either. You can e.g. return an object or a DOM `DocumentFragment`  if you consider this
 * the right format for you.
 *
 * @method #getData
 * @returns {String} Output data.
 */
