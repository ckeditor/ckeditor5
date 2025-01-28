/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type DocumentFragment from '../documentfragment.js';
import type DocumentSelection from '../documentselection.js';
import type Element from '../element.js';
import type Model from '../model.js';
import type Range from '../range.js';
import type Selection from '../selection.js';
import type Writer from '../writer.js';

/**
 * @module engine/model/utils/getselectedcontent
 */

/**
 * Gets a clone of the selected content.
 *
 * For example, for the following selection:
 *
 * ```html
 * <p>x</p><quote><p>y</p><h>fir[st</h></quote><p>se]cond</p><p>z</p>
 * ```
 *
 * It will return a document fragment with such a content:
 *
 * ```html
 * <quote><h>st</h></quote><p>se</p>
 * ```
 *
 * @param model The model in context of which the selection modification should be performed.
 * @param selection The selection of which content will be returned.
 */
export default function getSelectedContent(
	model: Model,
	selection: Selection | DocumentSelection
): DocumentFragment {
	return model.change( writer => {
		const frag = writer.createDocumentFragment();
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
		let flatSubtreeRange: Range;

		if ( range.start.parent == range.end.parent ) {
			// The original range is flat, so take it.
			flatSubtreeRange = range;
		} else {
			flatSubtreeRange = writer.createRange(
				writer.createPositionAt( commonParent, range.start.path[ commonPath.length ] ),
				writer.createPositionAt( commonParent, range.end.path[ commonPath.length ] + 1 )
			);
		}

		const howMany = flatSubtreeRange.end.offset - flatSubtreeRange.start.offset;

		// Clone the whole contents.
		for ( const item of flatSubtreeRange.getItems( { shallow: true } ) ) {
			if ( item.is( '$textProxy' ) ) {
				writer.appendText( item.data, item.getAttributes(), frag );
			} else {
				writer.append( writer.cloneElement( item as Element, true ), frag );
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
			const newRange = range._getTransformedByMove( flatSubtreeRange.start, writer.createPositionAt( frag, 0 ), howMany )[ 0 ];

			const leftExcessRange = writer.createRange( writer.createPositionAt( frag, 0 ), newRange.start );
			const rightExcessRange = writer.createRange( newRange.end, writer.createPositionAt( frag, 'end' ) );

			removeRangeContent( rightExcessRange, writer );
			removeRangeContent( leftExcessRange, writer );
		}

		return frag;
	} );
}

// After https://github.com/ckeditor/ckeditor5-engine/issues/690 is fixed,
// this function will, most likely, be able to rewritten using getMinimalFlatRanges().
function removeRangeContent( range: Range, writer: Writer ) {
	const parentsToCheck: Array<Element | DocumentFragment> = [];

	Array.from( range.getItems( { direction: 'backward' } ) )
		// We should better store ranges because text proxies will lose integrity
		// with the text nodes when we'll start removing content.
		.map( item => writer.createRangeOn( item ) )
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

			writer.remove( itemRange );
		} );

	// Remove ancestors of the removed items if they turned to be empty now
	// (their whole content was contained in the range).
	parentsToCheck.forEach( parentToCheck => {
		let parent = parentToCheck;

		while ( parent.parent && parent.isEmpty ) {
			const removeRange = writer.createRangeOn( parent );

			parent = parent.parent;

			writer.remove( removeRange );
		}
	} );
}
