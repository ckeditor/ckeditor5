/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module clipboard/clipboardmarkersutils
 */
import { mapValues } from 'es-toolkit/compat';

import { uid } from '@ckeditor/ckeditor5-utils';
import { Plugin, type NonEmptyArray } from '@ckeditor/ckeditor5-core';

import {
	Range,
	type DocumentFragment,
	type Position,
	type Element,
	type DocumentSelection,
	type Selection,
	type Writer,
	type Marker
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
	private _markersToCopy: Map<string, ClipboardMarkerConfiguration> = new Map();

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ClipboardMarkersUtils' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * Registers marker name as copyable in clipboard pipeline.
	 *
	 * @param markerName Name of marker that can be copied.
	 * @param config Configuration that describes what can be performed on specified marker.
	 * @internal
	 */
	public _registerMarkerToCopy( markerName: string, config: ClipboardMarkerConfiguration ): void {
		this._markersToCopy.set( markerName, config );
	}

	/**
	 * Performs copy markers on provided selection and paste it to fragment returned from `getCopiedFragment`.
	 *
	 * 	1. Picks all markers in provided selection.
	 * 	2. Inserts fake markers to document.
	 * 	3. Gets copied selection fragment from document.
	 * 	4. Removes fake elements from fragment and document.
	 * 	5. Inserts markers in the place of removed fake markers.
	 *
	 * Due to selection modification, when inserting items, `getCopiedFragment` must *always* operate on `writer.model.document.selection'.
	 * Do not use any other custom selection object within callback, as this will lead to out-of-bounds exceptions in rare scenarios.
	 *
	 * @param action Type of clipboard action.
	 * @param selection Selection to be checked.
	 * @param getCopiedFragment	Callback that performs copy of selection and returns it as fragment.
	 * @internal
	 */
	public _copySelectedFragmentWithMarkers(
		action: ClipboardMarkerRestrictedAction,
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

			const sourceSelectionInsertedMarkers = this._insertFakeMarkersIntoSelection( writer, writer.model.document.selection, action );
			const fragment = getCopiedFragment( writer );
			const fakeMarkersRangesInsideRange = this._removeFakeMarkersInsideElement( writer, fragment );

			// <fake-marker> [Foo] Bar</fake-marker>
			//      ^                    ^
			// In `_insertFakeMarkersIntoSelection` call we inserted fake marker just before first element.
			// The problem is that the first element can be start position of selection so insertion fake-marker
			// before such element shifts selection (so selection that was at [0, 0] now is at [0, 1]).
			// It means that inserted fake-marker is no longer present inside such selection and is orphaned.
			// This function checks special case of such problem. Markers that are orphaned at the start position
			// and end position in the same time. Basically it means that they overlaps whole element.
			for ( const [ markerName, elements ] of Object.entries( sourceSelectionInsertedMarkers ) ) {
				fakeMarkersRangesInsideRange[ markerName ] ||= writer.createRangeIn( fragment );

				for ( const element of elements ) {
					writer.remove( element );
				}
			}

			fragment.markers.clear();

			for ( const [ markerName, range ] of Object.entries( fakeMarkersRangesInsideRange ) ) {
				fragment.markers.set( markerName, range );
			}

			// Revert back selection to previous one.
			writer.setSelection( oldSelection );

			return fragment;
		} );
	}

	/**
	 * Performs paste of markers on already pasted element.
	 *
	 * 	1. Inserts fake markers that are present in fragment element (such fragment will be processed in `getPastedDocumentElement`).
	 * 	2. Calls `getPastedDocumentElement` and gets element that is inserted into root model.
	 * 	3. Removes all fake markers present in transformed element.
	 * 	4. Inserts new markers with removed fake markers ranges into pasted fragment.
	 *
	 * There are multiple edge cases that have to be considered before calling this function:
	 *
	 * 	* `markers` are inserted into the same element that must be later transformed inside `getPastedDocumentElement`.
	 * 	* Fake marker elements inside `getPastedDocumentElement` can be cloned, but their ranges cannot overlap.
	 * 	* If `duplicateOnPaste` is `true` in marker config then associated marker ID is regenerated before pasting.
	 *
	 * @param markers Object that maps marker name to corresponding range.
	 * @param getPastedDocumentElement Getter used to get target markers element.
	 * @internal
	 */
	public _pasteMarkersIntoTransformedElement(
		markers: Record<string, Range> | Map<string, Range>,
		getPastedDocumentElement: ( writer: Writer ) => Element
	): Element {
		const pasteMarkers = this._getPasteMarkersFromRangeMap( markers );

		return this.editor.model.change( writer => {
			// Inserts fake markers into source fragment / element that is later transformed inside `getPastedDocumentElement`.
			const sourceFragmentFakeMarkers = this._insertFakeMarkersElements( writer, pasteMarkers );

			// Modifies document fragment (for example, cloning table cells) and then inserts it into the document.
			const transformedElement = getPastedDocumentElement( writer );

			// Removes markers in pasted and transformed fragment in root document.
			const removedFakeMarkers = this._removeFakeMarkersInsideElement( writer, transformedElement );

			// Cleans up fake markers inserted into source fragment (that one before transformation which is not pasted).
			for ( const element of Object.values( sourceFragmentFakeMarkers ).flat() ) {
				writer.remove( element );
			}

			// Inserts to root document fake markers.
			for ( const [ markerName, range ] of Object.entries( removedFakeMarkers ) ) {
				if ( !writer.model.markers.has( markerName ) ) {
					writer.addMarker( markerName, {
						usingOperation: true,
						affectsData: true,
						range
					} );
				}
			}

			return transformedElement;
		} );
	}

	/**
	 * Pastes document fragment with markers to document.
	 * If `duplicateOnPaste` is `true` in marker config then associated markers IDs
	 * are regenerated before pasting to avoid markers duplications in content.
	 *
	 * @param fragment Document fragment that should contain already processed by pipeline markers.
	 * @internal
	 */
	public _pasteFragmentWithMarkers( fragment: DocumentFragment ): Range {
		const pasteMarkers = this._getPasteMarkersFromRangeMap( fragment.markers );

		fragment.markers.clear();

		for ( const copyableMarker of pasteMarkers ) {
			fragment.markers.set( copyableMarker.name, copyableMarker.range );
		}

		return this.editor.model.insertContent( fragment );
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
	 * @param config Optional configuration flags used to copy (such like partial copy flag).
	 * @internal
	 */
	public _forceMarkersCopy(
		markerName: string,
		executor: VoidFunction,
		config: ClipboardMarkerConfiguration = {
			allowedActions: 'all',
			copyPartiallySelected: true,
			duplicateOnPaste: true
		}
	): void {
		const before = this._markersToCopy.get( markerName );

		this._markersToCopy.set( markerName, config );

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
	 * @param action Type of clipboard action. If null then checks only if marker is registered as copyable.
	 * @internal
	 */
	public _isMarkerCopyable( markerName: string, action: ClipboardMarkerRestrictedAction | null ): boolean {
		const config = this._getMarkerClipboardConfig( markerName );

		if ( !config ) {
			return false;
		}

		// If there is no action provided then only presence of marker is checked.
		if ( !action ) {
			return true;
		}

		const { allowedActions } = config;

		return allowedActions === 'all' || allowedActions.includes( action );
	}

	/**
	 * Checks if marker has any clipboard copy behavior configuration.
	 *
	 * @param markerName Name of checked marker.
	 */
	public _hasMarkerConfiguration( markerName: string ): boolean {
		return !!this._getMarkerClipboardConfig( markerName );
	}

	/**
	 * Returns marker's configuration flags passed during registration.
	 *
	 * @param markerName Name of marker that should be returned.
	 * @internal
	 */
	public _getMarkerClipboardConfig( markerName: string ): ClipboardMarkerConfiguration | null {
		const [ markerNamePrefix ] = markerName.split( ':' );

		return this._markersToCopy.get( markerNamePrefix ) || null;
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
	private _insertFakeMarkersIntoSelection(
		writer: Writer,
		selection: Selection | DocumentSelection,
		action: ClipboardMarkerRestrictedAction
	): Record<string, Array<Element>> {
		const copyableMarkers = this._getCopyableMarkersFromSelection( writer, selection, action );

		return this._insertFakeMarkersElements( writer, copyableMarkers );
	}

	/**
	 * Returns array of markers that can be copied in specified selection.
	 *
	 * If marker cannot be copied partially (according to `copyPartiallySelected` configuration flag) and
	 * is not present entirely in any selection range then it will be skipped.
	 *
	 * @param writer An instance of the model writer.
	 * @param selection  Selection which will be checked.
	 * @param action Type of clipboard action. If null then checks only if marker is registered as copyable.
	 */
	private _getCopyableMarkersFromSelection(
		writer: Writer,
		selection: Selection | DocumentSelection,
		action: ClipboardMarkerRestrictedAction | null
	): Array<CopyableMarker> {
		const selectionRanges = Array.from( selection.getRanges()! );

		// Picks all markers in provided ranges. Ensures that there are no duplications if
		// there are multiple ranges that intersects with the same marker.
		const markersInRanges = new Set(
			selectionRanges.flatMap(
				selectionRange => Array.from( writer.model.markers.getMarkersIntersectingRange( selectionRange ) )
			)
		);

		const isSelectionMarkerCopyable = ( marker: Marker ) => {
			// Check if marker exists in configuration and provided action can be performed on it.
			const isCopyable = this._isMarkerCopyable( marker.name, action );

			if ( !isCopyable ) {
				return false;
			}

			// Checks if configuration disallows to copy marker only if part of its content is selected.
			//
			// Example:
			// 	<marker-a> Hello [ World ] </marker-a>
			//						^ selection
			//
			// In this scenario `marker-a` won't be copied because selection doesn't overlap its content entirely.
			const { copyPartiallySelected } = this._getMarkerClipboardConfig( marker.name )!;

			if ( !copyPartiallySelected ) {
				const markerRange = marker.getRange();

				return selectionRanges.some( selectionRange => selectionRange.containsRange( markerRange, true ) );
			}

			return true;
		};

		return Array
			.from( markersInRanges )
			.filter( isSelectionMarkerCopyable )
			.map( ( copyableMarker ): CopyableMarker => {
				// During `dragstart` event original marker is still present in tree.
				// It is removed after the clipboard drop event, so none of the copied markers are inserted at the end.
				// It happens because there already markers with specified `marker.name` when clipboard is trying to insert data
				// and it aborts inserting.
				const name = action === 'dragstart' ? this._getUniqueMarkerName( copyableMarker.name ) : copyableMarker.name;

				return {
					name,
					range: copyableMarker.getRange()
				};
			} );
	}

	/**
	 * Picks all markers from markers map that can be pasted.
	 * If `duplicateOnPaste` is `true`, it regenerates their IDs to ensure uniqueness.
	 * If marker is not registered, it will be kept in the array anyway.
	 *
	 * @param markers Object that maps marker name to corresponding range.
	 * @param action Type of clipboard action. If null then checks only if marker is registered as copyable.
	 */
	private _getPasteMarkersFromRangeMap(
		markers: Record<string, Range> | Map<string, Range>,
		action: ClipboardMarkerRestrictedAction | null = null
	): Array<CopyableMarker> {
		const { model } = this.editor;
		const entries = markers instanceof Map ? Array.from( markers.entries() ) : Object.entries( markers );

		return entries.flatMap( ( [ markerName, range ] ): Array<CopyableMarker> => {
			if ( !this._hasMarkerConfiguration( markerName ) ) {
				return [
					{
						name: markerName,
						range
					}
				];
			}

			if ( this._isMarkerCopyable( markerName, action ) ) {
				const copyMarkerConfig = this._getMarkerClipboardConfig( markerName )!;
				const isInGraveyard = model.markers.has( markerName ) &&
					model.markers.get( markerName )!.getRange().root.rootName === '$graveyard';

				if ( copyMarkerConfig.duplicateOnPaste || isInGraveyard ) {
					markerName = this._getUniqueMarkerName( markerName );
				}

				return [
					{
						name: markerName,
						range
					}
				];
			}

			return [];
		} );
	}

	/**
	 * Inserts specified array of fake markers elements to document and assigns them `type` and `name` attributes.
	 * Fake markers elements are used to calculate position of markers on pasted fragment that were transformed during
	 * steps between copy and paste.
	 *
	 * @param writer An instance of the model writer.
	 * @param markers Array of markers that will be inserted.
	 */
	private _insertFakeMarkersElements( writer: Writer, markers: Array<CopyableMarker> ): Record<string, Array<Element>> {
		const mappedMarkers: Record<string, Array<Element>> = {};
		const sortedMarkers = markers
			.flatMap( marker => {
				const { start, end } = marker.range;

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

			if ( !mappedMarkers[ marker.name ] ) {
				mappedMarkers[ marker.name ] = [];
			}

			mappedMarkers[ marker.name ]!.push( fakeMarker );
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
		const fakeMarkersElements = this._getAllFakeMarkersFromElement( writer, rootElement );
		const fakeMarkersRanges = fakeMarkersElements.reduce<Record<string, FakeMarkerRangeConstruct>>( ( acc, fakeMarker ) => {
			const position = fakeMarker.markerElement && writer.createPositionBefore( fakeMarker.markerElement );
			let prevFakeMarker: FakeMarkerRangeConstruct | null = acc[ fakeMarker.name ];

			// Handle scenario when tables clone cells with the same fake node. Example:
			//
			// <cell><fake-marker-a></cell> <cell><fake-marker-a></cell> <cell><fake-marker-a></cell>
			//                                          ^ cloned                    ^ cloned
			//
			// The easiest way to bypass this issue is to rename already existing in map nodes and
			// set them new unique name.
			let skipAssign = false;

			if ( prevFakeMarker?.start && prevFakeMarker?.end ) {
				const config = this._getMarkerClipboardConfig( fakeMarker.name )!;

				if ( config.duplicateOnPaste ) {
					acc[ this._getUniqueMarkerName( fakeMarker.name ) ] = acc[ fakeMarker.name ];
				} else {
					skipAssign = true;
				}

				prevFakeMarker = null;
			}

			if ( !skipAssign ) {
				acc[ fakeMarker.name ] = {
					...prevFakeMarker!,
					[ fakeMarker.type ]: position
				};
			}

			if ( fakeMarker.markerElement ) {
				writer.remove( fakeMarker.markerElement );
			}

			return acc;
		}, {} );

		// We cannot construct ranges directly in previous reduce because element ranges can overlap.
		// In other words lets assume we have such scenario:

		// <fake-marker-start /> <paragraph /> <fake-marker-2-start /> <fake-marker-end /> <fake-marker-2-end />
		//
		// We have to remove `fake-marker-start` firstly and then remove `fake-marker-2-start`.
		// Removal of `fake-marker-2-start` affects `fake-marker-end` position so we cannot create
		// connection between `fake-marker-start` and `fake-marker-end` without iterating whole set firstly.
		return mapValues(
			fakeMarkersRanges,
			range => new Range(
				range.start || writer.createPositionFromPath( rootElement, [ 0 ] ),
				range.end || writer.createPositionAt( rootElement, 'end' )
			)
		);
	}

	/**
	 * Returns array that contains list of fake markers with corresponding `$marker` elements.
	 *
	 * For each marker, there can be two `$marker` elements or only one (if the document fragment contained
	 * only the beginning or only the end of a marker).
	 *
	 * @param writer An instance of the model writer.
	 * @param rootElement The element to be checked.
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
export type ClipboardMarkerRestrictedAction = 'copy' | 'cut' | 'dragstart';

/**
 * Specifies behavior of markers during clipboard actions.
 *
 * @internal
 */
export type ClipboardMarkerConfiguration = {
	allowedActions: NonEmptyArray<ClipboardMarkerRestrictedAction> | 'all';

	// If `false`, do not copy marker when only part of its content is selected.
	copyPartiallySelected?: boolean;

	// If `true` then every marker that is present in clipboard document fragment element obtain new generated ID just before pasting.
	// It means that it is possible to perform copy once and then paste it multiple times wherever we want.
	//
	// On the other hand if it has false value the marker will be not pasted because ID already exists in the document.
	//
	// This flag is ignored in `cut` and `dragstart` actions because source marker is moved to graveyard and
	// it is still present in `model.markers`. Pasted marker id must be regenerated to avoid duplications.
	duplicateOnPaste?: boolean;
};

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

/**
 * Range used to construct real markers from fake markers. Every property must be optional
 * because real marker range is constructed using iteration over markers that represent `start`
 * and then `end`. Usually `start` is set firstly then after few nodes `end` is set.
 *
 * @internal
 */
type FakeMarkerRangeConstruct = {
	start: Position | null;
	end: Position | null;
};

/**
 * Structure used to describe marker that has to be copied.
 *
 * @internal
 */
type CopyableMarker = {
	name: string;
	range: Range;
};
