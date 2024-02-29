/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/clipboardmarkersutils
 */

import { uid } from '@ckeditor/ckeditor5-utils';
import { Plugin } from '@ckeditor/ckeditor5-core';

import {
	Range,
	type Position,
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
	private _markersToCopy: Map<string, Array<ClipboardMarkerAction>> = new Map();

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ClipboardMarkersUtils' as const;
	}

	/**
	 * In some situations we have to perform copy on selected fragment with certain markers. This function allows to temporarily bypass
	 * restrictions on markers that we want to copy.
	 *
	 * This function executes `executor()` callback. For the duration of the callback, if the clipboard pipeline is used to copy
	 * content, markers with the specified name will be copied to the clipboard as well.
	 *
	 * @param markerName Which markers should be copied.
	 * @param executor Callback executed.
	 * @internal
	 */
	public _forceMarkersCopy( markerName: string, executor: VoidFunction ): void {
		const before = this._markersToCopy.get( markerName );

		this._markersToCopy.set( markerName, [ 'copy', 'cut', 'dragstart' ] );

		executor();

		if ( before ) {
			this._markersToCopy.set( markerName, before );
		} else {
			this._markersToCopy.delete( markerName );
		}
	}

	/**
	 * Checks if marker can be copied.
	 *
	 * @param markerName Name of checked marker.
	 * @internal
	 */
	public _canPerformMarkerClipboardAction( markerName: string, action: ClipboardMarkerAction ): boolean {
		const [ markerNamePrefix ] = markerName.split( ':' );
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
		getCopiedFragment: ( writer: Writer ) => DocumentFragment = writer =>
			writer.model.getSelectedContent( writer.model.document.selection )
	): DocumentFragment {
		return this.editor.model.change( writer => {
			const oldSelection = writer.model.document.selection;

			// In some scenarios, such like in drag & drop, passed `selection` parameter is not actually
			// the same `selection` as the `writer.model.document.selection` which means that `_insertFakeMarkersToSelection`
			// is not affecting passed `selection` `start` and `end` positions but rather modifies `writer.model.document.selection`.
			//
			// It is critical due to fact that when we have selection that starts [ 0, 0 ] and ends at [ 1, 0 ]
			// and after inserting fake marker it will point to such marker instead of new widget position at start: [ 1, 0 ] end: [2, 0 ].
			// `writer.insert` modifies only original `writer.model.document.selection`.
			writer.setSelection( selection );

			const sourceSelectionInsertedMarkers = this._insertFakeMarkersToSelection( writer, writer.model.document.selection, action );
			const fragment = getCopiedFragment( writer );

			this._hydrateCopiedFragmentWithMarkers( writer, fragment, sourceSelectionInsertedMarkers );

			// Revert back selection to previous one.
			writer.setSelection( oldSelection );

			return fragment;
		} );
	}

	/**
	 * Changes marker names for markers stored in given document fragment so that they are unique.
	 *
	 * @param fragment
	 * @internal
	 */
	public _setUniqueMarkerNamesInFragment( fragment: DocumentFragment ): void {
		const markers = Array.from( fragment.markers );

		fragment.markers.clear();

		for ( const [ name, range ] of markers ) {
			fragment.markers.set( this._getUniqueMarkerName( name ), range );
		}
	}

	/**
	 * First step of copying markers. It looks for markers intersecting with given selection and inserts `$marker` elements
	 * at positions where document markers start or end. This way `$marker` elements can be easily copied together with
	 * the rest of the content of the selection.
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
	 * Calculates positions for marker ranges using fake markers that are present inside fragment. The markers are added to
	 * `DocumentFragment#markers` property. It also removes `$marker` elements stored in `insertedFakeMarkersElements` from the model.
	 *
	 * @param writer An instance of the model writer.
	 * @param fragment Document fragment to be checked.
	 * @param sourceFakeMarkers Fake markers inserted into source of copy.
	 */
	private _hydrateCopiedFragmentWithMarkers(
		writer: Writer,
		fragment: DocumentFragment,
		sourceFakeMarkers: Map<Marker, Array<Element>>
	): void {
		const fakeMarkersRangesInsideRange = this._removeFakeMarkersInsideElement( writer, fragment );

		for ( const [ marker, range ] of Object.entries( fakeMarkersRangesInsideRange ) ) {
			fragment.markers.set( marker, range );
		}

		// <fake-marker> [Foo] Bar</fake-marker>
		//      ^                    ^
		// Handle case when selection is inside marker.
		for ( const [ marker, elements ] of sourceFakeMarkers.entries() ) {
			if ( !fakeMarkersRangesInsideRange[ marker.name ] ) {
				fragment.markers.set( marker.name, writer.createRangeIn( fragment ) );
			}

			for ( const element of elements ) {
				writer.remove( element );
			}
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
			.filter( marker => this._canPerformMarkerClipboardAction( marker.name, action ) );
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
	 * Removes all `$marker` elements from the given document fragment.
	 *
	 * Returns an object where keys are marker names, and values are ranges corresponding to positions
	 * where `$marker` elements were inserted.
	 *
	 * If the document fragment had only one `$marker` element for given marker (start or end) the other boundary is set automatically
	 * (to the end or start of the document fragment, respectively).
	 *
	 * @param writer An instance of the model writer.
	 * @param rootElement The element to be checked.
	 */
	private _removeFakeMarkersInsideElement( writer: Writer, rootElement: Element | DocumentFragment ): Record<string, Range> {
		type ReducedMarkersMap = Record<string, { start: Position | null; end: Position | null }>;

		const fakeMarkersElements = this._getAllFakeMarkersFromElement( writer, rootElement );
		const fakeMarkersRanges = fakeMarkersElements
			.reduce<ReducedMarkersMap>( ( acc, fakeMarker ) => {
				const position = fakeMarker.markerElement ? writer.createPositionBefore( fakeMarker.markerElement ) : null;

				acc[ fakeMarker.name ] = {
					...acc[ fakeMarker.name ],
					[ fakeMarker.type ]: position
				};

				if ( fakeMarker.markerElement ) {
					writer.remove( fakeMarker.markerElement );
				}

				return acc;
			}, {} );

		return Object.fromEntries(
			Object
				.entries( fakeMarkersRanges )
				.map( ( [ markerName, maybeRange ] ) => [
					markerName,
					new Range(
						maybeRange.start || writer.createPositionFromPath( rootElement, [ 0 ] ),
						maybeRange.end || writer.createPositionAt( rootElement, 'end' ) )
				] )
		);
	}

	/**
	 * Returns object that contains mapping between marker names and corresponding `$marker` elements.
	 *
	 * For each marker, there can be two `$marker` elements or only one (if the document fragment contained
	 * only the beginning or only the end of a marker).
	 *
	 * @param writer An instance of the model writer.
	 * @param element The element to be checked.
	 */
	private _getAllFakeMarkersFromElement( writer: Writer, rootElement: Element | DocumentFragment ): Array<FakeMarker> {
		const foundFakeMarkers = Array
			.from( writer.createRangeIn( rootElement ) )
			.flatMap( ( { item } ): Array<FakeMarker> => {
				if ( !item.is( 'element', '$marker' ) ) {
					return [];
				}

				const name = item.getAttribute( 'data-name' ) as string;
				const type = item.getAttribute( 'data-type' ) as 'start' | 'end';

				return [
					{
						markerElement: item,
						name,
						type
					}
				];
			} );

		const prependFakeMarkers: Array<FakeMarker> = [];
		const appendFakeMarkers: Array<FakeMarker> = [];

		for ( const fakeMarker of foundFakeMarkers ) {
			if ( fakeMarker.type === 'end' ) {
				// <fake-marker> [ phrase</fake-marker> phrase ]
				//   ^
				// Handle case when marker is just before start of selection.
				// Only end marker is inside selection.

				const hasMatchingStartMarker = foundFakeMarkers.some(
					otherFakeMarker => otherFakeMarker.name === fakeMarker.name && otherFakeMarker.type === 'start'
				);

				if ( !hasMatchingStartMarker ) {
					prependFakeMarkers.push( {
						markerElement: null,
						name: fakeMarker.name,
						type: 'start'
					} );
				}
			}

			if ( fakeMarker.type === 'start' ) {
				// [<fake-marker>phrase]</fake-marker>
				//                           ^
				// Handle case when fake marker is after selection.
				// Only start marker is inside selection.

				const hasMatchingEndMarker = foundFakeMarkers.some(
					otherFakeMarker => otherFakeMarker.name === fakeMarker.name && otherFakeMarker.type === 'end'
				);

				if ( !hasMatchingEndMarker ) {
					appendFakeMarkers.unshift( {
						markerElement: null,
						name: fakeMarker.name,
						type: 'end'
					} );
				}
			}
		}

		return [
			...prependFakeMarkers,
			...foundFakeMarkers,
			...appendFakeMarkers
		];
	}

	/**
	 * When copy of markers occurs we have to make sure that pasted markers have different names
	 * than source markers. This functions helps with assigning unique part to marker name to
	 * prevent duplicated markers error.
	 *
	 * @param name Name of marker
	 */
	private _getUniqueMarkerName( name: string ) {
		const parts = name.split( ':' );
		const newId = uid().substring( 1, 6 );

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

/**
 * Marker descriptor type used to revert markers into tree node.
 *
 * @internal
 */
type FakeMarker = {
	type: 'start' | 'end';
	name: string;
	markerElement: Element | null;
};
