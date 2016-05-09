/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import LivePosition from '../liveposition.js';
import Position from '../position.js';
import compareArrays from '../../../utils/comparearrays.js';

/**
 * Delete contents of the selection and merge siblings. The resulting selection is always collapsed.
 *
 * @method engine.treeModel.composer.deleteContents
 * @param {engine.treeModel.Batch} batch Batch to which the deltas will be added.
 * @param {engine.treeModel.Selection} selection Selection of which the content should be deleted.
 * @param {Object} [options]
 * @param {Boolean} [options.merge=false] Merge elements after removing the contents of the selection.
 * For example, `<h>x[x</h><p>y]y</p>` will become: `<h>x^y</h>` with the option enabled
 * and: `<h>x^</h><p>y</p>` without it.
 */
export default function deleteContents( batch, selection, options = {} ) {
	if ( selection.isCollapsed ) {
		return;
	}

	const startPos = selection.getFirstRange().start;
	const endPos = LivePosition.createFromPosition( selection.getFirstRange().end );

	// 1. Remove the contents.
	batch.remove( selection.getFirstRange() );

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

				batch.merge( new Position( endPos.root, mergePath ) );
			}
		}
	}

	selection.collapse( startPos );

	endPos.detach();
}
