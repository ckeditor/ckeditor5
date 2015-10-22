/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/operation', 'ckeditorerror', 'utils' ], function( Operation, CKEditorError, utils ) {
	/**
	 *
	 *
	 * @class document.Operation
	 */
	class ChangeOperation extends Operation {
		/**
		 *
		 */
		constructor( ranges, oldAttr, newAttr, baseVersion ) {
			super( baseVersion );

			this.ranges = utils.isArray( ranges ) ? ranges : [ ranges ];
			this.oldAttr = oldAttr;
			this.newAttr = newAttr;
		}

		_execute() {
			var ranges = this.ranges;
			var oldAttr = this.oldAttr;
			var newAttr = this.newAttr;

			var value, range;

			// Remove.
			if ( newAttr === null ) {
				for ( range of ranges ) {
					for ( value of range ) {
						if ( !value.node.hasAttr( oldAttr ) ) {
							/**
							 * The attribute which should be removed does not exists.
							 *
							 * @error operation-change-no-attr-to-remove
							 * @param {document.ChangeOperation} changeOperation
							 * @param {document.Node} node
							 * @param {document.Attribute} attr
							 */
							throw new CKEditorError(
								'operation-change-no-attr-to-remove: The attribute which should be removed does not exists.',
								{ changeOperation: this, node: value.node, attr: oldAttr } );
						}

						doRemove( value.node.attrs, oldAttr );
					}
				}
			}
			// Insert.
			else if ( oldAttr === null ) {
				for ( range of ranges ) {
					for ( value of range ) {
						if ( value.node.hasAttr( newAttr.key ) ) {
							/**
							 * The attribute with given key already exists.
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

						doInsert( value.node.attrs, newAttr );
					}
				}
			}
			// Change.
			else {
				if ( oldAttr.key != newAttr.key ) {
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

				for ( range of ranges ) {
					for ( value of range ) {
						if ( !value.node.hasAttr( oldAttr ) ) {
							/**
							 * The attribute which should be changed does not exists.
							 *
							 * @error operation-change-no-attr-to-change
							 * @param {document.ChangeOperation} changeOperation
							 * @param {document.Node} node
							 * @param {document.Attribute} oldAttr
							 * @param {document.Attribute} newAttr
							 */
							throw new CKEditorError(
								'operation-change-no-attr-to-change: The attribute which should be changed does not exists.',
								{ changeOperation: this, node: value.node, oldAttr: oldAttr, newAttr: newAttr } );
						}

						doRemove( value.node.attrs, oldAttr );

						doInsert( value.node.attrs, newAttr );
					}
				}
			}

			function doRemove( attrs, attrToRemove ) {
				var i, len;

				for ( i = 0, len = attrs.length; i < len; i++ ) {
					if ( attrs[ i ].isEqual( attrToRemove ) ) {
						attrs.splice( i, 1 );

						return;
					}
				}
			}

			function doInsert( attrs, attrToInsert ) {
				attrs.push( attrToInsert );
			}
		}

		reverseOperation() {
			return new ChangeOperation( this.ranges, this.newAttr, this.oldAttr, this.baseVersion + 1 );
		}
	}

	return ChangeOperation;
} );