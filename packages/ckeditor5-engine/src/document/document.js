/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/element',
	'document/rootelement',
	'document/transaction',
	'emittermixin',
	'utils',
	'ckeditorerror'
], ( Element, RootElement, Transaction, EmitterMixin, utils, CKEditorError ) => {
	const graveyardSymbol = Symbol( 'graveyard' );

	/**
	 * Document tree model describes all editable data in the editor. It may contain multiple {@link #roots root elements},
	 * for example if the editor have multiple editable areas, each area will be represented by the separate root.
	 *
	 * All changes in the document are done by {@link document.operation.Operation operations}. To create operations in
	 * the simple way use use the {@link document.Transaction transaction} API, for example:
	 *
	 *		document.createTransaction().insert( position, nodes ).split( otherPosition );
	 *
	 * @see #createTransaction
	 *
	 * @class document.Document
	 */
	class Document {
		/**
		 * Creates an empty document instance with no {@link #roots}.
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

			// Graveyard tree root. Document always have a graveyard root, which stores removed nodes.
			this.createRoot( graveyardSymbol );

			/**
			 * Document version. It starts from `0` and every operation increases the version number. It is used to ensure that
			 * operations are applied on the proper document version. If the {@link document.operation.Operation#baseVersion} will
			 * not match document version the {@link document-applyOperation-wrong-version} error is thrown.
			 *
			 * @readonly
			 * @property {Number} version
			 */
			this.version = 0;
		}

		/**
		 * Graveyard tree root. Document always have a graveyard root, which stores removed nodes.
		 *
		 * @protected
		 * @readonly
		 * @property {document.RootElement} _graveyard
		 */
		get _graveyard() {
			return this.getRoot( graveyardSymbol );
		}

		/**
		 * This is the entry point for all document changes. All changes on the document are done using
		 * {@link document.operation.Operation operations}. To create operations in the simple way use the
		 * {@link document.Transaction} API available via {@link #createTransaction} method.
		 *
		 * @param {document.operation.Operation} operation Operation to be applied.
		 */
		applyOperation( operation ) {
			if ( operation.baseVersion !== this.version ) {
				/**
				 * Only operations with matching versions can be applied.
				 *
				 * @error document-applyOperation-wrong-version
				 * @param {document.operation.Operation} operation
				 */
				throw new CKEditorError(
					'document-applyOperation-wrong-version: Only operations with matching versions can be applied.',
					{ operation: operation } );
			}

			let changes = operation._execute();

			this.version++;

			changes.type = operation.type;
			this.fire( 'change', changes );
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
					{ name: name }
				);
			}

			const root = new RootElement( this );
			this.roots.set( name, root );

			return root;
		}

		/**
		 * Creates a {@link document.Transaction} instance which allows to change the document.
		 *
		 * @returns {document.Transaction} Transaction instance.
		 */
		createTransaction() {
			return new Transaction( this );
		}

		/**
		 * Returns top-level root by it's name.
		 *
		 * @param {String|Symbol} name Name of the root to get.
		 * @returns (document.RootElement} Root registered under given name.
		 */
		getRoot( name ) {
			if ( !this.roots.has( name ) ) {
				/**
				 * Root with specified name does not exist.
				 *
				 * @error document-createRoot-root-not-exist
				 * @param {String} name
				 */
				throw new CKEditorError(
					'document-createRoot-root-not-exist: Root with specified name does not exist.',
					{ name: name }
				);
			}

			return this.roots.get( name );
		}
	}

	utils.extend( Document.prototype, EmitterMixin );

	return Document;
} );
