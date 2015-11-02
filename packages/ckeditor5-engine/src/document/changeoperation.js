/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/operation', 'ckeditorerror' ], function( Operation, CKEditorError ) {
	/**
	 * Operation to change nodes attribute. Using this class you can add, remove or change value of the attribute.
	 *
	 * @class document.ChangeOperation
	 */
	class ChangeOperation extends Operation {
		/**
		 * Creates a change operation.
		 *
		 * If only new attribute is set it will be inserted. Note that there must be no attributes with the same key as
		 * a new attribute in all nodes in ranges.
		 *
		 * If only old attribute is set it will be removed. Note that this attribute must be present in all nodes in
		 * ranges.
		 *
		 * If both new and old attributes are set the operation will change the attribute value. Node that both new and
		 * old attributes have to have the same key and the old attribute must be present in all nodes in ranges.
		 *
		 * @param {document.Range} range Range on which operation should be applied.
		 * @param {document.Attribute|null} oldAttr Attribute to be removed. Null if operation just inserts a new attribute.
		 * @param {document.Attribute|null} newAttr Attribute to be added. Null if operation just removes an attribute.
		 * @param {Number} baseVersion {@link document.Document#version} on which operation can be applied.
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
			 * Old attribute to change. Null if operation inserts new attribute.
			 *
			 * @readonly
			 * @type {document.Attribute|null}
			 */
			this.oldAttr = oldAttr;

			/**
			 * New attribute. Null if operation removes attribute.
			 *
			 * @readonly
			 * @type {document.Attribute|null}
			 */
			this.newAttr = newAttr;
		}

		/**
		 * Execute operation.
		 *
		 * @protected
		 */
		_execute() {
			var oldAttr = this.oldAttr;
			var newAttr = this.newAttr;
			var value;

			if ( oldAttr !== null && newAttr !== null && oldAttr.key != newAttr.key ) {
				/**
				 * Old and new attributes should have the same keys.
				 *
				 * @error operation-change-different-keys
				 * @param {document.ChangeOperation} changeOperation
				 * @param {document.Attribute} oldAttr
				 * @param {document.Attribute} newAttr
				 */
				throw new CKEditorError(
					'operation-change-different-keys: Old and new attributes should have the same keys.',
					{ changeOperation: this, oldAttr: oldAttr, newAttr: newAttr } );
			}

			// Remove or change.
			if ( oldAttr !== null ) {
				for ( value of this.range ) {
					if ( !value.node.hasAttr( oldAttr ) ) {
						/**
						 * The attribute which should be removed does not exists for given node.
						 *
						 * @error operation-change-no-attr-to-remove
						 * @param {document.ChangeOperation} changeOperation
						 * @param {document.Node} node
						 * @param {document.Attribute} attr
						 */
						throw new CKEditorError(
							'operation-change-no-attr-to-remove: The attribute which should be removed does not exists for given node.',
							{ changeOperation: this, node: value.node, attr: oldAttr } );
					}

					// It looks like this condition should be in the if "above" but in that case we won't check if
					// the whole range has attribute oldAttr. If we want to be super-clean, we should check it even
					// if we don't apply any changes.
					if ( newAttr === null ) {
						value.node.removeAttr( oldAttr.key );
					}
				}
			}

			// Insert or change.
			if ( newAttr !== null ) {
				for ( value of this.range ) {
					if ( value.node.hasAttr( newAttr.key ) ) {
						/**
						 * The attribute with given key already exists for given node.
						 *
						 * @error operation-change-attr-exists
						 * @param {document.ChangeOperation} changeOperation
						 * @param {document.Node} node
						 * @param {document.Attribute} attr
						 */
						throw new CKEditorError(
							'operation-change-attr-exists: The attribute with given key already exists.',
							{ changeOperation: this, node: value.node, attr: newAttr } );
					}

					value.node.setAttr( newAttr );
				}
			}
		}

		/**
		 * Creates an reverse change operation.
		 *
		 * @returns {document.ChangeOperation} Reverse operation.
		 */
		reverseOperation() {
			return new ChangeOperation( this.range, this.newAttr, this.oldAttr, this.baseVersion + 1 );
		}
	}

	return ChangeOperation;
} );
