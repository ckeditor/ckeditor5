/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Operation from './operation.js';
import Element from '../element.js';
import CKEditorError from '../../../utils/ckeditorerror.js';
import Position from '../position.js';

/**
 * Operation to change element's name.
 *
 * Using this class you can change element's name.
 *
 * @memberOf engine.model.operation
 * @extends engine.model.operation.Operation
 */
export default class RenameOperation extends Operation {
	/**
	 * Creates an operation that changes element's name.
	 *
	 * @param {engine.model.Position} position Position before an element to change.
	 * @param {String} oldName Current name of the element.
	 * @param {String} newName New name for the element.
	 * @param {Number} baseVersion {@link engine.model.Document#version} on which the operation can be applied.
	 */
	constructor( position, oldName, newName, baseVersion ) {
		super( baseVersion );

		/**
		 * Position before an element to change.
		 *
		 * @member {engine.model.Position} engine.model.operation.RenameOperation#position
		 */
		this.position = position;

		/**
		 * Current name of the element.
		 *
		 * @member {String} engine.model.operation.RenameOperation#oldName
		 */
		this.oldName = oldName;

		/**
		 * New name for the element.
		 *
		 * @member {String} engine.model.operation.RenameOperation#newName
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
	 * @inheritDoc
	 * @returns {engine.model.operation.RenameOperation}
	 */
	clone() {
		return new RenameOperation( Position.createFromPosition( this.position ), this.oldName, this.newName, this.baseVersion );
	}

	/**
	 * @inheritDoc
	 * @returns {engine.model.operation.RenameOperation}
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

		element.name = this.newName;

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
	 * @param {engine.model.Document} document Document on which this operation will be applied.
	 * @returns {engine.model.operation.AttributeOperation}
	 */
	static fromJSON( json, document ) {
		return new RenameOperation( Position.fromJSON( json.position, document ), json.oldName, json.newName, json.baseVersion );
	}
}
