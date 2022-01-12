/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingmode/utils
 */

/**
 * Returns a single "restricted-editing-exception" marker at a given position. Contrary to
 * {@link module:engine/model/markercollection~MarkerCollection#getMarkersAtPosition}, it returnd a marker also when the postion is
 * equal to one of the marker's start or end positions.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {module:engine/model/position~Position} position
 * @returns {module:engine/model/markercollection~Marker|undefined} marker
 */
export function getMarkerAtPosition( editor, position ) {
	for ( const marker of editor.model.markers ) {
		const markerRange = marker.getRange();

		if ( isPositionInRangeBoundaries( markerRange, position ) ) {
			if ( marker.name.startsWith( 'restrictedEditingException:' ) ) {
				return marker;
			}
		}
	}
}

/**
 * Checks if the position is fully contained in the range. Positions equal to range start or end are considered "in".
 *
 * @param {module:engine/model/range~Range} range
 * @param {module:engine/model/position~Position} position
 * @returns {Boolean}
 */
export function isPositionInRangeBoundaries( range, position ) {
	return (
		range.containsPosition( position ) ||
		range.end.isEqual( position ) ||
		range.start.isEqual( position )
	);
}

/**
 * Checks if the selection is fully contained in the marker. Positions on marker boundaries are considered "in".
 *
 *		<marker>[]foo</marker> -> true
 *		<marker>f[oo]</marker> -> true
 *		<marker>f[oo</marker> ba]r -> false
 *		<marker>foo</marker> []bar -> false
 *
 * @param {module:engine/model/selection~Selection} selection
 * @param {module:engine/model/markercollection~Marker} marker
 * @returns {Boolean}
 */
export function isSelectionInMarker( selection, marker ) {
	if ( !marker ) {
		return false;
	}

	const markerRange = marker.getRange();

	if ( selection.isCollapsed ) {
		return isPositionInRangeBoundaries( markerRange, selection.focus );
	}

	return markerRange.containsRange( selection.getFirstRange(), true );
}
