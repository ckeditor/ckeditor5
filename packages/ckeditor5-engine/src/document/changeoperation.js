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
				var attrs, i, len;

				for ( var value of range ) {
					// TODO: if debug
					if ( !value.node.hasAttr( oldAttr ) ) {
						throw 'The attribute which should be removed does not exists.';
					}

					attrs = value.node.attrs;

					for ( i = 0, len = attrs.length; i < len; i++ ) {
						if ( attrs[ i ].isEquals( oldAttr ) ) {
							attrs.splice( i, 1 );
						}
					}
				}
			}

			function insert() {
				for ( var value of range ) {
					// TODO: if debug
					if ( value.node.hasAttr( newAttr.key ) ) {
						throw 'The attribute with given key already exists.';
					}

					value.node.attrs.push( newAttr );
				}
			}

			function change() {
				var attrs, i, len;

				for ( var value of range ) {
					// TODO: if debug
					if ( oldAttr.key != newAttr.key ) {
						throw 'Old and new attributes should have the same keys.';
					}

					// TODO: if debug
					if ( !value.node.hasAttr( oldAttr ) ) {
						throw 'The attribute which should be changed does not exists.';
					}

					attrs = value.node.attrs;

					for ( i = 0, len = attrs.length; i < len; i++ ) {
						if ( attrs[ i ].isEquals( oldAttr ) ) {
							attrs.splice( i, 1 );
						}
					}

					attrs.push( newAttr );
				}
			}
		}

		reverseOperation() {
			return new ChangeOperation( this.range, this.newAttr, this.oldAttr, this.baseVersion + 1 );
		}
	}

	return ChangeOperation;
} );