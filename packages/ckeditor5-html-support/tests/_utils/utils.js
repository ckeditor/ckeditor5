/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

/**
 * Writes the content of a model {@link module:engine/model/document~Document document} to an HTML-like string with
 * indexed HTML Support attributes.
 *
 *		getModelDataWithAttributes( editor.model );
 *		// -> 	{
 *		//			data: '<paragraph htmlAttributes1="(1)" htmlAttributes2="(2)"><$text htmlSpan="(2)">foobar!</$text></paragraph>',
 *		//			attributes: {
 *		//				1: { classes: [ 'foo', 'bar' ] },
 *		//				2: { attributes: { 'data-foo': 'foo' } }
 *		//			}
 *		//		}
 *
 * This function will index every attribute starting with `html*` keyword and return it's value in `result.attributes` property.
 *
 * @param {module:engine/model/model~Model} model
 * @param {Object} [options]
 * @param {Boolean} [options.withoutSelection=false] Whether to write the selection. When set to `true`, the selection will
 * not be included in the returned string.
 * @param {String} [options.rootName='main'] The name of the root from which the data should be stringified. If not provided,
 * the default `main` name will be used.
 * @param {Boolean} [options.convertMarkers=false] Whether to include markers in the returned string.
 * @param {Array} [options.excludeAttributes] Attributes to exclude from the result.
 * @returns {Object} result
 * @returns {String} result.data The stringified data.
 * @returns {Object} result.attributes Indexed data attributes.
 */
export function getModelDataWithAttributes( model, options = {} ) {
	// Simplify GHS attributes as they are not very readable at this point due to object structure.
	let counter = 1;
	const data = getModelData( model, options ).replace( /(html.*?)="{.*?}"/g, ( fullMatch, attributeName ) => {
		return `${ attributeName }="(${ counter++ })"`;
	} );

	const range = model.createRangeIn( model.document.getRoot() );
	const excludeAttributes = options.excludeAttributes || [];

	let attributes = [];
	for ( const item of range.getItems() ) {
		for ( const [ key, value ] of sortAttributes( item.getAttributes() ) ) {
			if ( key.startsWith( 'html' ) && !excludeAttributes.includes( key ) ) {
				attributes.push( value );
			}
		}
	}

	attributes = attributes.reduce( ( prev, cur, index ) => {
		prev[ index + 1 ] = cur;
		return prev;
	}, {} );

	return { data, attributes };
}

function sortAttributes( attributes ) {
	attributes = Array.from( attributes );

	return attributes.sort( ( attr1, attr2 ) => {
		const key1 = attr1[ 0 ];
		const key2 = attr2[ 0 ];

		if ( key1 > key2 ) {
			return 1;
		}

		if ( key1 < key2 ) {
			return -1;
		}

		return 0;
	} );
}
