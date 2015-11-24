/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/element' ], ( Element ) => {
	/**
	 * Class for nodes that are roots of trees in tree data model.
	 *
	 * @class document.RootElement
	 */
	class RootElement extends Element {
		/**
		 * Creates tree root node.
		 *
		 * @param {document.Document} doc {@link document.Document} that is an owner of the root.
		 * @constructor
		 */
		constructor( doc ) {
			super( 'root' );

			/**
			 * {@link document.Document} that is an owner of this root.
			 *
			 * @readonly
			 * @property {document.Document}
			 */
			this.document = doc;
		}
	}

	return RootElement;
} );
