/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/htmlcomment
 */

import { Plugin } from 'ckeditor5/src/core';
import { uid } from 'ckeditor5/src/utils';

/**
 * The HTML comment feature. It preserves the HTML comments (`<!-- -->`) in the editor data.
 *
 * For a detailed overview, check the {@glink features/html/html-comments HTML comment feature documentation}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HtmlComment extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'HtmlComment';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.data.processor.skipComments = false;

		// Allow storing comment's content as the $root attribute with the name `$comment:<unique id>`.
		editor.model.schema.addAttributeCheck( ( context, attributeName ) => {
			if ( context.endsWith( '$root' ) && attributeName.startsWith( '$comment' ) ) {
				return true;
			}
		} );

		// Convert the `$comment` view element to `$comment:<unique id>` marker and store its content (the comment itself) as a $root
		// attribute. The comment content is needed in the `dataDowncast` pipeline to re-create the comment node.
		editor.conversion.for( 'upcast' ).elementToMarker( {
			view: '$comment',
			model: ( viewElement, { writer } ) => {
				const root = this.editor.model.document.getRoot();
				const commentContent = viewElement.getCustomProperty( '$rawContent' );
				const markerName = `$comment:${ uid() }`;

				writer.setAttribute( markerName, commentContent, root );

				return markerName;
			}
		} );

		// Convert the `$comment` marker to `$comment` UI element with `$rawContent` custom property containing the comment content.
		editor.conversion.for( 'dataDowncast' ).markerToElement( {
			model: '$comment',
			view: ( modelElement, { writer } ) => {
				const root = this.editor.model.document.getRoot();
				const markerName = modelElement.markerName;
				const commentContent = root.getAttribute( markerName );
				const comment = writer.createUIElement( '$comment' );

				writer.setCustomProperty( '$rawContent', commentContent, comment );

				return comment;
			}
		} );

		// Remove comments' markers and their corresponding $root attributes, which are no longer present.
		editor.model.document.registerPostFixer( writer => {
			const root = editor.model.document.getRoot();

			const changedMarkers = editor.model.document.differ.getChangedMarkers();

			const changedCommentMarkers = changedMarkers.filter( marker => {
				return marker.name.startsWith( '$comment' );
			} );

			const removedCommentMarkers = changedCommentMarkers.filter( marker => {
				const newRange = marker.data.newRange;

				return newRange && newRange.root.rootName === '$graveyard';
			} );

			if ( removedCommentMarkers.length === 0 ) {
				return false;
			}

			for ( const marker of removedCommentMarkers ) {
				writer.removeMarker( marker.name );
				writer.removeAttribute( marker.name, root );
			}

			return true;
		} );

		// Delete all comment markers from the document before setting new data.
		editor.data.on( 'set', () => {
			for ( const commentMarker of editor.model.markers.getMarkersGroup( '$comment' ) ) {
				this.removeHtmlComment( commentMarker.name );
			}
		}, { priority: 'high' } );

		// Delete all comment markers that are within a removed range.
		// Delete all comment markers at the limit element boundaries if the whole content of the limit element is removed.
		editor.model.on( 'deleteContent', ( evt, [ selection ] ) => {
			for ( const range of selection.getRanges() ) {
				const limitElement = editor.model.schema.getLimitElement( range );
				const firstPosition = editor.model.createPositionAt( limitElement, 0 );
				const lastPosition = editor.model.createPositionAt( limitElement, 'end' );

				let affectedCommentIDs;

				if ( firstPosition.isTouching( range.start ) && lastPosition.isTouching( range.end ) ) {
					affectedCommentIDs = this.getHtmlCommentsInRange( editor.model.createRange( firstPosition, lastPosition ) );
				} else {
					affectedCommentIDs = this.getHtmlCommentsInRange( range, { skipBoundaries: true } );
				}

				for ( const commentMarkerID of affectedCommentIDs ) {
					this.removeHtmlComment( commentMarkerID );
				}
			}
		}, { priority: 'high' } );
	}

	/**
	 * Creates an HTML comment on the specified position and returns its ID.
	 *
	 * *Note*: If two comments are created at the same position, the second comment will be inserted before the first one.
	 *
	 * @param {module:engine/model/position~Position} position
	 * @param {String} content
	 * @returns {String} Comment ID. This ID can be later used to e.g. remove the comment from the content.
	 */
	createHtmlComment( position, content ) {
		const id = uid();
		const editor = this.editor;
		const model = editor.model;
		const root = model.document.getRoot();
		const markerName = `$comment:${ id }`;

		return model.change( writer => {
			const range = writer.createRange( position );

			writer.addMarker( markerName, {
				usingOperation: true,
				affectsData: true,
				range
			} );

			writer.setAttribute( markerName, content, root );

			return markerName;
		} );
	}

	/**
	 * Removes an HTML comment with the given comment ID.
	 *
	 * It does nothing and returns `false` if the comment with the given ID does not exist.
	 * Otherwise it removes the comment and returns `true`.
	 *
	 * Note that a comment can be removed also by removing the content around the comment.
	 *
	 * @param {String} commentID The ID of the comment to be removed.
	 * @returns {Boolean} `true` when the comment with the given ID was removed, `false` otherwise.
	 */
	removeHtmlComment( commentID ) {
		const editor = this.editor;
		const root = editor.model.document.getRoot();

		const marker = editor.model.markers.get( commentID );

		if ( !marker ) {
			return false;
		}

		editor.model.change( writer => {
			writer.removeMarker( marker );
			writer.removeAttribute( commentID, root );
		} );

		return true;
	}

	/**
	 * Gets the HTML comment data for the comment with a given ID.
	 *
	 * Returns `null` if the comment does not exist.
	 *
	 * @param {String} commentID
	 * @returns {module:html-support/htmlcomment~HtmlCommentData}
	 */
	getHtmlCommentData( commentID ) {
		const editor = this.editor;
		const marker = editor.model.markers.get( commentID );
		const root = editor.model.document.getRoot();

		if ( !marker ) {
			return null;
		}

		return {
			content: root.getAttribute( commentID ),
			position: marker.getStart()
		};
	}

	/**
	 * Gets all HTML comments in the given range.
	 *
	 * By default it includes comments at the range boundaries.
	 *
	 * @param {module:engine/model/range~Range} range
	 * @param {Object} [options]
	 * @param {Boolean} [options.skipBoundaries=false] When set to `true` the range boundaries will be skipped.
	 * @returns {Array.<String>} HTML comment IDs
	 */
	getHtmlCommentsInRange( range, { skipBoundaries = false } = {} ) {
		const includeBoundaries = !skipBoundaries;

		// Unfortunately, MarkerCollection#getMarkersAtPosition() filters out collapsed markers.
		return Array.from( this.editor.model.markers.getMarkersGroup( '$comment' ) )
			.filter( marker => isCommentMarkerInRange( marker, range ) )
			.map( marker => marker.name );

		function isCommentMarkerInRange( commentMarker, range ) {
			const position = commentMarker.getRange().start;

			return (
				( position.isAfter( range.start ) || ( includeBoundaries && position.isEqual( range.start ) ) ) &&
				( position.isBefore( range.end ) || ( includeBoundaries && position.isEqual( range.end ) ) )
			);
		}
	}
}

/**
 * An interface for the HTML comments data.
 *
 * It consists of the {@link module:engine/model/position~Position `position`} and `content`.
 *
 * @typedef {Object} module:html-support/htmlcomment~HtmlCommentData
 *
 * @property {module:engine/model/position~Position} position
 * @property {String} content
 */
