/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/operation/rootattributeoperation
 */

import Operation from './operation';
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
	/**
	 * Creates an operation that changes, removes or adds attributes on root element.
	 *
	 * @see module:engine/model/operation/attributeoperation~AttributeOperation
	 * @param {module:engine/model/rootelement~RootElement} root Root element to change.
	 * @param {String} key Key of an attribute to change or remove.
	 * @param {*} oldValue Old value of the attribute with given key or `null` if adding a new attribute.
	 * @param {*} newValue New value to set for the attribute. If `null`, then the operation just removes the attribute.
	 * @param {Number} baseVersion {@link module:engine/model/document~Document#version} on which the operation can be applied.
	 */
	constructor( root, key, oldValue, newValue, baseVersion ) {
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

	get type() {
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
	clone() {
		return new RootAttributeOperation( this.root, this.key, this.oldValue, this.newValue, this.baseVersion );
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/rootattributeoperation~RootAttributeOperation}
	 */
	getReversed() {
		return new RootAttributeOperation( this.root, this.key, this.newValue, this.oldValue, this.baseVersion + 1 );
	}

	_execute() {
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
				'rootattribute-operation-wrong-old-value: Changed node has different attribute value than operation\'s ' +
				'old attribute value.',
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
				'rootattribute-operation-attribute-exists: The attribute with given key already exists.',
				{ root: this.root, key: this.key }
			);
		}

		if ( this.newValue !== null ) {
			this.root.setAttribute( this.key, this.newValue );
		} else {
			this.root.removeAttribute( this.key );
		}

		return { root: this.root, key: this.key, oldValue: this.oldValue, newValue: this.newValue };
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.operation.RootAttributeOperation';
	}

	/**
	 * Creates RootAttributeOperation object from deserilized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/rootattributeoperation~RootAttributeOperation}
	 */
	static fromJSON( json, document ) {
		if ( !document.hasRoot( json.root ) ) {
			/**
			 * Cannot create RootAttributeOperation for document. Root with specified name does not exist.
			 *
			 * @error rootattributeoperation-fromjson-no-root
			 * @param {String} rootName
			 */
			throw new CKEditorError(
				'rootattribute-operation-fromjson-no-root: Cannot create RootAttributeOperation. Root with specified name does not exist.',
				{ rootName: json }
			);
		}

		return new RootAttributeOperation( document.getRoot( json.root ), json.key, json.oldValue, json.newValue, json.baseVersion );
	}
}
