/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * DataProcessor interface. It should be implemented by actual DataProcessors.
 * Each data processor implements a certain format of the data. E.g. `MarkdownDataProcessor` will convert the data
 * (Markdown string) to a DocumentFragment and back.
 *
 * @interface dataProcessor.DataProcessor
 */

/**
 * Converts a DocumentFragment to data.
 *
 * @method toData
 * @param {DocumentFragment} fragment DocumentFragment to be processed.
 * @returns {*}
 */

/**
 * Converts data to a DocumentFragment.
 *
 * @method toDom
 * @param {*} data Data to be processed.
 * @returns {DocumentFragment}
 */
