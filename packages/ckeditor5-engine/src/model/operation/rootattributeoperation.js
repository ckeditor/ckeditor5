/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Operation from './operation.js';
import CKEditorError from '../../../utils/ckeditorerror.js';

/**
 * Operation to change root element's attribute. Using this class you can add, remove or change value of the attribute.
 *
 * This operation is needed, because root elements can't be changed through {@link engine.model.operation.AttributeOperation}.
 * It is because {@link engine.model.operation.AttributeOperation} requires a range to change and root element can't
 * be a part of range because every {@link engine.model.Position} has to be inside a root. {@link engine.model.Position}
 * can't be created before a root element.
 *
 * @memberOf engine.model.operation
 * @extends engine.model.operation.Operation
 */
export default class RootAttributeOperation extends Operation {
	/**
	 * Creates an operation that changes, removes or adds attributes on root element.
	 *
	 * @see engine.model.operation.AttributeOperation
	 * @param {engine.model.RootElement} root Root element to change.
	 * @param {String} key Key of an attribute to change or remove.
	 * @param {*} oldValue Old value of the attribute with given key or `null` if adding a new attribute.
	 * @param {*} newValue New value to set for the attribute. If `null`, then the operation just removes the attribute.
	 * @param {Number} baseVersion {@link engine.model.Document#version} on which the operation can be applied.
	 */
	constructor( root, key, oldValue, newValue, baseVersion ) {
		super( baseVersion );

		/**
		 * Root element to change.
		 *
		 * @readonly
		 * @member {engine.model.RootElement} engine.model.operation.RootAttributeOperation#root
		 */
		this.root = root;

		/**
		 * Key of an attribute to change or remove.
		 *
		 * @readonly
		 * @member {String} engine.model.operation.RootAttributeOperation#key
		 */
		this.key = key;

		/**
		 * Old value of the attribute with given key or `null` if adding a new attribute.
		 *
		 * @readonly
		 * @member {*} engine.model.operation.RootAttributeOperation#oldValue
		 */
		this.oldValue = oldValue;

		/**
		 * New value to set for the attribute. If `null`, then the operation just removes the attribute.
		 *
		 * @readonly
		 * @member {*} engine.model.operation.RootAttributeOperation#newValue
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
	 * @returns {engine.model.operation.RootAttributeOperation}
	 */
	clone() {
		return new RootAttributeOperation( this.root, this.key, this.oldValue, this.newValue, this.baseVersion );
	}

	/**
	 * @returns {engine.model.operation.RootAttributeOperation}
	 */
	getReversed() {
		return new RootAttributeOperation( this.root, this.key, this.newValue, this.oldValue, this.baseVersion + 1 );
	}

	_execute() {
		if ( this.oldValue !== null && this.root.getAttribute( this.key ) !== this.oldValue ) {
			/**
			 * The attribute which should be removed does not exists for the given node.
			 *
			 * @error operation-rootattribute-no-attr-to-remove
			 * @param {engine.model.RootElement} root
			 * @param {String} key
			 * @param {*} value
			 */
			throw new CKEditorError(
				'operation-rootattribute-no-attr-to-remove: The attribute which should be removed does not exists for given node.',
				{ root: this.root, key: this.key }
			);
		}

		if ( this.oldValue === null && this.newValue !== null && this.root.hasAttribute( this.key ) ) {
			/**
			 * The attribute with given key already exists for the given node.
			 *
			 * @error operation-rootattribute-attr-exists
			 * @param {engine.model.RootElement} root
			 * @param {String} key
			 */
			throw new CKEditorError(
				'operation-rootattribute-attr-exists: The attribute with given key already exists.',
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
	 * @param {engine.model.Document} document Document on which this operation will be applied.
	 * @returns {engine.model.operation.RootAttributeOperation}
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
				'rootattributeoperation-fromjson-no-root: Cannot create RootAttributeOperation. Root with specified name does not exist.',
				{ rootName: json }
			);
		}

		return new RootAttributeOperation( document.getRoot( json.root ), json.key, json.oldValue, json.newValue, json.baseVersion );
	}
}
