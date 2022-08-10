/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/operation/rootattributeoperation
 */

import Operation from './operation';

import type Document from '../document';
import type RootElement from '../rootelement';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Operation to change root element's attribute. Using this class you can add, remove or change value of the attribute.
 *
 * This operation is needed, because root elements can't be changed through
 * @link module:engine/model/operation/attributeoperation~AttributeOperation}.
 * It is because {@link module:engine/model/operation/attributeoperation~AttributeOperation}
 * requires a range to change and root element can't
 * be a part of range because every {@link module:engine/model/position~Position} has to be inside a root.
 * {@link module:engine/model/position~Position} can't be created before a root element.
 *
 * @extends module:engine/model/operation/operation~Operation
 */
export default class RootAttributeOperation extends Operation {
	public root: RootElement;
	public key: string;
	public oldValue: unknown;
	public newValue: unknown;

	/**
	 * Creates an operation that changes, removes or adds attributes on root element.
	 *
	 * @see module:engine/model/operation/attributeoperation~AttributeOperation
	 * @param {module:engine/model/rootelement~RootElement} root Root element to change.
	 * @param {String} key Key of an attribute to change or remove.
	 * @param {*} oldValue Old value of the attribute with given key or `null` if adding a new attribute.
	 * @param {*} newValue New value to set for the attribute. If `null`, then the operation just removes the attribute.
	 * @param {Number|null} baseVersion Document {@link module:engine/model/document~Document#version} on which operation
	 * can be applied or `null` if the operation operates on detached (non-document) tree.
	 */
	constructor(
		root: RootElement,
		key: string,
		oldValue: unknown,
		newValue: unknown,
		baseVersion: number | null
	) {
		super( baseVersion );

		/**
		 * Root element to change.
		 *
		 * @readonly
		 * @member {module:engine/model/rootelement~RootElement}
		 */
		this.root = root;

		/**
		 * Key of an attribute to change or remove.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.key = key;

		/**
		 * Old value of the attribute with given key or `null` if adding a new attribute.
		 *
		 * @readonly
		 * @member {*}
		 */
		this.oldValue = oldValue;

		/**
		 * New value to set for the attribute. If `null`, then the operation just removes the attribute.
		 *
		 * @readonly
		 * @member {*}
		 */
		this.newValue = newValue;
	}

	/**
	 * @inheritDoc
	 */
	public get type(): 'addRootAttribute' | 'removeRootAttribute' | 'changeRootAttribute' {
		if ( this.oldValue === null ) {
			return 'addRootAttribute';
		} else if ( this.newValue === null ) {
			return 'removeRootAttribute';
		} else {
			return 'changeRootAttribute';
		}
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 *
	 * @returns {module:engine/model/operation/rootattributeoperation~RootAttributeOperation} Clone of this operation.
	 */
	public clone(): RootAttributeOperation {
		return new RootAttributeOperation( this.root, this.key, this.oldValue, this.newValue, this.baseVersion );
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/rootattributeoperation~RootAttributeOperation}
	 */
	public getReversed(): Operation {
		return new RootAttributeOperation( this.root, this.key, this.newValue, this.oldValue, this.baseVersion! + 1 );
	}

	/**
	 * @inheritDoc
	 * @internal
	 */
	public override _validate(): void {
		if ( this.root != this.root.root || this.root.is( 'documentFragment' ) ) {
			/**
			 * The element to change is not a root element.
			 *
			 * @error rootattribute-operation-not-a-root
			 * @param {module:engine/model/rootelement~RootElement} root
			 * @param {String} key
			 * @param {*} value
			 */
			throw new CKEditorError(
				'rootattribute-operation-not-a-root',
				this,
				{ root: this.root, key: this.key }
			);
		}

		if ( this.oldValue !== null && this.root.getAttribute( this.key ) !== this.oldValue ) {
			/**
			 * The attribute which should be removed does not exists for the given node.
			 *
			 * @error rootattribute-operation-wrong-old-value
			 * @param {module:engine/model/rootelement~RootElement} root
			 * @param {String} key
			 * @param {*} value
			 */
			throw new CKEditorError(
				'rootattribute-operation-wrong-old-value',
				this,
				{ root: this.root, key: this.key }
			);
		}

		if ( this.oldValue === null && this.newValue !== null && this.root.hasAttribute( this.key ) ) {
			/**
			 * The attribute with given key already exists for the given node.
			 *
			 * @error rootattribute-operation-attribute-exists
			 * @param {module:engine/model/rootelement~RootElement} root
			 * @param {String} key
			 */
			throw new CKEditorError(
				'rootattribute-operation-attribute-exists',
				this,
				{ root: this.root, key: this.key }
			);
		}
	}

	/**
	 * @inheritDoc
	 * @internal
	 */
	public override _execute(): void {
		if ( this.newValue !== null ) {
			this.root._setAttribute( this.key, this.newValue );
		} else {
			this.root._removeAttribute( this.key );
		}
	}

	/**
	 * @inheritDoc
	 */
	public override toJSON(): unknown {
		const json: any = super.toJSON();

		json.root = this.root.toJSON();

		return json;
	}

	/**
	 * @inheritDoc
	 */
	public static override get className(): string {
		return 'RootAttributeOperation';
	}

	/**
	 * Creates RootAttributeOperation object from deserilized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/rootattributeoperation~RootAttributeOperation}
	 */
	public static override fromJSON( json: any, document: Document ): RootAttributeOperation {
		if ( !document.getRoot( json.root ) ) {
			/**
			 * Cannot create RootAttributeOperation for document. Root with specified name does not exist.
			 *
			 * @error rootattribute-operation-fromjson-no-root
			 * @param {String} rootName
			 */
			throw new CKEditorError( 'rootattribute-operation-fromjson-no-root', this, { rootName: json.root } );
		}

		return new RootAttributeOperation( document.getRoot( json.root )!, json.key, json.oldValue, json.newValue, json.baseVersion );
	}

	// @if CK_DEBUG_ENGINE // toString() {
	// @if CK_DEBUG_ENGINE // 	return `RootAttributeOperation( ${ this.baseVersion } ): ` +
	// @if CK_DEBUG_ENGINE //		`"${ this.key }": ${ JSON.stringify( this.oldValue ) }` +
	// @if CK_DEBUG_ENGINE //		` -> ${ JSON.stringify( this.newValue ) }, ${ this.root.rootName }`;
	// @if CK_DEBUG_ENGINE // }
}
