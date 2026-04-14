/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/conversion/comparemarkers
 */

import type { ModelRange } from '../model/range.js';

/**
 * Sorts markers in a stable fashion so their addition order does not affect downcast output.
 *
 * Markers are ordered in reverse DOM order for non-intersecting ranges. For intersecting ranges,
 * the start position is the primary sort key and the end position is the secondary sort key.
 *
 * @internal
 */
export function compareMarkersForDowncast(
	[ name1, range1 ]: readonly [ string, ModelRange ],
	[ name2, range2 ]: readonly [ string, ModelRange ]
): number {
	if ( range1.end.compareWith( range2.start ) !== 'after' ) {
		// m1.end <= m2.start -- m1 is entirely <= m2.
		return 1;
	} else if ( range1.start.compareWith( range2.end ) !== 'before' ) {
		// m1.start >= m2.end -- m1 is entirely >= m2.
		return -1;
	} else {
		// They overlap, so use their start positions as the primary sort key and
		// end positions as the secondary sort key.
		switch ( range1.start.compareWith( range2.start ) ) {
			case 'before':
				return 1;
			case 'after':
				return -1;
			default:
				switch ( range1.end.compareWith( range2.end ) ) {
					case 'before':
						return 1;
					case 'after':
						return -1;
					default:
						return name2.localeCompare( name1 );
				}
		}
	}
}
