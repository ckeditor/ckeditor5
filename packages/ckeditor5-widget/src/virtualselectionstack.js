/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module widget/virtualselectionstack
 */

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * Class used to handle correct order of
 * {@link module:engine/conversion/buildmodelconverter~ModelConverterBuilder#toVirtualSelection virtual selections} on
 * elements. When different virtual selections are applied to same element correct order should be preserved:
 * * virtual selection with highest priority should be applied,
 * * if two virtual selections have same priority - sort by CSS class provided in
 * {@link module:engine/conversion/buildmodelconverter~VirtualSelectionDescriptor}.
 * This way, virtual selection will be applied with the same rules it is applied on texts.
 */
export default class VirtualSelectionStack {
	/**
	 * Creates class instance.
	 */
	constructor() {
		this._stack = [];
	}

	/**
	 * Adds virtual selection descriptor to the stack.
	 *
	 * @fires change:top
	 * @param {module:engine/conversion/buildmodelconverter~VirtualSelectionDescriptor} descriptor
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
	 * Removes virtual selection descriptor from the stack.
	 *
	 * @fires change:top
	 * @param {module:engine/conversion/buildmodelconverter~VirtualSelectionDescriptor} descriptor
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
		// which informs that no selection is currently at the top.
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

mix( VirtualSelectionStack, EmitterMixin );

// Compares two virtual selection descriptors by priority and CSS class names. Returns `true` when both descriptors are
// considered equal.
//
// @param {module:engine/conversion/buildmodelconverter~VirtualSelectionDescriptor} descriptorA
// @param {module:engine/conversion/buildmodelconverter~VirtualSelectionDescriptor} descriptorB
// @returns {Boolean}
function compareDescriptors( descriptorA, descriptorB ) {
	return descriptorA.priority == descriptorB.priority && descriptorA.class == descriptorB.class;
}

// Checks whenever first descriptor should be placed in the stack before second one.
//
// @param {module:engine/conversion/buildmodelconverter~VirtualSelectionDescriptor} a
// @param {module:engine/conversion/buildmodelconverter~VirtualSelectionDescriptor} b
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
 * Fired when top element on {@link module:widget/virtualselectionstack~VirtualSelectionStack} has been changed
 *
 * @event change:top
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/buildmodelconverter~VirtualSelectionDescriptor} [data.newDescriptor] New virtual selection
 * descriptor. It will be `undefined` when last descriptor is removed from the stack.
 * @param {module:engine/conversion/buildmodelconverter~VirtualSelectionDescriptor} [data.oldDescriptor] Old virtual selection
 * descriptor. It will be `undefined` when first descriptor is added to the stack.
 */
