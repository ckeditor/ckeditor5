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

/**
 * Deletes content of the selection and merge siblings. The resulting selection is always collapsed.
 *
 * @param {module:engine/model/selection~Selection} selection Selection of which the content should be deleted.
 * @param {module:engine/model/batch~Batch} batch Batch to which the deltas will be added.
 * @param {Object} [options]
 * @param {Boolean} [options.merge=false] Merge elements after removing the contents of the selection.
 * For example, `<h>x[x</h><p>y]y</p>` will become: `<h>x^y</h>` with the option enabled
 * and: `<h>x^</h><p>y</p>` without it.
 * Note: {@link module:engine/model/schema~Schema#objects object} and {@link module:engine/model/schema~Schema#limits limit}
 * elements will not be merged.
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
		mergeBranches( batch, startPos, endPos );
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

// This function is a result of reaching the Ballmer's peak for just the right amount of time.
// Even I had troubles documenting it after a while and after reading it again I couldn't believe that it really works.
function mergeBranches( batch, startPos, endPos ) {
	const startParent = startPos.parent;
	const endParent = endPos.parent;

	// If both positions ended up in the same parent, then there's nothing more to merge:
	// <$root><p>x[]</p><p>{}y</p></$root> => <$root><p>xy</p>[]{}</$root>
	if ( startParent == endParent ) {
		return;
	}

	// If one of the positions is a root, then there's nothing more to merge (at least in the current state of implementation).
	// Theoretically in this case we could unwrap the <p>: <$root>x[]<p>[]y</p></$root>, but we don't need to support it yet
	// so let's just abort.
	if ( !startParent.parent || !endParent.parent ) {
		return;
	}

	// Check if operations we'll need to do won't need to cross object or limit boundaries.
	// E.g., we can't merge endParent into startParent in this case:
	// <limit><startParent>x</startParent></limit><endParent></endParent>
	if ( !checkCanBeMerged( startParent, endParent ) ) {
		return;
	}

	// Remember next positions to merge. For example:
	// <a><b>x[]</b></a><c><d>[]y</d></c>
	// will become:
	// <a><b>xy</b>[]</a><c>[]</c>
	startPos = Position.createAfter( startParent );
	endPos = Position.createBefore( endParent );

	if ( endParent.childCount > 0 ) {
		// At the moment, next startPos is also the position to which the endParent
		// needs to be moved:
		// <a><b>x[]</b></a><c><d>[]y</d></c>
		// becomes:
		// <a><b>x</b>[]<d>y</d></a><c>[]</c>
		batch.move( endParent, startPos );

		// To then become:
		// <a><b>xy</b>[]</a><c>[]</c>
		batch.merge( startPos );
	} else {
		batch.remove( endParent );
	}

	// Continue merging next level.
	mergeBranches( batch, startPos, endPos );
}

function shouldAutoparagraph( doc, position ) {
	const isTextAllowed = doc.schema.check( { name: '$text', inside: position } );
	const isParagraphAllowed = doc.schema.check( { name: 'paragraph', inside: position } );

	return !isTextAllowed && isParagraphAllowed;
}

function checkCanBeMerged( left, right ) {
	const schema = left.document.schema;
	const leftAncestors = left.getAncestors( { includeNode: true } );
	const rightAncestors = right.getAncestors( { includeNode: true } );

	// Check if any of the ancestor chains contain a limitting element which would be crossed
	// when these elements will be merged. If so, the elements can't be merged.
	return !leftAncestors.find( checkLimitsMerge( rightAncestors ) ) && !rightAncestors.find( checkLimitsMerge( leftAncestors ) );

	function checkLimitsMerge( secondBranchAncestors ) {
		return ( ancestor ) => {
			// If the ancestor is in the second branch, it means that it's a common ancestor, so it won't be crossed.
			if ( secondBranchAncestors.includes( ancestor ) ) {
				return false;
			}

			return schema.objects.has( ancestor.name ) || schema.limits.has( ancestor.name );
		};
	}
}
