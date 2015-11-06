/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/operation/operation', 'ckeditorerror' ], function( Operation, CKEditorError ) {
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
			var oldAttr = this.oldAttr;
			var newAttr = this.newAttr;
			var value;

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
			if ( oldAttr !== null ) {
				for ( value of this.range ) {
					if ( !value.node.hasAttr( oldAttr ) ) {
						/**
						 * The attribute which should be removed does not exists for the given node.
						 *
						 * @error operation-change-no-attr-to-remove
						 * @param {document.Node} node
						 * @param {document.Attribute} attr
						 */
						throw new CKEditorError(
							'operation-change-no-attr-to-remove: The attribute which should be removed does not exists for given node.',
							{ node: value.node, attr: oldAttr } );
					}

					// There is no use in removing attribute if we will overwrite it later.
					// Still it is profitable to run through the loop to check if all nodes in the range has old attribute.
					if ( newAttr === null ) {
						value.node.removeAttr( oldAttr.key );
					}
				}
			}

			// Insert or change.
			if ( newAttr !== null ) {
				for ( value of this.range ) {
					if ( oldAttr === null && value.node.hasAttr( newAttr.key ) ) {
						/**
						 * The attribute with given key already exists for the given node.
						 *
						 * @error operation-change-attr-exists
						 * @param {document.Node} node
						 * @param {document.Attribute} attr
						 */
						throw new CKEditorError(
							'operation-change-attr-exists: The attribute with given key already exists.',
							{ node: value.node, attr: newAttr } );
					}

					value.node.setAttr( newAttr );
				}
			}
		}

		getReversed() {
			return new ChangeOperation( this.range, this.newAttr, this.oldAttr, this.baseVersion + 1 );
		}
	}

	return ChangeOperation;
} );
