/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Observer from './observer.js';
import MutationObserver from './mutationobserver.js';

export default class SelectionObserver extends Observer {
	constructor( treeView ) {
		super( treeView );

		this.mutationObserver = treeView.getObserver( MutationObserver );

		this.treeView = treeView;

		this.selection = treeView.selection;

		this.domConverter = treeView.domConverter;

		this.documents = new WeakSet();
	}

	observe( domElement ) {
		const domDocument = domElement.ownerDocument;

		if ( this.documents.has( domDocument ) ) {
			return;
		}
		this._handleSelectionChange();

		domDocument.addEventListener( 'selectionchange', () => this._handleSelectionChange( domDocument ) );

		this.documents.add( domDocument );
	}

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