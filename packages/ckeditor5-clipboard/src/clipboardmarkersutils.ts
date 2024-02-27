/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { clone } from 'lodash-es';

import { uid } from '@ckeditor/ckeditor5-utils';
import { Plugin } from '@ckeditor/ckeditor5-core';

import {
	Range,
	type Marker,
	type Element,
	type DocumentFragment,
	type DocumentSelection,
	type Selection,
	type Writer
} from '@ckeditor/ckeditor5-engine';

/**
 * Part of the clipboard logic. Responsible for collecting markers from selected fragments
 * and restoring them with proper positions in pasted elements.
 *
 * @internal
 */
export default class ClipboardMarkersUtils extends Plugin {
	/**
	 * Map of marker names that can be copied.
	 *
	 * @internal
	 */
	private _markersToCopy: Map<string | symbol, Array<ClipboardMarkerAction>> = new Map();

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ClipboardMarkersUtils' as const;
	}

	/**
	 * In some situations we have to perform copy on selected fragment with certain markers.
	 * This function allows to temporary bypass restrictions on markers that we want to copy.
	 *
	 * @param action Forced action on markers.
	 * @param executor Callback executed.
	 * @internal
	 */
	public _temporaryDisableActionRestrictionsOnMarkers( action: ClipboardMarkerAction, executor: VoidFunction ): void {
		const markersToRevert = new Map( this._markersToCopy );

		for ( const marker of this._markersToCopy.keys() ) {
			this._markersToCopy.set( marker, [ action ] );
		}

		try {
			executor();
		} finally {
			for ( const marker of this._markersToCopy.keys() ) {
				this._markersToCopy.set( marker, markersToRevert.get( marker )! );
			}
		}
	}

	/**
	 * Checks if marker can be copied.
	 *
	 * @param marker Instance of marker.
	 * @internal
	 */
	public _canPerformMarkerClipboardAction( marker: Marker, action: ClipboardMarkerAction ): boolean {
		const [ markerNamePrefix ] = marker.name.split( ':' );
		const possibleActions = this._markersToCopy.get( markerNamePrefix ) || [];

		return possibleActions.includes( action );
	}

	/**
	 * Registers marker name as copyable in clipboard pipeline.
	 *
	 * @param markerName Name of marker that can be copied.
	 * @param allowedActions List of allowed actions that can be performed on markers with specified name.
	 * @internal
	 */
	public _registerMarkerToCopy( markerName: string, allowedActions: Array<ClipboardMarkerAction> ): void {
		this._markersToCopy.set( markerName, allowedActions );
	}

	/**
	 * Performs copy markers on provided selection and paste it to fragment returned from `getCopiedFragment`.
	 *
	 * 	1. Picks all markers in provided selection.
	 * 	2. Inserts fake markers inside provided selection.
	 * 	3. Gets copied selection fragment.
	 * 	4. Removes fake elements from fragment.
	 * 	5. Inserts markers on position of fake markers.
	 *
	 * @param action Type of clipboard action.
	 * @param writer An instance of the model writer.
	 * @param selection Selection to be checked.
	 * @param getCopiedFragment	Callback that performs copy of selection and returns it as fragment.
	 * @internal
	 */
	public _copySelectedFragmentWithMarkers(
		action: ClipboardMarkerAction,
		selection: Selection | DocumentSelection,
		getCopiedFragment: ( writer: Writer ) => DocumentFragment = writer => writer.model.getSelectedContent( selection )
	): DocumentFragment {
		return this.editor.model.change( writer => {
			const sourceSelectionInsertedMarkers = this._insertFakeMarkersToSelection( writer, selection, action );
			const fragment = getCopiedFragment( writer );

			this._hydrateCopiedFragmentWithMarkers( writer, fragment, sourceSelectionInsertedMarkers );

			// Remove all fake markers elements
			for ( const element of Array.from( sourceSelectionInsertedMarkers.values() ).flat() ) {
				writer.remove( element );
			}

			return fragment;
		} );
	}

	/**
	 * First step of copying markers. Inserts into specified fragment fake markers elements with positions of
	 * real markers that will be used later to calculate positions of real markers.
	 *
	 * @param writer An instance of the model writer.
	 * @param selection Selection to be checked.
	 * @param action Type of clipboard action.
	 */
	private _insertFakeMarkersToSelection(
		writer: Writer,
		selection: Selection | DocumentSelection,
		action: ClipboardMarkerAction
	): Map<Marker, Array<Element>> {
		const copyableMarkers = this._getCopyableMarkersFromSelection( writer, selection, action );

		return this._insertFakeMarkersElements( writer, copyableMarkers );
	}

	/**
	 * Calculates new positions of real markers using fake markers that are present inside fragment.
	 *
	 * @param writer An instance of the model writer.
	 * @param fragment Document fragment to be checked.
	 * @param insertedFakeMarkersElements Map of fake markers with corresponding fake elements.
	 */
	private _hydrateCopiedFragmentWithMarkers(
		writer: Writer,
		fragment: DocumentFragment,
		insertedFakeMarkersElements: Map<Marker, Array<Element>>
	): void {
		const fakeMarkersRangesInsideRange = this._removeFakeMarkersInsideElement( writer, fragment );

		for ( const [ marker, range ] of Object.entries( fakeMarkersRangesInsideRange ) ) {
			fragment.markers.set( this._genUniqMarkerName( marker ), range );
		}

		// <fake-marker>[ Foo ]</fake-marker>
		//      ^                    ^
		// Handle case when selection is inside marker.
		for ( const [ marker ] of insertedFakeMarkersElements.entries() ) {
			if ( fakeMarkersRangesInsideRange[ marker.name ] ) {
				continue;
			}

			fragment.markers.set(
				this._genUniqMarkerName( marker.name ),
				writer.createRangeIn( fragment )
			);
		}
	}

	/**
	 * Returns array of markers that can be copied in specified selection.
	 *
	 * @param writer An instance of the model writer.
	 * @param selection  Selection which will be checked.
	 * @param action Type of clipboard action.
	 */
	private _getCopyableMarkersFromSelection(
		writer: Writer,
		selection: Selection | DocumentSelection,
		action: ClipboardMarkerAction
	): Array<Marker> {
		return Array
			.from( selection.getRanges()! )
			.flatMap( selectionRange => Array.from( writer.model.markers.getMarkersIntersectingRange( selectionRange ) ) )
			.filter( marker => this._canPerformMarkerClipboardAction( marker, action ) );
	}

	/**
	 * Inserts specified array of fake markers elements to document and assigns them `type` and `name` attributes.
	 * Fake markers elements are used to calculate position of markers on pasted fragment that were transformed during
	 * steps between copy and paste.
	 *
	 * @param writer An instance of the model writer.
	 * @param markers Array of markers that will be inserted.
	 */
	private _insertFakeMarkersElements( writer: Writer, markers: Array<Marker> ): Map<Marker, Array<Element>> {
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
	 * Removes all inserted in previous functions markers that are present in specified fragment. It removes only
	 * markers that have at least start or end position inside fragment. Markers that start before and
	 * end after of specified fragment are not removed at all.
	 *
	 * @param writer An instance of the model writer.
	 * @param rootElement The element to be checked.
	 */
	private _removeFakeMarkersInsideElement( writer: Writer, rootElement: Element | DocumentFragment ): Record<string, Range> {
		const fakeFragmentMarkersInMap = this._getAllFakeMarkersFromElement( writer, rootElement );

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

						const endPosition = writer.createPositionAt( rootElement, 'end' );
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
	 * Returns object that contains mapping between marker names and corresponding fake-marker elements.
	 * Function returns fake-markers elements that starts or ends or are present inside selected fragment.
	 * Markers that start before and end after of specified fragment are not returned at all.
	 *
	 * @param writer An instance of the model writer.
	 * @param element The element to be checked.
	 */
	private _getAllFakeMarkersFromElement( writer: Writer, element: Element | DocumentFragment ): Record<string, Array<Element>> {
		return Array
			.from( writer.createRangeIn( element ) )
			.reduce<Record<string, Array<Element>>>( ( fakeMarkerElements, { item } ) => {
				if ( item.is( 'element', '$marker' ) ) {
					const fakeMarkerName = item.getAttribute( 'data-name' ) as string | undefined;

					( fakeMarkerElements[ fakeMarkerName! ] ||= [] ).push( item );
				}

				return fakeMarkerElements;
			}, {} );
	}

	/**
	 * When copy of markers occurs we have to make sure that pasted markers have different names
	 * than source markers. This functions helps with assigning unique part to marker name to
	 * prevent duplicated markers error.
	 *
	 * @param name Name of marker
	 */
	private _genUniqMarkerName( name: string ) {
		const parts = name.split( ':' );
		const newId = uid();

		// It looks like the marker already is UID marker so in this scenario just swap
		// last part of marker name and assign new UID.
		//
		// example: comment:{ threadId }:{ id } => comment:{ threadId }:{ newId }
		if ( parts.length === 3 ) {
			return `${ parts.slice( 0, 2 ).join( ':' ) }:${ newId }`;
		}

		// Assign new segment to marker name with id.
		//
		// example: comment => comment:{ newId }
		return `${ parts.join( ':' ) }:${ newId }`;
	}
}

/**
 * Specifies which action is performed during clipboard event.
 *
 * @internal
 */
export type ClipboardMarkerAction = 'copy' | 'cut' | 'dragstart';
