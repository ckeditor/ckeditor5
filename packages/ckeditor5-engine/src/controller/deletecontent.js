/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/controller/deletecontent
 */

import LivePosition from '../model/liveposition';
import Position from '../model/position';
import Element from '../model/element';
import compareArrays from '@ckeditor/ckeditor5-utils/src/comparearrays';

/**
 * Deletes content of the selection and merge siblings. The resulting selection is always collapsed.
 *
 * @param {module:engine/model/selection~Selection} selection Selection of which the content should be deleted.
 * @param {module:engine/model/batch~Batch} batch Batch to which the deltas will be added.
 * @param {Object} [options]
 * @param {Boolean} [options.merge=false] Merge elements after removing the contents of the selection.
 * For example, `<h>x[x</h><p>y]y</p>` will become: `<h>x^y</h>` with the option enabled
 * and: `<h>x^</h><p>y</p>` without it.
 */
export default function deleteContent( selection, batch, options = {} ) {
	if ( selection.isCollapsed ) {
		return;
	}

	const selRange = selection.getFirstRange();

	const startPos = selRange.start;
	const endPos = LivePosition.createFromPosition( selRange.end );

	// 1. Remove the contents if there are any.
	if ( !selRange.start.isTouching( selRange.end ) ) {
		batch.remove( selRange );
	}

	// 2. Merge elements in the right branch to the elements in the left branch.
	// The only reasonable (in terms of data and selection correctness) case in which we need to do that is:
	//
	// <heading type=1>Fo[</heading><paragraph>]ar</paragraph> => <heading type=1>Fo^ar</heading>
	//
	// However, the algorithm supports also merging deeper structures (up to the depth of the shallower branch),
	// as it's hard to imagine what should actually be the default behavior. Usually, specific features will
	// want to override that behavior anyway.
	if ( options.merge ) {
		const endPath = endPos.path;
		const mergeEnd = Math.min( startPos.path.length - 1, endPath.length - 1 );
		let mergeDepth = compareArrays( startPos.path, endPath );

		if ( typeof mergeDepth == 'number' ) {
			for ( ; mergeDepth < mergeEnd; mergeDepth++ ) {
				const mergePath = startPos.path.slice( 0, mergeDepth );
				mergePath.push( startPos.path[ mergeDepth ] + 1 );

				const mergePos = new Position( endPos.root, mergePath );
				const nextNode = mergePos.nodeAfter;

				if ( nextNode.childCount > 0 ) {
					batch.merge( mergePos );
				} else {
					batch.remove( nextNode );
				}
			}
		}
	}

	selection.collapse( startPos );

	// 3. Autoparagraphing.
	// Check if a text is allowed in the new container. If not, try to create a new paragraph (if it's allowed here).
	if ( shouldAutoparagraph( batch.document, startPos ) ) {
		const paragraph = new Element( 'paragraph' );
		batch.insert( startPos, paragraph );

		selection.collapse( paragraph );
	}

	endPos.detach();
}

function shouldAutoparagraph( doc, position ) {
	const isTextAllowed = doc.schema.check( { name: '$text', inside: position } );
	const isParagraphAllowed = doc.schema.check( { name: 'paragraph', inside: position } );

	return !isTextAllowed && isParagraphAllowed;
}
