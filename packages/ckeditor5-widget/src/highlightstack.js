/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module widget/highlightstack
 */

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * Class used to handle correct order of
 * {@link module:engine/conversion/buildmodelconverter~ModelConverterBuilder#toHighlight highlights} on
 * elements. When different highlights are applied to same element correct order should be preserved:
 * * highlight with highest priority should be applied,
 * * if two highlights have same priority - sort by CSS class provided in
 * {@link module:engine/conversion/buildmodelconverter~HighlightDescriptor}.
 * This way, highlight will be applied with the same rules it is applied on texts.
 */
export default class HighlightStack {
	/**
	 * Creates class instance.
	 */
	constructor() {
		this._stack = [];
	}

	/**
	 * Adds highlight descriptor to the stack.
	 *
	 * @fires change:top
	 * @param {module:engine/conversion/buildmodelconverter~HighlightDescriptor} descriptor
	 */
	add( descriptor ) {
		const stack = this._stack;
		let i = 0;

		// Find correct place to insert descriptor in the stack.
		while ( stack[ i ] && shouldABeBeforeB( stack[ i ], descriptor ) ) {
			i++;
		}

		stack.splice( i, 0, descriptor );

		// New element at the stack top.
		if ( i === 0 ) {
			const data = {
				newDescriptor: descriptor
			};

			// If old descriptor is present it was pushed down the stack.
			if ( stack[ 1 ] ) {
				const oldDescriptor = stack[ 1 ];

				// New descriptor on the top is same as previous one - do not fire any event.
				if ( compareDescriptors( descriptor, oldDescriptor ) ) {
					return;
				}

				data.oldDescriptor = oldDescriptor;
			}

			this.fire( 'change:top', data );
		}
	}

	/**
	 * Removes highlight descriptor from the stack.
	 *
	 * @fires change:top
	 * @param {module:engine/conversion/buildmodelconverter~HighlightDescriptor} descriptor
	 */
	remove( descriptor ) {
		const stack = this._stack;
		const length = stack.length;

		if ( length === 0 ) {
			return;
		}

		let i = 0;

		while ( stack[ i ] && !compareDescriptors( descriptor, stack[ i ] ) ) {
			i++;

			// Descriptor not found.
			if ( i >= stack.length ) {
				return;
			}
		}

		stack.splice( i, 1 );

		// Element from stack top was removed - fire `change:top` event with new first element. It might be `undefined`
		// which informs that no descriptor is currently at the top.
		if ( i === 0 ) {
			const data = {
				oldDescriptor: descriptor
			};

			if ( stack[ 0 ] ) {
				const newDescriptor = stack[ 0 ];

				// New descriptor on the top is same as removed one - do not fire any event.
				if ( compareDescriptors( descriptor, newDescriptor ) ) {
					return;
				}

				data.newDescriptor = newDescriptor;
			}

			this.fire( 'change:top', data );
		}
	}
}

mix( HighlightStack, EmitterMixin );

// Compares two highlight descriptors by priority and CSS class names. Returns `true` when both descriptors are
// considered equal.
//
// @param {module:engine/conversion/buildmodelconverter~HighlightDescriptor} descriptorA
// @param {module:engine/conversion/buildmodelconverter~HighlightDescriptor} descriptorB
// @returns {Boolean}
function compareDescriptors( descriptorA, descriptorB ) {
	return descriptorA.priority == descriptorB.priority && descriptorA.class == descriptorB.class;
}

// Checks whenever first descriptor should be placed in the stack before second one.
//
// @param {module:engine/conversion/buildmodelconverter~HighlightDescriptor} a
// @param {module:engine/conversion/buildmodelconverter~HighlightDescriptor} b
// @returns {Boolean}
function shouldABeBeforeB( a, b ) {
	if ( a.priority > b.priority ) {
		return true;
	} else if ( a.priority < b.priority ) {
		return false;
	}

	// When priorities are equal and names are different - use classes to compare.
	return a.class > b.class;
}

/**
 * Fired when top element on {@link module:widget/highlightstack~HighlightStack} has been changed
 *
 * @event change:top
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/buildmodelconverter~HighlightDescriptor} [data.newDescriptor] New highlight
 * descriptor. It will be `undefined` when last descriptor is removed from the stack.
 * @param {module:engine/conversion/buildmodelconverter~HighlightDescriptor} [data.oldDescriptor] Old highlight
 * descriptor. It will be `undefined` when first descriptor is added to the stack.
 */
