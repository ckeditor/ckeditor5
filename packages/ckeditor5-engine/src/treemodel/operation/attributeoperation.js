/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Operation from './operation.js';
import Range from '../range.js';
import CKEditorError from '../../../utils/ckeditorerror.js';
import TextFragment from '../textfragment.js';

/**
 * Operation to change nodes' attribute. Using this class you can add, remove or change value of the attribute.
 *
 * @memberOf engine.treeModel.operation
 * @extends engine.treeModel.operation.Operation
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
	 * @param {engine.treeModel.Range} range Range on which the operation should be applied.
	 * @param {String} key Key of an attribute to change or remove.
	 * @param {*} oldValue Old value of the attribute with given key or `null` if adding a new attribute.
	 * @param {*} newValue New value to set for the attribute. If `null`, then the operation just removes the attribute.
	 * @param {Number} baseVersion {@link engine.treeModel.Document#version} on which the operation can be applied.
	 */
	constructor( range, key, oldValue, newValue, baseVersion ) {
		super( baseVersion );

		/**
		 * Range on which operation should be applied.
		 *
		 * @readonly
		 * @member {engine.treeModel.Range} engine.treeModel.operation.AttributeOperation#range
		 */
		this.range = Range.createFromRange( range );

		/**
		 * Key of an attribute to change or remove.
		 *
		 * @readonly
		 * @member {String} engine.treeModel.operation.AttributeOperation#key
		 */
		this.key = key;

		/**
		 * Old value of the attribute with given key or `null` if adding a new attribute.
		 *
		 * @readonly
		 * @member {*} engine.treeModel.operation.AttributeOperation#oldValue
		 */
		this.oldValue = oldValue;

		/**
		 * New value to set for the attribute. If `null`, then the operation just removes the attribute.
		 *
		 * @readonly
		 * @member {*} engine.treeModel.operation.AttributeOperation#newValue
		 */
		this.newValue = newValue;
	}

	get type() {
		return 'attribute';
	}

	/**
	 * @returns {engine.treeModel.operation.AttributeOperation}
	 */
	clone() {
		return new AttributeOperation( this.range, this.key, this.oldValue, this.newValue, this.baseVersion );
	}

	/**
	 * @returns {engine.treeModel.operation.AttributeOperation}
	 */
	getReversed() {
		return new AttributeOperation( this.range, this.key, this.newValue, this.oldValue, this.baseVersion + 1 );
	}

	_execute() {
		for ( let item of this.range.getItems() ) {
			if ( this.oldValue !== null && item.getAttribute( this.key ) !== this.oldValue ) {
				/**
				 * The attribute which should be removed does not exists for the given node.
				 *
				 * @error operation-attribute-no-attr-to-remove
				 * @param {engine.treeModel.Item} item
				 * @param {String} key
				 * @param {*} value
				 */
				throw new CKEditorError(
					'operation-attribute-no-attr-to-remove: The attribute which should be removed does not exists for given node.',
					{ item: item, key: this.key }
				);
			}

			if ( this.oldValue === null && this.newValue !== null && item.hasAttribute( this.key ) ) {
				/**
				 * The attribute with given key already exists for the given node.
				 *
				 * @error operation-attribute-attr-exists
				 * @param {engine.treeModel.Node} node
				 * @param {String} key
				 */
				throw new CKEditorError(
					'operation-attribute-attr-exists: The attribute with given key already exists.',
					{ node: item, key: this.key }
				);
			}

			if ( this.newValue !== null ) {
				item.setAttribute( this.key, this.newValue );
			} else {
				item.removeAttribute( this.key );
			}
		}

		return { range: this.range, key: this.key, oldValue: this.oldValue, newValue: this.newValue };
	}
}
