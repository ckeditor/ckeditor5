/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findandreplaceediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { updateFindResultFromRange } from './utils';
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

// Reacts to document changes in order to update search list.
function onDocumentChange( results, model, searchCallback ) {
	const changedNodes = new Set();
	const removedMarkers = new Set();

	const changes = model.document.differ.getChanges();

	// Get nodes in which changes happened to re-run a search callback on them.
	changes.forEach( change => {
		if ( change.name === '$text' || model.schema.isInline( change.position.nodeAfter ) ) {
			changedNodes.add( change.position.parent );

			[ ...model.markers.getMarkersAtPosition( change.position ) ].forEach( markerAtChange => {
				removedMarkers.add( markerAtChange.name );
			} );
		} else if ( change.type === 'insert' ) {
			changedNodes.add( change.position.nodeAfter );
		}
	} );

	// Get markers from removed nodes also.
	model.document.differ.getChangedMarkers().forEach( ( { name, data: { newRange } } ) => {
		if ( newRange && newRange.start.root.rootName === '$graveyard' ) {
			removedMarkers.add( name );
		}
	} );

	// Get markers from the updated nodes and remove all (search will be re-run on these nodes).
	changedNodes.forEach( node => {
		const markersInNode = [ ...model.markers.getMarkersIntersectingRange( model.createRangeIn( node ) ) ];

		markersInNode.forEach( marker => removedMarkers.add( marker.name ) );
	} );

	// Remove results & markers from the changed part of content.
	model.change( writer => {
		removedMarkers.forEach( markerName => {
			// Remove the result first - in order to prevent rendering a removed marker.
			if ( results.has( markerName ) ) {
				results.remove( markerName );
			}

			writer.removeMarker( markerName );
		} );
	} );

	// Run search callback again on updated nodes.
	changedNodes.forEach( nodeToCheck => {
		updateFindResultFromRange( model.createRangeOn( nodeToCheck ), model, searchCallback, results );
	} );
}

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
		 * The collection of currently highlighted search results.
		 *
		 * @private
		 * @member {module:utils/collection~Collection} #_activeResults
		 */
		this._activeResults = null;

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

		/* istanbul ignore next */
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
		const { model } = editor;

		const { findCallback, results } = editor.execute( 'find', callbackOrText );

		this._activeResults = results;

		// @todo: handle this listener, another copy is in findcommand.js file.
		this.listenTo( model.document, 'change:data', () => onDocumentChange( this._activeResults, model, findCallback ) );

		return this._activeResults;
	}

	/**
	 * Stops active results from updating, and clears out the results.
	 */
	stop() {
		if ( !this._activeResults ) {
			return;
		}

		this.stopListening( this.editor.model.document );

		this.state.clear( this.editor.model );

		this._activeResults = null;
	}

	/**
	 * Sets up the commands.
	 *
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
	 * Sets up the marker downcast converters for search results highlighting.
	 *
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
