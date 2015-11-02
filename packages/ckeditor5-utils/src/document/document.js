/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/element',
	'document/rootelement',
	'emittermixin',
	'utils',
	'ckeditorerror'
], function( Element, RootElement, EmitterMixin, utils, CKEditorError ) {
	var graveyardSymbol = Symbol( 'graveyard' );

	/**
	 * Document model.
	 *
	 * @class document.Document
	 */
	class Document {
		/**
		 * Create an empty document.
		 *
		 * @constructor
		 */
		constructor() {
			/**
			 * List of roots that are owned and managed by this document.
			 *
			 * @readonly
			 * @property {Map} roots
			 */
			this.roots = new Map();

			/**
			 * Graveyard tree root. Document always have a graveyard root, which is storing removed nodes.
			 */
			this.createRoot( graveyardSymbol );

			/**
			 * Document version. It starts from 0 and every operation increase the version. It is used to ensure that
			 * operations is applied on the proper document version. If the {@link document.Operation#baseVersion} will
			 * not match document version an {@link document-applyOperation-wrong-version} error is fired.
			 *
			 * @readonly
			 * @property {Number} version
			 */
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

		/**
		 * Creates a new top-level root.
		 *
		 * @param {String|Symbol} name Unique root name.
		 * @returns {document.RootElement} Created root.
		 */
		createRoot( name ) {
			if ( this.roots.has( name ) ) {
				/**
				 * Root with specified name already exists.
				 *
				 * @error document-createRoot-name-exists
				 * @param {document.Document} doc
				 * @param {String} name
				 */
				throw new CKEditorError(
					'document-createRoot-name-exists: Root with specified name already exists.',
					{ doc: this, name: name }
				);
			}

			var root = new RootElement( this );
			this.roots.set( root, name );

			return root;
		}

		/**
		 * Returns top-level root by it's name.
		 *
		 * @param {String|Symbol} name Name of the root to get.
		 * @returns (document.RootElement} Root registered under given name.
		 */
		getRoot( name ) {
			return this.roots.get( name );
		}

		/**
		 * Graveyard tree root. Document always have a graveyard root, which is storing removed nodes.
		 *
		 * @protected
		 * @readonly
		 * @property {document.RootElement} _graveyard
		 */
		get _graveyard() {
			return this.getRoot( graveyardSymbol );
		}
	}

	utils.extend( Document.prototype, EmitterMixin );

	return Document;
} );
