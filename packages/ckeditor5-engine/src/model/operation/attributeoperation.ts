/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/operation/attributeoperation
 */

import Operation from './operation.js';
import { _setAttribute } from './utils.js';
import Range from '../range.js';

import type Document from '../document.js';

import { CKEditorError } from '@ckeditor/ckeditor5-utils';
import { isEqual } from 'es-toolkit/compat';
import type { Selectable } from '../selection.js';

/**
 * Operation to change nodes' attribute.
 *
 * Using this class you can add, remove or change value of the attribute.
 */
export default class AttributeOperation extends Operation {
	/**
	 * Range on which operation should be applied.
	 *
	 * @readonly
	 */
	public range: Range;

	/**
	 * Key of an attribute to change or remove.
	 *
	 * @readonly
	 */
	public key: string;

	/**
	 * Old value of the attribute with given key or `null`, if attribute was not set before.
	 *
	 * @readonly
	 */
	public oldValue: unknown;

	/**
	 * New value of the attribute with given key or `null`, if operation should remove attribute.
	 *
	 * @readonly
	 */
	public newValue: unknown;

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
	 * @param range Range on which the operation should be applied. Must be a flat range.
	 * @param key Key of an attribute to change or remove.
	 * @param oldValue Old value of the attribute with given key or `null`, if attribute was not set before.
	 * @param newValue New value of the attribute with given key or `null`, if operation should remove attribute.
	 * @param baseVersion Document {@link module:engine/model/document~Document#version} on which operation
	 * can be applied or `null` if the operation operates on detached (non-document) tree.
	 */
	constructor( range: Range, key: string, oldValue: unknown, newValue: unknown, baseVersion: number | null ) {
		super( baseVersion );

		this.range = range.clone();
		this.key = key;
		this.oldValue = oldValue === undefined ? null : oldValue;
		this.newValue = newValue === undefined ? null : newValue;
	}

	/**
	 * @inheritDoc
	 */
	public get type(): 'addAttribute' | 'removeAttribute' | 'changeAttribute' {
		if ( this.oldValue === null ) {
			return 'addAttribute';
		} else if ( this.newValue === null ) {
			return 'removeAttribute';
		} else {
			return 'changeAttribute';
		}
	}

	/**
	 * @inheritDoc
	 */
	public get affectedSelectable(): Selectable {
		return this.range.clone();
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 */
	public clone(): AttributeOperation {
		return new AttributeOperation( this.range, this.key, this.oldValue, this.newValue, this.baseVersion );
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 */
	public getReversed(): Operation {
		return new AttributeOperation( this.range, this.key, this.newValue, this.oldValue, this.baseVersion! + 1 );
	}

	/**
	 * @inheritDoc
	 */
	public override toJSON(): unknown {
		const json: any = super.toJSON();

		json.range = this.range.toJSON();

		return json;
	}

	/**
	 * @inheritDoc
	 * @internal
	 */
	public override _validate(): void {
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
				 * @param {module:engine/model/item~Item} root The item element.
				 * @param {string} key The key of the attribute.
				 * @param {never} value The value.
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
				 * @param {module:engine/model/item~Item} root The item element.
				 * @param {string} key The key of the attribute.
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
	 * @internal
	 */
	public _execute(): void {
		// If value to set is same as old value, don't do anything.
		if ( !isEqual( this.oldValue, this.newValue ) ) {
			// Execution.
			_setAttribute( this.range, this.key, this.newValue );
		}
	}

	/**
	 * @inheritDoc
	 */
	public static override get className(): string {
		return 'AttributeOperation';
	}

	/**
	 * Creates `AttributeOperation` object from deserialized object, i.e. from parsed JSON string.
	 *
	 * @param json Deserialized JSON object.
	 * @param document Document on which this operation will be applied.
	 */
	public static override fromJSON( json: any, document: Document ): AttributeOperation {
		return new AttributeOperation( Range.fromJSON( json.range, document ), json.key, json.oldValue, json.newValue, json.baseVersion );
	}

	// @if CK_DEBUG_ENGINE // public override toString(): string {
	// @if CK_DEBUG_ENGINE // 	return `AttributeOperation( ${ this.baseVersion } ): ` +
	// @if CK_DEBUG_ENGINE // 		`"${ this.key }": ${ JSON.stringify( this.oldValue ) }` +
	// @if CK_DEBUG_ENGINE // 		` -> ${ JSON.stringify( this.newValue ) }, ${ this.range }`;
	// @if CK_DEBUG_ENGINE // }
}
