/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/utils
 */

/**
 * Returns attributes that should be preserved on the enter key.
 *
 * Filtering is realized based on `copyOnEnter` attribute property. Read more about attribute properties
 * {@link module:engine/model/schema~Schema#setAttributeProperties here}.
 *
 * @param {module:engine/model/schema~Schema} schema
 * @param {Iterable.<*>} allAttributes attributes to filter.
 * @returns {Iterable.<*>}
 */
export function* getCopyOnEnterAttributes( schema, allAttributes ) {
	for ( const attribute of allAttributes ) {
		if ( attribute && schema.getAttributeProperties( attribute[ 0 ] ).copyOnEnter ) {
			yield attribute;
		}
	}
}
