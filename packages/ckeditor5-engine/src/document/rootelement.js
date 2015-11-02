/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [], function() {
	/**
	 * Class for nodes that are roots of trees in tree data model.
	 *
	 * @class document.RootElement
	 */
	class RootElement extends Element {
		/**
		 * Creates tree root node.
		 *
		 * @param {document.Document} document {@link document.Document} that is an owner of the root.
		 * @constructor
		 */
		constructor( document ) {
			super( 'root' );

			/**
			 * {@link document.Document} that is an owner of this root.
			 *
			 * @readonly
			 * @protected
			 * @property {document.Document}
			 */
			this._document = document;
		}

		/**
		 * Document that is an owner of this root.
		 *
		 * @readonly
		 * @property {Document} document
		 */
		get document() {
			return this._document;
		}
	}

	return RootElement;
} );
