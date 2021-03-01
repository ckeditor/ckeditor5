/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/operation/attributeoperation
 */

import Operation from './operation';
import Range from '../range';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import { _setAttribute } from './utils';
import { isEqual } from 'lodash-es';

/**
 * Operation to change nodes' attribute.
 *
 * Using this class you can add, remove or change value of the attribute.
 *
 * @extends module:engine/model/operation/operation~Operation
 */
export default class AttributeOperation extends Operation {
	/**
	 * Creates an operation that changes, removes or adds attributes.
	 *
	 * If only `newValue` is set, attribute will be added on a node. Note that all nodes in operation's range must not
	 * have an attribute with the same key as the added attribute.
	 *
	 * If only `oldValue` is set, then attribute with given key will be removed. Note that all nodes in operation's range
	 * must have an attribute with that key added.
	 *
	 * If both `newValue` and `oldValue` are set, then the operation will change the attribute value. Note that all nodes in
	 * operation's ranges must already have an attribute with given key and `oldValue` as value
	 *
	 * @param {module:engine/model/range~Range} range Range on which the operation should be applied. Must be a flat range.
	 * @param {String} key Key of an attribute to change or remove.
	 * @param {*} oldValue Old value of the attribute with given key or `null`, if attribute was not set before.
	 * @param {*} newValue New value of the attribute with given key or `null`, if operation should remove attribute.
	 * @param {Number|null} baseVersion Document {@link module:engine/model/document~Document#version} on which operation
	 * can be applied or `null` if the operation operates on detached (non-document) tree.
	 */
	constructor( range, key, oldValue, newValue, baseVersion ) {
		super( baseVersion );

		/**
		 * Range on which operation should be applied.
		 *
		 * @readonly
		 * @member {module:engine/model/range~Range}
		 */
		this.range = range.clone();

		/**
		 * Key of an attribute to change or remove.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.key = key;

		/**
		 * Old value of the attribute with given key or `null`, if attribute was not set before.
		 *
		 * @readonly
		 * @member {*}
		 */
		this.oldValue = oldValue === undefined ? null : oldValue;

		/**
		 * New value of the attribute with given key or `null`, if operation should remove attribute.
		 *
		 * @readonly
		 * @member {*}
		 */
		this.newValue = newValue === undefined ? null : newValue;
	}

	/**
	 * @inheritDoc
	 */
	get type() {
		if ( this.oldValue === null ) {
			return 'addAttribute';
		} else if ( this.newValue === null ) {
			return 'removeAttribute';
		} else {
			return 'changeAttribute';
		}
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 *
	 * @returns {module:engine/model/operation/attributeoperation~AttributeOperation} Clone of this operation.
	 */
	clone() {
		return new AttributeOperation( this.range, this.key, this.oldValue, this.newValue, this.baseVersion );
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/attributeoperation~AttributeOperation}
	 */
	getReversed() {
		return new AttributeOperation( this.range, this.key, this.newValue, this.oldValue, this.baseVersion + 1 );
	}

	/**
	 * @inheritDoc
	 */
	toJSON() {
		const json = super.toJSON();

		json.range = this.range.toJSON();

		return json;
	}

	/**
	 * @inheritDoc
	 */
	_validate() {
		if ( !this.range.isFlat ) {
			/**
			 * The range to change is not flat.
			 *
			 * @error attribute-operation-range-not-flat
			 */
			throw new CKEditorError( 'attribute-operation-range-not-flat', this );
		}

		for ( const item of this.range.getItems( { shallow: true } ) ) {
			if ( this.oldValue !== null && !isEqual( item.getAttribute( this.key ), this.oldValue ) ) {
				/**
				 * Changed node has different attribute value than operation's old attribute value.
				 *
				 * @error attribute-operation-wrong-old-value
				 * @param {module:engine/model/item~Item} item
				 * @param {String} key
				 * @param {*} value
				 */
				throw new CKEditorError(
					'attribute-operation-wrong-old-value',
					this,
					{ item, key: this.key, value: this.oldValue }
				);
			}

			if ( this.oldValue === null && this.newValue !== null && item.hasAttribute( this.key ) ) {
				/**
				 * The attribute with given key already exists for the given node.
				 *
				 * @error attribute-operation-attribute-exists
				 * @param {module:engine/model/node~Node} node
				 * @param {String} key
				 */
				throw new CKEditorError(
					'attribute-operation-attribute-exists',
					this,
					{ node: item, key: this.key }
				);
			}
		}
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		// If value to set is same as old value, don't do anything.
		if ( !isEqual( this.oldValue, this.newValue ) ) {
			// Execution.
			_setAttribute( this.range, this.key, this.newValue );
		}
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'AttributeOperation';
	}

	/**
	 * Creates `AttributeOperation` object from deserilized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/attributeoperation~AttributeOperation}
	 */
	static fromJSON( json, document ) {
		return new AttributeOperation( Range.fromJSON( json.range, document ), json.key, json.oldValue, json.newValue, json.baseVersion );
	}

	// @if CK_DEBUG_ENGINE // toString() {
	// @if CK_DEBUG_ENGINE // 	return `AttributeOperation( ${ this.baseVersion } ): ` +
	// @if CK_DEBUG_ENGINE //		`"${ this.key }": ${ JSON.stringify( this.oldValue ) }` +
	// @if CK_DEBUG_ENGINE //		` -> ${ JSON.stringify( this.newValue ) }, ${ this.range }`;
	// @if CK_DEBUG_ENGINE // }
}
