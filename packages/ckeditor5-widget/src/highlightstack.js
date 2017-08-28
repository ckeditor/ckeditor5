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
 * {@link module:engine/conversion/model-to-view-converters~HighlightDescriptor}.
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
	 * @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor} descriptor
	 */
	add( descriptor ) {
		const stack = this._stack;

		// Save top descriptor and insert new one. If top is changed - fire event.
		const oldTop = stack[ 0 ];
		this._insertDescriptor( descriptor );
		const newTop = stack[ 0 ];

		// When new object is at the top and stores different information.
		if ( oldTop !== newTop && !compareDescriptors( oldTop, newTop ) ) {
			this.fire( 'change:top', {
				oldDescriptor: oldTop,
				newDescriptor: newTop
			} );
		}
	}

	/**
	 * Removes highlight descriptor from the stack.
	 *
	 * @fires change:top
	 * @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor} descriptor
	 */
	remove( descriptor ) {
		const stack = this._stack;

		const oldTop = stack[ 0 ];
		this._removeDescriptor( descriptor );
		const newTop = stack[ 0 ];

		// When new object is at the top and stores different information.
		if ( oldTop !== newTop && !compareDescriptors( oldTop, newTop ) ) {
			this.fire( 'change:top', {
				oldDescriptor: oldTop,
				newDescriptor: newTop
			} );
		}
	}

	/**
	 * Inserts given descriptor in correct place in the stack. It also takes care about updating information when
	 * descriptor with same id is already present.
	 *
	 * @private
	 * @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor} descriptor
	 */
	_insertDescriptor( descriptor ) {
		const stack = this._stack;
		const index = stack.findIndex( item => item.id === descriptor.id );

		// Inserting exact same descriptor - do nothing.
		if ( compareDescriptors( descriptor, stack[ index ] ) ) {
			return;
		}

		// If descriptor with same id but with different information is on the stack - remove it.
		if ( index > -1 ) {
			stack.splice( index, 1 );
		}

		// Find correct place to insert descriptor in the stack.
		// It have different information (for example priority) so it must be re-inserted in correct place.
		let i = 0;

		while ( stack[ i ] && shouldABeBeforeB( stack[ i ], descriptor ) ) {
			i++;
		}

		stack.splice( i, 0, descriptor );
	}

	/**
	 * Removes descriptor with given id from the stack.
	 *
	 * @private
	 * @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor} descriptor
	 */
	_removeDescriptor( descriptor ) {
		const stack = this._stack;
		const index = stack.findIndex( item => item.id === descriptor.id );

		// If descriptor with same id is on the list - remove it.
		if ( index > -1 ) {
			stack.splice( index, 1 );
		}
	}
}

mix( HighlightStack, EmitterMixin );

// Compares two descriptors by checking their priority and class list.
//
// @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor} a
// @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor} b
// @returns {Boolean} Returns true if both descriptors are defined and have same priority and classes.
function compareDescriptors( a, b ) {
	return a && b && a.priority == b.priority && classesToString( a.class ) == classesToString( b.class );
}

// Checks whenever first descriptor should be placed in the stack before second one.
//
// @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor} a
// @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor} b
// @returns {Boolean}
function shouldABeBeforeB( a, b ) {
	if ( a.priority > b.priority ) {
		return true;
	} else if ( a.priority < b.priority ) {
		return false;
	}

	// When priorities are equal and names are different - use classes to compare.
	return classesToString( a.class ) > classesToString( b.class );
}

// Converts CSS classes passed with {@link module:engine/conversion/model-to-view-converters~HighlightDescriptor} to
// sorted string.
//
// @param {String|Array<String>} descriptor
// @returns {String}
function classesToString( classes ) {
	return Array.isArray( classes ) ? classes.sort().join( ',' ) : classes;
}

/**
 * Fired when top element on {@link module:widget/highlightstack~HighlightStack} has been changed
 *
 * @event change:top
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor} [data.newDescriptor] New highlight
 * descriptor. It will be `undefined` when last descriptor is removed from the stack.
 * @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor} [data.oldDescriptor] Old highlight
 * descriptor. It will be `undefined` when first descriptor is added to the stack.
 */
