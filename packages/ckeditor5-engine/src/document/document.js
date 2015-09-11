/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/element' ], function( Element ) {
	/**
	 * Document model.
	 *
	 * @class document.Document
	 */
	class Document {
		/**
		 * Create an empty document.
		 */
		constructor() {
			/**
			 * Document tree root. Document always have an root document.
			 *
			 * @readonly
			 * @property {String} root
			 */
			this.root = new Element( null, 'root' );
		}

		/**
		 * This is the only entry point for all document changes.
		 *
		 * @param {document.Element} operation Operation to be applied.
		 */
		applyOperation() {
		}
	}

	return Document;
} );