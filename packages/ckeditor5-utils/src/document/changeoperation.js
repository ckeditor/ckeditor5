/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/operation' ], function( Operation ) {
	/**
	 *
	 *
	 * @class document.Operation
	 */
	class ChangeOperation extends Operation {
		/**
		 *
		 */
		constructor( range, oldAttr, newAttr, baseVersion ) {
			super( baseVersion );

			this.range = range;
			this.oldAttr = oldAttr;
			this.newAttr = newAttr;
		}

		_execute() {
			var range = this.range;
			var oldAttr = this.oldAttr;
			var newAttr = this.newAttr;

			if ( newAttr === null ) {
				remove();
			} else if ( oldAttr === null ) {
				insert();
			} else {
				change();
			}

			function remove() {
				for ( var value of range ) {
					// TODO: if debug
					if ( !value.node.hasAttr( oldAttr ) ) {
						throw 'The attribute which should be removed does not exists.';
					}

					doRemove( value.node.attrs, oldAttr );
				}
			}

			function insert() {
				for ( var value of range ) {
					// TODO: if debug
					if ( value.node.hasAttr( newAttr.key ) ) {
						throw 'The attribute with given key already exists.';
					}

					doInsert( value.node.attrs, newAttr );
				}
			}

			function change() {
				for ( var value of range ) {
					// TODO: if debug
					if ( oldAttr.key != newAttr.key ) {
						throw 'Old and new attributes should have the same keys.';
					}

					// TODO: if debug
					if ( !value.node.hasAttr( oldAttr ) ) {
						throw 'The attribute which should be changed does not exists.';
					}

					doRemove( value.node.attrs, oldAttr );

					doInsert( value.node.attrs, newAttr );
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
			return new ChangeOperation( this.range, this.newAttr, this.oldAttr, this.baseVersion + 1 );
		}
	}

	return ChangeOperation;
} );