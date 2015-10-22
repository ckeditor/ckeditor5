/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/element',
	'emittermixin',
	'utils',
	'ckeditorerror'
], function( Element, EmitterMixin, utils, CKEditorError ) {
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
			this.root = new Element( 'root' );

			this.version = 0;
		}

		/**
		 * This is the only entry point for all document changes.
		 *
		 * @param {document.Operation} operation Operation to be applied.
		 */
		applyOperation( operation ) {
			if ( operation.baseVersion !== this.version ) {
				/**
				 * Only operations with matching versions can be applied.
				 *
				 * @error document-applyOperation-wrong-version
				 * @param {document.Document} doc
				 * @param {document.Operation} operation
				 * @param {Number} baseVersion
				 * @param {Number} documentVersion
				 */
				throw new CKEditorError(
					'document-applyOperation-wrong-version: Only operations with matching versions can be applied.',
					{ doc: this, operation: operation, baseVersion: operation.baseVersion, documentVersion: this.version } );
			}

			operation._execute();
			this.version++;
			this.fire( 'operationApplied', operation );
		}
	}

	utils.extend( Document.prototype, EmitterMixin );

	return Document;
} );