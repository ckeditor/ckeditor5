/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/operation/renameoperation
 */

import Operation from './operation';
import Element from '../element';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import Position from '../position';

/**
 * Operation to change element's name.
 *
 * Using this class you can change element's name.
 *
 * @extends module:engine/model/operation/operation~Operation
 */
export default class RenameOperation extends Operation {
	/**
	 * Creates an operation that changes element's name.
	 *
	 * @param {module:engine/model/position~Position} position Position before an element to change.
	 * @param {String} oldName Current name of the element.
	 * @param {String} newName New name for the element.
	 * @param {Number} baseVersion {@link module:engine/model/document~Document#version} on which the operation can be applied.
	 */
	constructor( position, oldName, newName, baseVersion ) {
		super( baseVersion );

		/**
		 * Position before an element to change.
		 *
		 * @member {module:engine/model/position~Position} module:engine/model/operation/renameoperation~RenameOperation#position
		 */
		this.position = position;

		/**
		 * Current name of the element.
		 *
		 * @member {String} module:engine/model/operation/renameoperation~RenameOperation#oldName
		 */
		this.oldName = oldName;

		/**
		 * New name for the element.
		 *
		 * @member {String} module:engine/model/operation/renameoperation~RenameOperation#newName
		 */
		this.newName = newName;
	}

	/**
	 * @inheritDoc
	 */
	get type() {
		return 'rename';
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 *
	 * @returns {module:engine/model/operation/renameoperation~RenameOperation} Clone of this operation.
	 */
	clone() {
		return new RenameOperation( Position.createFromPosition( this.position ), this.oldName, this.newName, this.baseVersion );
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/renameoperation~RenameOperation}
	 */
	getReversed() {
		return new RenameOperation( Position.createFromPosition( this.position ), this.newName, this.oldName, this.baseVersion + 1 );
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		// Validation.
		const element = this.position.nodeAfter;

		if ( !( element instanceof Element ) ) {
			/**
			 * Given position is invalid or node after it is not instance of Element.
			 *
			 * @error rename-operation-wrong-position
			 */
			throw new CKEditorError(
				'rename-operation-wrong-position: Given position is invalid or node after it is not an instance of Element.'
			);
		} else if ( element.name !== this.oldName ) {
			/**
			 * Element to change has different name than operation's old name.
			 *
			 * @error rename-operation-wrong-name
			 */
			throw new CKEditorError(
				'rename-operation-wrong-name: Element to change has different name than operation\'s old name.'
			);
		}

		// If value to set is same as old value, don't do anything.
		if ( element.name != this.newName ) {
			// Execution.
			element.name = this.newName;
		}

		return { element, oldName: this.oldName };
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.operation.RenameOperation';
	}

	/**
	 * Creates `RenameOperation` object from deserialized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/attributeoperation~AttributeOperation}
	 */
	static fromJSON( json, document ) {
		return new RenameOperation( Position.fromJSON( json.position, document ), json.oldName, json.newName, json.baseVersion );
	}
}
