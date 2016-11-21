/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DocumentFragment from '../model/documentfragment.js';
import Range from '../model/range.js';
import Position from '../model/position.js';
import TextProxy from '../model/textproxy.js';
import Text from '../model/text.js';
import { remove } from '../model/writer.js';

/**
 * Gets a clone of the selected content.
 *
 * For example, for the following selection:
 *
 *		<p>x</p><quote><p>y</p><h>fir[st</h></quote><p>se]cond</p><p>z</p>
 *
 * It will return a document fragment with such a content:
 *
 *		<quote><h>st</h></quote><p>se</p>
 *
 * @method engine.controller.getSelectedContent
 * @param {engine.model.Selection} selection The selection of which content will be returned.
 * @returns {engine.model.DocumentFragment}
 */
export default function getSelectedContent( selection ) {
	const frag = new DocumentFragment();
	const range = selection.getFirstRange();

	if ( !range || range.isCollapsed ) {
		return frag;
	}

	const root = range.start.root;
	const commonPath = range.start.getCommonPath( range.end );
	const commonParent = root.getNodeByPath( commonPath );

	// ## 1st step
	//
	// First, we'll clone a fragment represented by a minimal flat range
	// containing the origian range to be cloned.
	// E.g. let's consider such a range:
	//
	// <p>x</p><quote><p>y</p><h>fir[st</h></quote><p>se]cond</p><p>z</p>
	//
	// A minimal flat range containing this one is:
	//
	// <p>x</p>[<quote><p>y</p><h>first</h></quote><p>second</p>]<p>z</p>
	//
	// We can easily clone this structure, preserving e.g. the <quote> element.
	let flatSubtreeRange;

	if ( range.start.parent == range.end.parent ) {
		// The original range is flat, so take it.
		flatSubtreeRange = range;
	} else {
		flatSubtreeRange = Range.createFromParentsAndOffsets(
			commonParent, range.start.path[ commonPath.length ],
			commonParent, range.end.path[ commonPath.length ] + 1
		);
	}

	const howMany = flatSubtreeRange.end.offset - flatSubtreeRange.start.offset;

	// Clone the whole contents.
	for ( const item of flatSubtreeRange.getItems( { shallow: true } ) ) {
		if ( item instanceof TextProxy ) {
			frag.appendChildren( new Text( item.data, item.getAttributes() ) );
		} else {
			frag.appendChildren( item.clone( true ) );
		}
	}

	// ## 2nd step
	//
	// If the orignal range wasn't flat, then we need to remove the excess nodes from the both ends of the cloned fragment.
	//
	// For example, for the range shown in the 1st step comment, we need to remove these pieces:
	//
	// <quote>[<p>y</p>]<h>[fir]st</h></quote><p>se[cond]</p>
	//
	// So this will be the final copied content:
	//
	// <quote><h>st</h></quote><p>se</p>
	//
	// In order to do that, we remove content from these two ranges:
	//
	// [<quote><p>y</p><h>fir]st</h></quote><p>se[cond</p>]
	if ( flatSubtreeRange != range ) {
		// Find the position of the original range in the cloned fragment.
		const newRange = range._getTransformedByMove( flatSubtreeRange.start, Position.createAt( frag, 0 ), howMany )[ 0 ];

		const leftExcessRange = new Range( Position.createAt( frag ), newRange.start );
		const rightExcessRange = new Range( newRange.end, Position.createAt( frag, 'end' ) );

		removeFromRange( rightExcessRange );
		removeFromRange( leftExcessRange );
	}

	return frag;
}

// After https://github.com/ckeditor/ckeditor5-engine/issues/690 is fixed,
// this function will, most likely, be able to rewritten using getMinimalFlatRanges().
function removeFromRange( range ) {
	Array.from( range.getItems() )
	// Filter only these items which are fully contained in the passed range.
	//
	// E.g. for the following range: [<quote><p>y</p><h>fir]st</h>
	// the walker will return the entire <h> element, when only the "fir" item inside it is fully contained.
	.filter( item => {
		const rangeOn = Range.createOn( item );
		const contained =
			( rangeOn.start.isAfter( range.start ) || rangeOn.start.isEqual( range.start ) ) &&
			( rangeOn.end.isBefore( range.end ) || rangeOn.end.isEqual( range.end ) );

		return contained;
	} )
	.forEach( item => {
		let parent = item.parent;

		remove( Range.createOn( item ) );

		// Remove ancestors of the item if they turn to be empty now (their whole content was contained in the range).
		while ( parent.parent && parent.isEmpty ) {
			const removeRange = Range.createOn( parent );

			parent = parent.parent;

			remove( removeRange );
		}
	} );
}
