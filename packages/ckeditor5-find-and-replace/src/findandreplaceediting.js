/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findandreplaceediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { findResultsInRange, findByTextCallback } from './utils';
import FindCommand from './findcommand';
import ReplaceCommand from './replacecommand';
import ReplaceAllCommand from './replaceallcommand';
import FindNextCommand from './findnextcommand';
import FindPreviousCommand from './findpreviouscommand';
import FindAndReplaceState from './findandreplacestate';

// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import { scrollViewportToShowTarget } from '@ckeditor/ckeditor5-utils/src/dom/scroll';

import { debounce } from 'lodash-es';

import '../theme/findandreplace.css';

const HIGHLIGHT_CLASS = 'ck-find-result_selected';

/**
 * Implements the editing part for find and replace plugin. For example conversion, commands etc.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FindAndReplaceEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FindAndReplaceEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		/**
		 * An object storing the find and replace state within a given editor instance.
		 *
		 * @member {module:find-and-replace/findandreplacestate~FindAndReplaceState} #state
		 */
		this.state = new FindAndReplaceState( this.editor.model );

		this._defineConverters();
		this._defineCommands();

		this.listenTo( this.state, 'change:highlightedResult', ( eventInfo, name, newValue, oldValue ) => {
			const { model } = this.editor;

			model.change( writer => {
				if ( oldValue ) {
					const oldMatchId = oldValue.marker.name.split( ':' )[ 1 ];
					const oldMarker = model.markers.get( `findResultHighlighted:${ oldMatchId }` );

					if ( oldMarker ) {
						writer.removeMarker( oldMarker );
					}
				}

				if ( newValue ) {
					const newMatchId = newValue.marker.name.split( ':' )[ 1 ];
					writer.addMarker( `findResultHighlighted:${ newMatchId }`, {
						usingOperation: false,
						affectsData: false,
						range: newValue.marker.getRange()
					} );
				}
			} );
		} );

		const debouncedScrollListener = debounce( scrollToHighlightedResult.bind( this ), 32 );
		// Debounce scroll as highlight might be changed very frequently, e.g. when there's a replace all command.
		this.listenTo( this.state, 'change:highlightedResult', debouncedScrollListener, { priority: 'low' } );

		// It's possible that the editor will get destroyed before debounced call kicks in.
		// This would result with accessing a view three that is no longer in DOM.
		this.listenTo( this.editor, 'destroy', debouncedScrollListener.cancel );

		const model = this.editor.model;

		this.listenTo( model.document, 'change:data', () => {
			if ( !this.state.searchText ) {
				// No searching is active.
				return;
			}

			const findCallback = findByTextCallback( this.state.searchText, this.state );

			onDocumentChange( this.state.results, model, findCallback );
		} );

		function scrollToHighlightedResult( eventInfo, name, newValue ) {
			if ( newValue ) {
				const domConverter = this.editor.editing.view.domConverter;
				const viewRange = this.editor.editing.mapper.toViewRange( newValue.marker.getRange() );

				scrollViewportToShowTarget( {
					target: domConverter.viewRangeToDom( viewRange ),
					viewportOffset: 40
				} );
			}
		}
	}

	/**
	 * Initiate a search.
	 *
	 * @param {Function|String} callbackOrText
	 * @returns {module:utils/collection~Collection}
	 */
	find( callbackOrText ) {
		const { editor } = this;

		editor.execute( 'find', callbackOrText );
	}

	/**
	 * Stops active results from updating, and clears out the results.
	 */
	stop() {
		this.state.clear( this.editor.model );
	}

	/**
	 * @private
	 */
	_defineCommands() {
		this.editor.commands.add( 'find', new FindCommand( this.editor, this.state ) );
		this.editor.commands.add( 'findNext', new FindNextCommand( this.editor, this.state ) );
		this.editor.commands.add( 'findPrevious', new FindPreviousCommand( this.editor, this.state ) );
		this.editor.commands.add( 'replace', new ReplaceCommand( this.editor, this.state ) );
		this.editor.commands.add( 'replaceAll', new ReplaceAllCommand( this.editor, this.state ) );
	}

	/**
	 * @private
	 */
	_defineConverters() {
		const { editor } = this;

		// Setup the marker highlighting conversion.
		editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: 'findResult',
			view: ( { markerName } ) => {
				const [ , id ] = markerName.split( ':' );

				// Marker removal from the view has a bug: https://github.com/ckeditor/ckeditor5/issues/7499
				// A minimal option is to return a new object for each converted marker...
				return {
					name: 'span',
					classes: [ 'ck-find-result' ],
					attributes: {
						// ...however, adding a unique attribute should be future-proof..
						'data-find-result': id
					}
				};
			}
		} );

		editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: 'findResultHighlighted',
			view: ( { markerName } ) => {
				const [ , id ] = markerName.split( ':' );

				// Marker removal from the view has a bug: https://github.com/ckeditor/ckeditor5/issues/7499
				// A minimal option is to return a new object for each converted marker...
				return {
					name: 'span',
					classes: [ HIGHLIGHT_CLASS ],
					attributes: {
						// ...however, adding a unique attribute should be future-proof..
						'data-find-result': id
					}
				};
			}
		} );
	}
}

// Reacts to document changes in order to update search list.
function onDocumentChange( results, model, searchCallback ) {
	const changedNodes = new Set();
	let removedMarkers = [];

	// Only the insert / remove diffs should be handled.
	// https://github.com/cksource/ckeditor5-internal/issues/859
	const changes = model.document.differ.getChanges()
		.filter( change => [ 'insert', 'remove' ].includes( change.type ) );

	// Get nodes in which changes happened to re-run a search callback on them.
	changes.forEach( change => {
		if ( change.name === '$text' || model.schema.isInline( change.position.nodeAfter ) ) {
			changedNodes.add( change.position.parent );

			[ ...model.markers.getMarkersAtPosition( change.position ) ].forEach( markerAtChange => {
				removedMarkers.push( markerAtChange.name );
			} );
		} else if ( change.type === 'insert' ) {
			changedNodes.add( change.position.nodeAfter );
		}
	} );

	// Get markers from removed nodes also.
	model.document.differ.getChangedMarkers().forEach( ( { name, data: { newRange } } ) => {
		if ( newRange && newRange.start.root.rootName === '$graveyard' ) {
			removedMarkers.push( name );
		}
	} );

	// Get markers from the updated nodes and remove all (search will be re-run on these nodes).
	changedNodes.forEach( node => {
		const markersInNode = [ ...model.markers.getMarkersIntersectingRange( model.createRangeIn( node ) ) ];

		markersInNode.forEach( marker => removedMarkers.push( marker.name ) );
	} );

	// Only find and result markers should be removed.
	removedMarkers = removedMarkers.filter( markerName => markerName.startsWith( 'findResult:' ) );

	// Since the implemented match algorithm is typically searching outside of the changed scope (e.g. entire parent)
	// it will remove other valid markers and add them once again. It's pointless and generates extra change events.
	const proposedResults = [].concat( ...Array.from( changedNodes ).map( nodeToCheck =>
		findResultsInRange( model.createRangeOn( nodeToCheck ), model, searchCallback ) ) );

	for ( let i = proposedResults.length - 1; i >= 0; i-- ) {
		const proposedItem = proposedResults[ i ];

		for ( const removedMarkerName of removedMarkers ) {
			const removedMarker = model.markers.get( removedMarkerName );

			if ( removedMarker.getRange().isEqual( proposedItem.range ) ) {
				proposedResults.splice( i, 1 );
				removedMarkers.splice( removedMarkers.indexOf( removedMarkerName ), 1 );
				break;
			}
		}
	}

	for ( const proposedResult of proposedResults ) {
		model.change( writer => {
			const marker = writer.addMarker( proposedResult.id, {
				usingOperation: false,
				affectsData: false,
				range: proposedResult.range
			} );

			const index = findInsertIndex( results, marker );

			results.add( {
				id: proposedResult.id,
				label: proposedResult.label,
				marker
			}, index );
		} );
	}

	// Remove results & markers from the changed part of content.
	model.change( writer => {
		removedMarkers.forEach( markerName => {
			const removedResult = getResultByMarker( markerName );

			// Remove the result first - in order to prevent rendering a removed marker.
			if ( removedResult ) {
				results.remove( removedResult );
			}

			if ( model.markers.has( markerName ) ) {
				writer.removeMarker( markerName );
			}
		} );
	} );

	function getResultByMarker( markerName ) {
		for ( const result of results ) {
			if ( result.marker.name === markerName ) {
				return result;
			}
		}
	}

	function findInsertIndex( resultsList, markerToInsert ) {
		const result = resultsList.find( ( { marker } ) => {
			return markerToInsert.getStart().isBefore( marker.getStart() );
		} );

		return result ? resultsList.getIndex( result ) : resultsList.length;
	}
}
