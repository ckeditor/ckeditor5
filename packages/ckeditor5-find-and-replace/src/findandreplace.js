/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findandreplace
 */

import { Plugin } from 'ckeditor5/src/core';
import { Collection } from 'ckeditor5/src/utils';
import FindAndReplaceUI from './findandreplaceui';
import FindAndReplaceEditing from './findandreplaceediting';

import { updateFindResultFromRange } from './utils';

const HIGHLIGHT_CLASS = 'find-result_selected';

function regexpMatchToFindResult( matchResult ) {
	return {
		label: matchResult[ 0 ],
		start: matchResult.index,
		end: matchResult.index + matchResult[ 0 ].length
	};
}

function findByTextCallback( searchTerm ) {
	const regExp = new RegExp( `${ searchTerm }`, 'igu' );

	function findCallback( { text } ) {
		const matches = [ ...text.matchAll( regExp ) ];

		return matches.map( regexpMatchToFindResult );
	}

	return findCallback;
}

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
		if ( newRange.start.root.rootName === '$graveyard' ) {
			removedMarkers.add( name );
		}
	} );

	// Get markers from updated nodes and remove all (search will be re-run on those nodes).
	changedNodes.forEach( node => {
		const markersInNode = [ ...model.markers.getMarkersIntersectingRange( model.createRangeIn( node ) ) ];

		markersInNode.forEach( marker => removedMarkers.add( marker.name ) );
	} );

	// Remove results & markers from changed part of content.
	model.change( writer => {
		removedMarkers.forEach( markerName => {
			// Remove result first - in order to prevent rendering removed marker.
			results.remove( markerName );
			writer.removeMarker( markerName );
		} );
	} );

	// Run search callback again on updated nodes.
	changedNodes.forEach( nodeToCheck => {
		updateFindResultFromRange( model.createRangeOn( nodeToCheck ), model, searchCallback, results );
	} );
}

function getDefaultCallback( textOrCallback ) {
	return writer => {
		return writer.createText( textOrCallback );
	};
}

function isPositionInRangeBoundaries( range, position ) {
	return range.containsPosition( position ) || range.end.isEqual( position ) || range.start.isEqual( position );
}

function setupSelectedResultHighlighting( editor ) {
	const { view } = editor.editing;
	const { model } = editor;
	const highlightedMarkers = new Set();

	const getMarkerAtPosition = position =>
		[ ...editor.model.markers ].find( marker => {
			return isPositionInRangeBoundaries( marker.getRange(), position ) && marker.name.startsWith( 'findResult:' );
		} );

	view.document.registerPostFixer( writer => {
		const modelSelection = model.document.selection;

		const marker = getMarkerAtPosition( modelSelection.focus );

		if ( !marker ) {
			return;
		}

		[ ...editor.editing.mapper.markerNameToElements( marker.name ) ].forEach( viewElement => {
			writer.addClass( HIGHLIGHT_CLASS, viewElement );
			highlightedMarkers.add( viewElement );
		} );
	} );

	function removeHighlight() {
		view.change( writer => {
			[ ...highlightedMarkers.values() ].forEach( item => {
				writer.removeClass( HIGHLIGHT_CLASS, item );
				highlightedMarkers.delete( item );
			} );
		} );
	}

	// Removing the class.
	editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
		// Make sure the highlight is removed on every possible event, before conversion is started.
		dispatcher.on( 'insert', removeHighlight, { priority: 'highest' } );
		dispatcher.on( 'remove', removeHighlight, { priority: 'highest' } );
		dispatcher.on( 'attribute', removeHighlight, { priority: 'highest' } );
		dispatcher.on( 'selection', removeHighlight, { priority: 'highest' } );
	} );
}

/**
 * The find and replace plugin.
 *
 * For a detailed overview, check the {@glink features/find-and-replace Find and replace feature documentation}.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * The {@link module:find-and-replace/findandreplaceediting~FindAndReplaceEditing find and replace editing feature},
 * * The {@link module:find-and-replace/findandreplaceui~FindAndReplaceUI find and replace UI feature} and
 *
 * @extends module:core/plugin~Plugin
 */
export default class FindAndReplace extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FindAndReplaceEditing, FindAndReplaceUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FindAndReplace';
	}

	init() {
		// Setup marker highlighting conversion.
		this.editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: 'findResult',
			view: ( { markerName } ) => {
				const [ , id ] = markerName.split( ':' );

				// Marker removal from the view has a bug: https://github.com/ckeditor/ckeditor5/issues/7499
				// A minimal option is to return a new object for each converted marker...
				return {
					name: 'span',
					classes: [ 'find-result' ],
					attributes: {
						// ...however, adding a unique attribute should be future-proof..
						'data-find-result': id
					}
				};
			}
		} );

		const ui = this.editor.plugins.get( 'FindAndReplaceUI' );

		/**
		 * findNext button logic
		 */
		ui.on( 'findNext', ( event, data ) => {
			if ( data.searchText.length !== 0 ) {
				this.stop();
			}

			this.find( data.searchText );
		} );

		/**
		 * FindPrev button logic
		 */
		ui.on( 'findPrev', ( event, data ) => {
			if ( data.searchText.length !== 0 ) {
				this.stop();
			}
			this.find( data.searchText );
		} );

		/**
		 * Replace button logic
		 */
		ui.on( 'replace', ( event, data ) => {
			// TODO: the { marker } needs to be passed down to the .replace()
			this.replace( data.marker, data.replaceText );
		} );

		/**
		 * Replace all button logic
		 */
		ui.on( 'replaceAll', ( event, data ) => {
			this.replaceAll( data.replaceText );
		} );

		setupSelectedResultHighlighting( this.editor );

		this.activeResults = null;
	}

	/**
	 * Initiate a search.
	 *
	 * @param {Function|String} callbackOrText
	 */
	find( callbackOrText ) {
		const { editor } = this;
		const { model } = editor;

		let findCallback;

		// Allow to execute `find()` on a plugin with a keyword only.
		if ( typeof callbackOrText === 'string' ) {
			findCallback = findByTextCallback( callbackOrText );
		} else {
			findCallback = callbackOrText;
		}

		const results = new Collection();

		// Initial search is done on all nodes inside content.
		const range = model.createRangeIn( model.document.getRoot() );

		updateFindResultFromRange( range, model, findCallback, results );

		this.listenTo( model.document, 'change:data', () => onDocumentChange( results, model, findCallback ) );

		this.activeResults = results;

		return this.activeResults;
	}

	/**
	 * Stops active results from updating.
	 */
	stop() {
		if ( !this.activeResults ) {
			return;
		}

		this.stopListening( this.editor.model.document );

		// Remove all markers from the editor.
		this.editor.model.change( writer => {
			[ ...this.activeResults ].forEach( ( { marker } ) => {
				writer.removeMarker( marker );
			} );
		} );

		this.activeResults = null;
	}

	/**
	 * Replace given find result by a string or a callback.
	 *
	 * @param result
	 * @param {String|Function} textOrCallback
	 */
	replace( { marker }, textOrCallback ) {
		const { model } = this.editor;

		const callback = typeof textOrCallback === 'function' ? textOrCallback : getDefaultCallback( textOrCallback );

		model.change( writer => {
			const range = marker.getRange();

			model.insertContent( callback( writer ), range );
		} );
	}

	/**
	 * Replaces all find results by a string or a callback.
	 *
	 * @param {String|Function} textOrCallback
	 */
	replaceAll( textOrCallback ) {
		if ( !this.activeResults ) {
			return;
		}

		this.editor.model.change( () => {
			[ ...this.activeResults ].forEach( replace => {
				this.replace( replace, textOrCallback );
			} );
		} );
	}
}
