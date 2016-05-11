/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Observer from './observer.js';
import MutationObserver from './mutationobserver.js';

/**
 * Selection observer class observes selection changes in the document. If selection change on the document this
 * observer checks if there are any mutations and if DOM selection is different then the
 * {@link engine.treeView.TreeView#selection view selection}. Selection observer fires
 * {@link engine.treeView.TreeView#selectionchange} event only if selection change was the only change in the document
 * and DOM selection is different then view selection.
 *
 * @see  engine.treeView.MutationObserver
 * @memberOf engine.treeView.observer
 * @extends engine.treeView.observer.Observer
 */
export default class SelectionObserver extends Observer {
	constructor( treeView ) {
		super( treeView );

		/**
		 * Instance of the mutation observer. Selection observer calls
		 * {@link engine.treeView.observer.MutationObserver#flush} to ensure mutations will be handled before the
		 * {@link engine.treeView.TreeView#selectionchange} event.
		 *
		 * @member {engine.treeView.observer.MutationObserver} engine.treeView.observer.SelectionObserver#mutationObserver
		 */
		this.mutationObserver = treeView.getObserver( MutationObserver );

		/**
		 * Reference to the {@link engine.treeView.TreeView} object.
		 *
		 * @readonly
		 * @member {engine.treeView.TreeView} engine.treeView.observer.SelectionObserver#treeView
		 */
		this.treeView = treeView;

		/**
		 * Reference to the TreeView {@link engine.treeView.Selection} object used to compare new selection with it.
		 *
		 * @readonly
		 * @member {engine.treeView.TreeView} engine.treeView.observer.SelectionObserver#selection
		 */
		this.selection = treeView.selection;

		/**
		 * Reference to the {@link engine.treeView.TreeView#domConverter}.
		 *
		 * @member {engine.treeView.DomConverter} engine.treeView.observer.SelectionObserver#domConverter
		 */
		this.domConverter = treeView.domConverter;

		/**
		 * Set of documents which have added "selectionchange" listener to avoid adding listener twice to the same
		 * document.
		 *
		 * @private
		 * @member {WeakSet.<Document>} engine.treeView.observer.SelectionObserver#_documents
		 */
		this._documents = new WeakSet();
	}

	/**
	 * @inheritDoc
	 */
	observe( domElement ) {
		const domDocument = domElement.ownerDocument;

		// Add listener once per each document.
		if ( this._documents.has( domDocument ) ) {
			return;
		}

		domDocument.addEventListener( 'selectionchange', () => this._handleSelectionChange( domDocument ) );

		this._documents.add( domDocument );
	}

	/**
	 * Selection change listener. {@link engine.treeView.observer.MutationObserver#flush Flush} mutations, check if
	 * selection changes and fires {@link engine.treeView.TreeView#selectionchange} event.
	 *
	 * @private
	 * @param {Document} domDocument DOM document.
	 */
	_handleSelectionChange( domDocument ) {
		if ( !this.isEnabled ) {
			return;
		}

		// Ensure the mutation event will be before selection event on all browsers.
		this.mutationObserver.flush();

		// If there were mutations then the view will be re-rendered by the mutations observer and selection
		// will be updated, so selection will be equal and event will not be fires, as expected.
		const domSelection = domDocument.defaultView.getSelection();
		const newViewSelection = this.domConverter.domSelectionToView( domSelection );

		if ( this.selection.isEqual( newViewSelection ) ) {
			return;
		}

		// Should be fired only when selection change was the only document change.
		this.treeView.fire( 'selectionchange', {
			oldSelection: this.selection,
			newSelection: newViewSelection,
			domSelection: domSelection
		} );

		this.treeView.render();
	}
}

/**
 * Fired when selection changes. This event is fired only when the selection change is the only change in the
 * document, and old selection is different then new selection.
 *
 * @event engine.treeView.TreeView#selection
 * @param {Object} data
 * @param {engine.treeView.Selection} data.oldSelection Old View selection which is
 * {@link engine.treeView.TreeView#selection}.
 * @param {engine.treeView.Selection} data.newSelection New View selection which is converted DOM selection.
 * @param {Selection} data.domSelection Native DOM selection.
 */
