/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/controller/getselectedcontent
 */

import DocumentFragment from '../model/documentfragment';
import Range from '../model/range';
import Position from '../model/position';
import Text from '../model/text';
import { remove } from '../model/writer';

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
 * @param {module:engine/model/selection~Selection} selection The selection of which content will be returned.
 * @returns {module:engine/model/documentfragment~DocumentFragment}
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
	// containing the original range to be cloned.
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
		if ( item.is( 'textProxy' ) ) {
			frag.appendChildren( new Text( item.data, item.getAttributes() ) );
		} else {
			frag.appendChildren( item.clone( true ) );
		}
	}

	// ## 2nd step
	//
	// If the original range wasn't flat, then we need to remove the excess nodes from the both ends of the cloned fragment.
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

		removeRangeContent( rightExcessRange );
		removeRangeContent( leftExcessRange );
	}

	return frag;
}

// After https://github.com/ckeditor/ckeditor5-engine/issues/690 is fixed,
// this function will, most likely, be able to rewritten using getMinimalFlatRanges().
function removeRangeContent( range ) {
	const parentsToCheck = [];

	Array.from( range.getItems( { direction: 'backward' } ) )
		// We should better store ranges because text proxies will lose integrity
		// with the text nodes when we'll start removing content.
		.map( item => Range.createOn( item ) )
		// Filter only these items which are fully contained in the passed range.
		//
		// E.g. for the following range: [<quote><p>y</p><h>fir]st</h>
		// the walker will return the entire <h> element, when only the "fir" item inside it is fully contained.
		.filter( itemRange => {
			// We should be able to use Range.containsRange, but https://github.com/ckeditor/ckeditor5-engine/issues/691.
			const contained =
				( itemRange.start.isAfter( range.start ) || itemRange.start.isEqual( range.start ) ) &&
				( itemRange.end.isBefore( range.end ) || itemRange.end.isEqual( range.end ) );

			return contained;
		} )
		.forEach( itemRange => {
			parentsToCheck.push( itemRange.start.parent );

			remove( itemRange );
		} );

	// Remove ancestors of the removed items if they turned to be empty now
	// (their whole content was contained in the range).
	parentsToCheck.forEach( parentToCheck => {
		let parent = parentToCheck;

		while ( parent.parent && parent.isEmpty ) {
			const removeRange = Range.createOn( parent );

			parent = parent.parent;

			remove( removeRange );
		}
	} );
}
