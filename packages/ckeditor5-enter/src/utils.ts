/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module enter/utils
 */

import type { ModelSchema } from '@ckeditor/ckeditor5-engine';

/**
 * Returns attributes that should be preserved on the enter keystroke.
 *
 * Filtering is realized based on `copyOnEnter` attribute property. Read more about attribute properties
 * {@link module:engine/model/schema~ModelSchema#setAttributeProperties here}.
 *
 * @param schema Model's schema.
 * @param allAttributes Attributes to filter.
 * @internal
 */
export function* getCopyOnEnterAttributes(
	schema: ModelSchema,
	allAttributes: Iterable<[ string, unknown ]>
): IterableIterator<[ string, unknown ]> {
	for ( const attribute of allAttributes ) {
		if ( attribute && schema.getAttributeProperties( attribute[ 0 ] ).copyOnEnter ) {
			yield attribute;
		}
	}
}
