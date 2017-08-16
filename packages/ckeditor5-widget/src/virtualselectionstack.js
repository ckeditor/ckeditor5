/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module widget/virtualselectionstack
 */

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

export default class VirtualSelectionStack {
	constructor() {
		this._stack = [];
	}

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

function compareDescriptors( descriptorA, descriptorB ) {
	return descriptorA.priority == descriptorB.priority && descriptorA.class == descriptorB.class;
}

function shouldABeBeforeB( a, b ) {
	if ( a.priority > b.priority ) {
		return true;
	} else if ( a.priority < b.priority ) {
		return false;
	}

	// When priorities are equal and names are different - use classes to compare.
	// TODO: class should be required.
	return a.class > b.class;
}
