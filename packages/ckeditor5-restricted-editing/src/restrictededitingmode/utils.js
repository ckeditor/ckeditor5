/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingmode/utils
 */

export function getMarker( editor, position ) {
	for ( const marker of editor.model.markers ) {
		const markerRange = marker.getRange();

		if ( isPositionInRangeOrOnRangeBoundary( markerRange, position ) ) {
			if ( marker.name.startsWith( 'restricted-editing-exception:' ) ) {
				return marker;
			}
		}
	}
}

export function isPositionInRangeOrOnRangeBoundary( range, position ) {
	return (
		range.containsPosition( position ) ||
		range.end.isEqual( position ) ||
		range.start.isEqual( position )
	);
}

export function isSelectionInExceptionMarker( marker, selection ) {
	if ( !marker ) {
		return false;
	}

	const markerRange = marker.getRange();

	if ( selection.isCollapsed ) {
		return isPositionInRangeOrOnRangeBoundary( markerRange, selection.focus );
	}

	return markerRange.containsRange( selection.getFirstRange(), true );
}
