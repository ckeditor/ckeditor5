/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Observer from './observer.js';
import MutationObserver from './mutationobserver.js';

import log from '../../../utils/log.js';

/**
 * Selection observer class observes selection changes in the document. If selection changes on the document this
 * observer checks if there are any mutations and if DOM selection is different than the
 * {@link engine.view.Document#selection view selection}. Selection observer fires
 * {@link engine.view.Document#selectionChange} event only if selection change was the only change in the document
 * and DOM selection is different then the view selection.
 *
 * Note that this observer is attached by the {@link engine.EditingController} and is available by default.
 *
 * @see engine.view.MutationObserver
 * @memberOf engine.view.observer
 * @extends engine.view.observer.Observer
 */
export default class SelectionObserver extends Observer {
	constructor( document ) {
		super( document );

		/**
		 * Instance of the mutation observer. Selection observer calls
		 * {@link engine.view.observer.MutationObserver#flush} to ensure that the mutations will be handled before the
		 * {@link engine.view.Document#selectionChange} event is fired.
		 *
		 * @readonly
		 * @member {engine.view.observer.MutationObserver} engine.view.observer.SelectionObserver#mutationObserver
		 */
		this.mutationObserver = document.getObserver( MutationObserver );

		/**
		 * Reference to the {@link engine.view.Document} object.
		 *
		 * @readonly
		 * @member {engine.view.Document} engine.view.observer.SelectionObserver#document
		 */
		this.document = document;

		/**
		 * Reference to the view {@link engine.view.Selection} object used to compare new selection with it.
		 *
		 * @readonly
		 * @member {engine.view.Selection} engine.view.observer.SelectionObserver#selection
		 */
		this.selection = document.selection;

		/**
		 * Reference to the {@link engine.view.Document#domConverter}.
		 *
		 * @readonly
		 * @member {engine.view.DomConverter} engine.view.observer.SelectionObserver#domConverter
		 */
		this.domConverter = document.domConverter;

		/**
		 * Set of documents which have added "selectionchange" listener to avoid adding listener twice to the same
		 * document.
		 *
		 * @private
		 * @member {WeakSet.<Document>} engine.view.observer.SelectionObserver#_documents
		 */
		this._documents = new WeakSet();

		/**
		 * Private property to store the last selection, to check if the code does not enter infinite loop.
		 *
		 * @private
		 * @member {engine.view.Selection} engine.view.observer.SelectionObserver#_lastSelection
		 */

		/**
		 * Private property to store the last but one selection, to check if the code does not enter infinite loop.
		 *
		 * @private
		 * @member {engine.view.Selection} engine.view.observer.SelectionObserver#_lastButOneSelection
		 */

		/**
		 * Private property to check if the code does not enter infinite loop.
		 *
		 * @private
		 * @member {Number} engine.view.observer.SelectionObserver#_loopbackCounter
		 */
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
	 * Selection change listener. {@link engine.view.observer.MutationObserver#flush Flush} mutations, check if
	 * selection changes and fires {@link engine.view.Document#selectionChange} event.
	 *
	 * @private
	 * @param {Document} domDocument DOM document.
	 */
	_handleSelectionChange( domDocument ) {
		if ( !this.isEnabled || !this.document.isFocused ) {
			return;
		}

		// Ensure the mutation event will be before selection event on all browsers.
		this.mutationObserver.flush();

		// If there were mutations then the view will be re-rendered by the mutation observer and selection
		// will be updated, so selections will equal and event will not be fired, as expected.
		const domSelection = domDocument.defaultView.getSelection();

		const newViewSelection = this.domConverter.domSelectionToView( domSelection );

		if ( this.selection.isEqual( newViewSelection ) ) {
			return;
		}

		// Ensure we are not in the infinite loop (#400).
		if ( this._isInfiniteLoop( newViewSelection ) ) {
			/**
			 * Selection change observer detected an infinite rendering loop.
			 * Most probably you try to put the selection in the position which is not allowed
			 * by the browser and browser fixes it automatically what causes `selectionchange` event on
			 * which a loopback through a model tries to re-render the wrong selection and again.
			 *
			 * @error selectionchange-infinite-loop
			 */
			log.warn( 'selectionchange-infinite-loop: Selection change observer detected an infinite rendering loop.' );

			return;
		}

		// Should be fired only when selection change was the only document change.
		this.document.fire( 'selectionChange', {
			oldSelection: this.selection,
			newSelection: newViewSelection,
			domSelection: domSelection
		} );

		this.document.render();
	}

	/**
	 * Checks if selection rendering entered an infinite loop.
	 *
	 * See https://github.com/ckeditor/ckeditor5-engine/issues/400.
	 *
	 * @private
	 * @param {engine.view.Selection} newSelection DOM selection converted to view.
	 * @returns {Boolean} True is the same selection repeat more then 10 times.
	 */
	_isInfiniteLoop( newSelection ) {
		// If the position is the same a the last one or the last but one we increment the counter.
		// We need to check last two selections because the browser will first fire a selectionchange event
		// for an incorrect selection and then for a corrected one.
		if ( this._lastSelection && this._lastButOneSelection &&
			( newSelection.isEqual( this._lastSelection ) || newSelection.isEqual( this._lastButOneSelection ) ) ) {
			this._loopbackCounter++;
		} else {
			this._lastButOneSelection = this._lastSelection;
			this._lastSelection = newSelection;
			this._loopbackCounter = 0;
		}

		if ( this._loopbackCounter > 10 ) {
			return true;
		}

		return false;
	}
}

/**
 * Fired when selection has changed. This event is fired only when the selection change was the only change that happened
 * in the document, and old selection is different then the new selection.
 *
 * Introduced by {@link engine.view.observer.SelectionObserver}.
 *
 * Note that because {@link engine.view.observer.SelectionObserver} is attached by the {@link engine.EditingController}
 * this event is available by default.
 *
 * @see engine.view.observer.SelectionObserver
 * @event engine.view.Document#selectionChange
 * @param {Object} data
 * @param {engine.view.Selection} data.oldSelection Old View selection which is
 * {@link engine.view.Document#selection}.
 * @param {engine.view.Selection} data.newSelection New View selection which is converted DOM selection.
 * @param {Selection} data.domSelection Native DOM selection.
 */
