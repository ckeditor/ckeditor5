/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/conversion/comparemarkers
 */

import type { ModelRange } from '../model/range.js';

/**
 * Sorts markers so the downcast result is deterministic regardless of the order
 * markers were added to the marker collection.
 *
 * The sort key is the marker's range, ordered "right-to-left" through the document so that
 * a marker's opening boundary is processed *after* any markers nested inside it. This way
 * the outer marker wraps the inner ones at conversion time.
 *
 * Cases (positions shown as `0123456789`, sort result top-to-bottom):
 *
 * 1. Non-overlapping ranges — sorted by position, last range first:
 *
 *        a: [--]               →   c, b, a
 *        b:     [--]
 *        c:        [--]
 *
 * 2. Adjacent ranges (end === start) — treated as non-overlapping:
 *
 *        first:  [---]         →   third, second, first
 *        second:    [---]
 *        third:        [---]
 *
 * 3. Nested ranges (same start, different ends) — inner first, outer last:
 *
 *        shorter: [-]          →   shorter, longer
 *        longer:  [---]
 *
 * 4. Partially overlapping ranges — sorted by start position:
 *
 *        earlier: [---]        →   later, earlier
 *        later:     [---]
 *
 * 5. Identical ranges — fall back to reverse name comparison:
 *
 *        alpha:   [---]        →   charlie, bravo, alpha
 *        bravo:   [---]
 *        charlie: [---]
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
						return -1;
					case 'after':
						return 1;
					default:
						return name2.localeCompare( name1 );
				}
		}
	}
}
