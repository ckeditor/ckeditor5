/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Operation from './operation.js';
import CKEditorError from '../../ckeditorerror.js';

/**
 * Operation to change root element's attribute. Using this class you can add, remove or change value of the attribute.
 *
 * This operation is needed, because root elements can't be changed through {@link core.treeModel.operation.AttributeOperation}.
 * It is because {@link core.treeModel.operation.AttributeOperation} requires a range to change and root element can't
 * be a part of range because every {@link core.treeModel.Position} has to be inside a root. {@link core.treeModel.Position}
 * can't be created before a root element.
 *
 * @memberOf core.treeModel.operation
 * @extends core.treeModel.operation.Operation
 */
export default class RootAttributeOperation extends Operation {
	/**
	 * Creates an operation that changes, removes or adds attributes on root element.
	 *
	 * @see core.treeModel.operation.AttributeOperation
	 * @param {core.treeModel.RootElement} root Root element to change.
	 * @param {String} key Key of an attribute to change or remove.
	 * @param {*} oldValue Old value of the attribute with given key or `null` if adding a new attribute.
	 * @param {*} newValue New value to set for the attribute. If `null`, then the operation just removes the attribute.
	 * @param {Number} baseVersion {@link core.treeModel.Document#version} on which the operation can be applied.
	 */
	constructor( root, key, oldValue, newValue, baseVersion ) {
		super( baseVersion );

		/**
		 * Root element to change.
		 *
		 * @readonly
		 * @member {core.treeModel.RootElement} core.treeModel.operation.RootAttributeOperation#root
		 */
		this.root = root;

		/**
		 * Key of an attribute to change or remove.
		 *
		 * @readonly
		 * @member {String} core.treeModel.operation.RootAttributeOperation#key
		 */
		this.key = key;

		/**
		 * Old value of the attribute with given key or `null` if adding a new attribute.
		 *
		 * @readonly
		 * @member {*} core.treeModel.operation.RootAttributeOperation#oldValue
		 */
		this.oldValue = oldValue;

		/**
		 * New value to set for the attribute. If `null`, then the operation just removes the attribute.
		 *
		 * @readonly
		 * @member {*} core.treeModel.operation.RootAttributeOperation#newValue
		 */
		this.newValue = newValue;
	}

	get type() {
		return 'rootattribute';
	}

	/**
	 * @returns {core.treeModel.operation.RootAttributeOperation}
	 */
	clone() {
		return new RootAttributeOperation( this.root, this.key, this.oldValue, this.newValue, this.baseVersion );
	}

	/**
	 * @returns {core.treeModel.operation.RootAttributeOperation}
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
			 * @param {core.treeModel.RootElement} root
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
			 * @param {core.treeModel.RootElement} root
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
}
