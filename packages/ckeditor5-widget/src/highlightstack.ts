/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/highlightstack
 */

import { EmitterMixin, type ArrayOrItem } from '@ckeditor/ckeditor5-utils';

import type { DowncastWriter, HighlightDescriptor } from '@ckeditor/ckeditor5-engine';

/**
 * Class used to handle the correct order of highlights on elements.
 *
 * When different highlights are applied to same element the correct order should be preserved:
 *
 * * highlight with highest priority should be applied,
 * * if two highlights have same priority - sort by CSS class provided in
 * {@link module:engine/conversion/downcasthelpers~HighlightDescriptor}.
 *
 * This way, highlight will be applied with the same rules it is applied on texts.
 */
export default class HighlightStack extends EmitterMixin() {
	private readonly _stack: Array<HighlightDescriptor>;

	/**
	 * Creates class instance.
	 */
	constructor() {
		super();

		this._stack = [];
	}

	/**
	 * Adds highlight descriptor to the stack.
	 *
	 * @fires change:top
	 * @param {module:engine/conversion/downcasthelpers~HighlightDescriptor} descriptor
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
	 */
	public add( descriptor: HighlightDescriptor, writer: DowncastWriter ): void {
		const stack = this._stack;

		// Save top descriptor and insert new one. If top is changed - fire event.
		const oldTop = stack[ 0 ];
		this._insertDescriptor( descriptor );
		const newTop = stack[ 0 ];

		// When new object is at the top and stores different information.
		if ( oldTop !== newTop && !compareDescriptors( oldTop, newTop ) ) {
			this.fire<HighlightStackChangeEvent>( 'change:top', {
				oldDescriptor: oldTop,
				newDescriptor: newTop,
				writer
			} );
		}
	}

	/**
	 * Removes highlight descriptor from the stack.
	 *
	 * @fires change:top
	 * @param {String} id Id of the descriptor to remove.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
	 */
	public remove( id: string, writer: DowncastWriter ): void {
		const stack = this._stack;

		const oldTop = stack[ 0 ];
		this._removeDescriptor( id );
		const newTop = stack[ 0 ];

		// When new object is at the top and stores different information.
		if ( oldTop !== newTop && !compareDescriptors( oldTop, newTop ) ) {
			this.fire<HighlightStackChangeEvent>( 'change:top', {
				oldDescriptor: oldTop,
				newDescriptor: newTop,
				writer
			} );
		}
	}

	/**
	 * Inserts a given descriptor in correct place in the stack. It also takes care about updating information
	 * when descriptor with same id is already present.
	 *
	 * @private
	 * @param {module:engine/conversion/downcasthelpers~HighlightDescriptor} descriptor
	 */
	private _insertDescriptor( descriptor: HighlightDescriptor ) {
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
		// It has different information (for example priority) so it must be re-inserted in correct place.
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
	 * @param {String} id Descriptor's id.
	 */
	private _removeDescriptor( id: string ) {
		const stack = this._stack;
		const index = stack.findIndex( item => item.id === id );

		// If descriptor with same id is on the list - remove it.
		if ( index > -1 ) {
			stack.splice( index, 1 );
		}
	}
}

// Compares two descriptors by checking their priority and class list.
//
// @param {module:engine/conversion/downcasthelpers~HighlightDescriptor} a
// @param {module:engine/conversion/downcasthelpers~HighlightDescriptor} b
// @returns {Boolean} Returns true if both descriptors are defined and have same priority and classes.
function compareDescriptors( a: HighlightDescriptor, b: HighlightDescriptor ) {
	return a && b && a.priority == b.priority && classesToString( a.classes ) == classesToString( b.classes );
}

// Checks whenever first descriptor should be placed in the stack before second one.
//
// @param {module:engine/conversion/downcasthelpers~HighlightDescriptor} a
// @param {module:engine/conversion/downcasthelpers~HighlightDescriptor} b
// @returns {Boolean}
function shouldABeBeforeB( a: HighlightDescriptor, b: HighlightDescriptor ) {
	if ( a.priority! > b.priority! ) {
		return true;
	} else if ( a.priority! < b.priority! ) {
		return false;
	}

	// When priorities are equal and names are different - use classes to compare.
	return classesToString( a.classes ) > classesToString( b.classes );
}

// Converts CSS classes passed with {@link module:engine/conversion/downcasthelpers~HighlightDescriptor} to
// sorted string.
//
// @param {String|Array<String>} descriptor
// @returns {String}
function classesToString( classes: ArrayOrItem<string> ) {
	return Array.isArray( classes ) ? classes.sort().join( ',' ) : classes;
}

/**
 * Fired when top element on {@link module:widget/highlightstack~HighlightStack} has been changed
 *
 * @event change:top
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/downcasthelpers~HighlightDescriptor} [data.newDescriptor] New highlight
 * descriptor. It will be `undefined` when last descriptor is removed from the stack.
 * @param {module:engine/conversion/downcasthelpers~HighlightDescriptor} [data.oldDescriptor] Old highlight
 * descriptor. It will be `undefined` when first descriptor is added to the stack.
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer View writer that can be used to modify element.
 */
export type HighlightStackChangeEvent = {
	name: 'change' | 'change:top';
	args: [ {
		oldDescriptor: HighlightDescriptor;
		newDescriptor: HighlightDescriptor;
		writer: DowncastWriter;
	} ];
};
