/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/operation/operation',
	'document/range',
	'document/operation/nooperation',
	'ckeditorerror',
	'document/operation/moveoperation',
	'document/operation/insertoperation'
], ( Operation, Range, NoOperation, CKEditorError ) => {
	/**
	 * Operation to change nodes' attribute. Using this class you can add, remove or change value of the attribute.
	 *
	 * @class document.operation.ChangeOperation
	 */
	class ChangeOperation extends Operation {
		/**
		 * Creates a change operation.
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
		 * @param {document.Range} range Range on which the operation should be applied.
		 * @param {document.Attribute|null} oldAttr Attribute to be removed. If `null`, then the operation just inserts a new attribute.
		 * @param {document.Attribute|null} newAttr Attribute to be added. If `null`, then the operation just removes the attribute.
		 * @param {Number} baseVersion {@link document.Document#version} on which the operation can be applied.
		 * @constructor
		 */
		constructor( range, oldAttr, newAttr, baseVersion ) {
			super( baseVersion );

			/**
			 * Range on which operation should be applied.
			 *
			 * @readonly
			 * @type {document.Range}
			 */
			this.range = range;

			/**
			 * Old attribute to change. Set to `null` if operation inserts a new attribute.
			 *
			 * @readonly
			 * @type {document.Attribute|null}
			 */
			this.oldAttr = oldAttr;

			/**
			 * New attribute. Set to `null` if operation removes the attribute.
			 *
			 * @readonly
			 * @type {document.Attribute|null}
			 */
			this.newAttr = newAttr;
		}

		_execute() {
			const oldAttr = this.oldAttr;
			const newAttr = this.newAttr;
			let value;

			if ( oldAttr !== null && newAttr !== null && oldAttr.key != newAttr.key ) {
				/**
				 * Old and new attributes should have the same keys.
				 *
				 * @error operation-change-different-keys
				 * @param {document.Attribute} oldAttr
				 * @param {document.Attribute} newAttr
				 */
				throw new CKEditorError(
					'operation-change-different-keys: Old and new attributes should have the same keys.',
					{ oldAttr: oldAttr, newAttr: newAttr } );
			}

			// Remove or change.
			if ( oldAttr !== null && newAttr === null ) {
				for ( value of this.range ) {
					value.node.removeAttr( oldAttr.key );
				}
			}

			// Insert or change.
			if ( newAttr !== null ) {
				for ( value of this.range ) {
					value.node.setAttr( newAttr );
				}
			}
		}

		getReversed() {
			return new ChangeOperation( this.range, this.newAttr, this.oldAttr, this.baseVersion + 1 );
		}
		clone( baseVersion ) {
			if ( !baseVersion ) {
				baseVersion = this.baseVersion;
			}

			return new ChangeOperation( this.range.clone(), this.oldAttr, this.newAttr, baseVersion );
		}
	}

	return ChangeOperation;
} );
