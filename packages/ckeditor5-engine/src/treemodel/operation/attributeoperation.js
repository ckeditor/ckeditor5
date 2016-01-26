/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Operation from './operation.js';
import Range from '../range.js';
import CKEditorError from '../../ckeditorerror.js';
import TextFragment from '../textfragment.js';

/**
 * Operation to change nodes' attribute. Using this class you can add, remove or change value of the attribute.
 *
 * @class treeModel.operation.AttributeOperation
 */
export default class AttributeOperation extends Operation {
	/**
	 * Creates an operation that changes, removes or adds attributes.
	 *
	 * If only the new attribute is set, then it will be inserted. Note that in all nodes in ranges there must be
	 * no attributes with the same key as the new attribute.
	 *
	 * If only the old attribute is set, then it will be removed. Note that this attribute must be present in all nodes in
	 * ranges.
	 *
	 * If both new and old attributes are set, then the operation will change the attribute value. Note that both new and
	 * old attributes have to have the same key and the old attribute must be present in all nodes in ranges.
	 *
	 * @param {treeModel.Range} range Range on which the operation should be applied.
	 * @param {treeModel.Attribute|null} oldAttr Attribute to be removed. If `null`, then the operation just inserts a new attribute.
	 * @param {treeModel.Attribute|null} newAttr Attribute to be added. If `null`, then the operation just removes the attribute.
	 * @param {Number} baseVersion {@link treeModel.Document#version} on which the operation can be applied.
	 * @constructor
	 */
	constructor( range, oldAttr, newAttr, baseVersion ) {
		super( baseVersion );

		/**
		 * Range on which operation should be applied.
		 *
		 * @readonly
		 * @type {treeModel.Range}
		 */
		this.range = Range.createFromRange( range );

		/**
		 * Old attribute to change. Set to `null` if operation inserts a new attribute.
		 *
		 * @readonly
		 * @type {treeModel.Attribute|null}
		 */
		this.oldAttr = oldAttr;

		/**
		 * New attribute. Set to `null` if operation removes the attribute.
		 *
		 * @readonly
		 * @type {treeModel.Attribute|null}
		 */
		this.newAttr = newAttr;
	}

	get type() {
		return 'attr';
	}

	clone() {
		return new AttributeOperation( this.range, this.oldAttr, this.newAttr, this.baseVersion );
	}

	getReversed() {
		return new AttributeOperation( this.range, this.newAttr, this.oldAttr, this.baseVersion + 1 );
	}

	_execute() {
		const oldAttr = this.oldAttr;
		const newAttr = this.newAttr;

		if ( oldAttr !== null && newAttr !== null && oldAttr.key != newAttr.key ) {
			/**
			 * Old and new attributes should have the same keys.
			 *
			 * @error operation-attribute-different-keys
			 * @param {treeModel.Attribute} oldAttr
			 * @param {treeModel.Attribute} newAttr
			 */
			throw new CKEditorError(
				'operation-attribute-different-keys: Old and new attributes should have the same keys.',
				{ oldAttr: oldAttr, newAttr: newAttr }
			);
		}

		for ( let item of this.range.getAllNodes( true ) ) {
			if ( oldAttr !== null && !item.hasAttribute( oldAttr ) ) {
				/**
				 * The attribute which should be removed does not exists for the given node.
				 *
				 * @error operation-attribute-no-attr-to-remove
				 * @param {treeModel.Node} node
				 * @param {treeModel.Attribute} attr
				 */
				throw new CKEditorError(
					'operation-attribute-no-attr-to-remove: The attribute which should be removed does not exists for given node.',
					{ node: item, attr: oldAttr }
				);
			}

			if ( oldAttr === null && newAttr !== null && item.hasAttribute( newAttr.key ) ) {
				/**
				 * The attribute with given key already exists for the given node.
				 *
				 * @error operation-attribute-attr-exists
				 * @param {treeModel.Node} node
				 * @param {treeModel.Attribute} attr
				 */
				throw new CKEditorError(
					'operation-attribute-attr-exists: The attribute with given key already exists.',
					{ node: item, attr: newAttr }
				);
			}

			if ( item instanceof TextFragment ) {
				let key = newAttr ? newAttr.key : oldAttr.key;
				item.commonParent._children.setAttribute( item.first.getIndex(), item.text.length, key, newAttr );
			}
			else {
				if ( newAttr ) {
					item.setAttribute( newAttr );
				} else {
					item.removeAttribute( oldAttr.key );
				}
			}
		}

		return { range: this.range, oldAttr: oldAttr, newAttr: newAttr };
	}
}
