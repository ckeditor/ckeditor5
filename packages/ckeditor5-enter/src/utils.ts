/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/utils
 */

import type { Schema } from '@ckeditor/ckeditor5-engine';

/**
 * Returns attributes that should be preserved on the enter keystroke.
 *
 * Filtering is realized based on `copyOnEnter` attribute property. Read more about attribute properties
 * {@link module:engine/model/schema~Schema#setAttributeProperties here}.
 *
 * @param {module:engine/model/schema~Schema} schema
 * @param {Iterable.<*>} allAttributes attributes to filter.
 * @returns {Iterable.<*>}
 */
export function* getCopyOnEnterAttributes(
	schema: Schema,
	allAttributes: Iterable<[ string, unknown ]>
): IterableIterator<[ string, unknown ]> {
	for ( const attribute of allAttributes ) {
		if ( attribute && schema.getAttributeProperties( attribute[ 0 ] ).copyOnEnter ) {
			yield attribute;
		}
	}
}
