/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	Range,
	type DocumentFragment,
	type Element,
	type Marker,
	type Writer,
	type DocumentSelection,
	type Selection
} from '@ckeditor/ckeditor5-engine';

/**
 * @module clipboard/utils/insertAndCollectFakeMarkers
 */

/**
 * Checks if marker can be copied.
 *
 * @param marker Instance of marker.
 */
function isCopyableMarker( marker: Marker ): boolean {
	return marker.name.startsWith( 'comment:' );
}

/**
 * Returns array of markers that can be copied in specified selection.
 *
 * @param writer An instance of the model writer.
 * @param selection  Selection which will be checked.
 */
function getCopyableMarkersFromSelection( writer: Writer, selection: Selection | DocumentSelection ): Array<Marker> {
	return Array
		.from( selection.getRanges()! )
		.flatMap( selectionRange => Array.from( writer.model.markers.getMarkersIntersectingRange( selectionRange ) ) )
		.filter( isCopyableMarker );
}

/**
 * Inserts specified array of fake markers elements to document and assigns them `type` and `name` attributes.
 * Fake markers elements are used to calculate position of markers on pasted fragment that were transformed during
 * steps between copy and paste.
 *
 * @param writer An instance of the model writer.
 * @param markers Array of markers that will be inserted.
 */
function insertFakeMarkersElements( writer: Writer, markers: Array<Marker> ): Map<Marker, Array<Element>> {
	const mappedMarkers = new Map<Marker, Array<Element>>();
	const sortedMarkers = markers
		.flatMap( marker => {
			const { start, end } = marker.getRange();

			return [
				{ position: start, marker, type: 'start' },
				{ position: end, marker, type: 'end' }
			];
		} )
		// Markers position is sorted backwards to ensure that the insertion of fake markers will not change
		// the position of the next markers.
		.sort( ( { position: posA }, { position: posB } ) => posA.isBefore( posB ) ? 1 : -1 );

	for ( const { position, marker, type } of sortedMarkers ) {
		const fakeMarker = writer.createElement( '$marker', {
			'data-name': marker.name,
			'data-type': type
		} );

		if ( !mappedMarkers.has( marker ) ) {
			mappedMarkers.set( marker, [] );
		}

		mappedMarkers.get( marker )!.push( fakeMarker );
		writer.insert( fakeMarker, position );
	}

	return mappedMarkers;
}

/**
 * Returns object that contains mapping between marker names and corresponding fake-marker elements.
 * Function returns fake-markers elements that starts or ends or are present inside selected fragment.
 * Markers that start before and end after of specified fragment are not returned at all.
 *
 * @param writer An instance of the model writer.
 * @param fragment The element to be checked.
 */
function getAllFakeMarkersFromElement( writer: Writer, fragment: DocumentFragment ): Record<string, Array<Element>> {
	return Array
		.from( writer.createRangeIn( fragment ) )
		.reduce<Record<string, Array<Element>>>( ( fakeMarkerElements, { item } ) => {
			if ( item.is( 'element', '$marker' ) ) {
				const fakeMarkerName = item.getAttribute( 'data-name' ) as string | undefined;

				( fakeMarkerElements[ fakeMarkerName! ] ||= [] ).push( item );
			}

			return fakeMarkerElements;
		}, {} );
}

/**
 * Removes all inserted in previous functions markers that are present in specified fragment. It removes only
 * markers that have at least start or end position inside fragment. Markers that start before and
 * end after of specified fragment are not removed at all.
 *
 * @param writer An instance of the model writer.
 * @param fragment The element to be checked.
 */
function removeFakeMarkersInsideFragment( writer: Writer, fragment: DocumentFragment ): Record<string, Range> {
	const fakeFragmentMarkersInMap = getAllFakeMarkersFromElement( writer, fragment );

	return Object
		.entries( fakeFragmentMarkersInMap )
		.reduce<Record<string, Range>>( ( acc, [ markerName, [ startElement, endElement ] ] ) => {
			// Marker is not entire inside specified fragment but rather starts or ends inside it.
			if ( !endElement ) {
				const type = startElement.getAttribute( 'data-type' );

				if ( type === 'end' ) {
					// <fake-marker> [ phrase</fake-marker> phrase ]
					//   ^
					// Handle case when marker is just before start of selection.

					const endPosition = writer.createPositionAt( startElement, 'before' );
					const startPosition = writer.createPositionFromPath( endPosition.root, [ 0 ] );

					writer.remove( startElement );
					acc[ markerName ] = new Range( startPosition, endPosition );
				} else {
					// [<fake-marker>phrase]</fake-marker>
					//                           ^
					// Handle case when fake marker is after selection.

					const startPosition = writer.createPositionAt( startElement, 'before' );
					writer.remove( startElement );

					const endPosition = writer.createPositionAt( fragment, 'end' );
					acc[ markerName ] = new Range( startPosition, endPosition );
				}

				return acc;
			}

			// [ foo <fake-marker>aaa</fake-marker> test ]
			//                    ^
			// Handle case when marker is between start and end of selection.
			const startPosition = writer.createPositionAt( startElement, 'before' );
			writer.remove( startElement );

			const endPosition = writer.createPositionAt( endElement, 'before' );
			writer.remove( endElement );

			acc[ markerName ] = new Range( startPosition, endPosition );
			return acc;
		}, {} );
}

/**
 * First step of copying markers. Inserts into specified fragment fake markers elements with positions of
 * real markers that will be used later to calculate positions of real markers.
 *
 * @param writer An instance of the model writer.
 * @param selection Selection to be checked.
 * @internal
 */
export function insertAndCollectFakeMarkers( writer: Writer, selection: Selection | DocumentSelection ): Map<Marker, Array<Element>> {
	const copyableMarkers = getCopyableMarkersFromSelection( writer, selection );

	return insertFakeMarkersElements( writer, copyableMarkers );
}

/**
 * Calculates new positions of real markers using fake markers that are present inside fragment.
 *
 * @param writer An instance of the model writer.
 * @param selection Selection to be checked.
 * @param insertedFakeMarkersElements Map of fake markers with corresponding fake elements.
 * @internal
 */
export function collectAndRemoveFakeMarkers(
	writer: Writer,
	fragment: DocumentFragment,
	insertedFakeMarkersElements: Map<Marker, Array<Element>>
): void {
	const fakeMarkersRangesInsideRange = removeFakeMarkersInsideFragment( writer, fragment );

	for ( const [ marker, range ] of Object.entries( fakeMarkersRangesInsideRange ) ) {
		fragment.markers.set( marker, range );
	}

	// <fake-marker>[ Foo ]</fake-marker>
	//      ^                    ^
	// Handle case when selection is inside marker.
	for ( const [ marker ] of insertedFakeMarkersElements.entries() ) {
		if ( fakeMarkersRangesInsideRange[ marker.name ] ) {
			continue;
		}

		fragment.markers.set( marker.name, writer.createRangeIn( fragment ) );
	}

	// Remove remain markers inserted to original element (source of copy).
	for ( const element of Array.from( insertedFakeMarkersElements.values() ).flat() ) {
		writer.remove( element );
	}
}
