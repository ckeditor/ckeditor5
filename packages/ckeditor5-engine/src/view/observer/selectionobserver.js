/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/selectionobserver
 */

/* global setInterval, clearInterval */

import Observer from './observer';
import MutationObserver from './mutationobserver';
import log from '@ckeditor/ckeditor5-utils/src/log';
import { debounce } from 'lodash-es';

/**
 * Selection observer class observes selection changes in the document. If selection changes on the document this
 * observer checks if there are any mutations and if DOM selection is different than the
 * {@link module:engine/view/document~Document#selection view selection}. Selection observer fires
 * {@link module:engine/view/document~Document#event:selectionChange} event only if selection change was the only change in the document
 * and DOM selection is different then the view selection.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~View} and is available by default.
 *
 * @see module:engine/view/observer/mutationobserver~MutationObserver
 * @extends module:engine/view/observer/observer~Observer
 */
export default class SelectionObserver extends Observer {
	constructor( view ) {
		super( view );

		/**
		 * Instance of the mutation observer. Selection observer calls
		 * {@link module:engine/view/observer/mutationobserver~MutationObserver#flush} to ensure that the mutations will be handled
		 * before the {@link module:engine/view/document~Document#event:selectionChange} event is fired.
		 *
		 * @readonly
		 * @member {module:engine/view/observer/mutationobserver~MutationObserver}
		 * module:engine/view/observer/selectionobserver~SelectionObserver#mutationObserver
		 */
		this.mutationObserver = view.getObserver( MutationObserver );

		/**
		 * Reference to the view {@link module:engine/view/documentselection~DocumentSelection} object used to compare
		 * new selection with it.
		 *
		 * @readonly
		 * @member {module:engine/view/documentselection~DocumentSelection}
		 * module:engine/view/observer/selectionobserver~SelectionObserver#selection
		 */
		this.selection = this.document.selection;

		/* eslint-disable max-len */
		/**
		 * Reference to the {@link module:engine/view/view~View#domConverter}.
		 *
		 * @readonly
		 * @member {module:engine/view/domconverter~DomConverter} module:engine/view/observer/selectionobserver~SelectionObserver#domConverter
		 */
		/* eslint-enable max-len */
		this.domConverter = view.domConverter;

		/**
		 * Set of documents which have added "selectionchange" listener to avoid adding listener twice to the same
		 * document.
		 *
		 * @private
		 * @member {WeakSet.<Document>} module:engine/view/observer/selectionobserver~SelectionObserver#_documents
		 */
		this._documents = new WeakSet();

		/**
		 * Fires debounced event `selectionChangeDone`. It uses `lodash#debounce` method to delay function call.
		 *
		 * @private
		 * @param {Object} data Selection change data.
		 * @method #_fireSelectionChangeDoneDebounced
		 */
		this._fireSelectionChangeDoneDebounced = debounce( data => this.document.fire( 'selectionChangeDone', data ), 200 );

		this._clearInfiniteLoopInterval = setInterval( () => this._clearInfiniteLoop(), 1000 );

		/**
		 * Private property to check if the code does not enter infinite loop.
		 *
		 * @private
		 * @member {Number} module:engine/view/observer/selectionobserver~SelectionObserver#_loopbackCounter
		 */
		this._loopbackCounter = 0;
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

		this.listenTo( domDocument, 'selectionchange', () => {
			this._handleSelectionChange( domDocument );
		} );

		this._documents.add( domDocument );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		clearInterval( this._clearInfiniteLoopInterval );
		this._fireSelectionChangeDoneDebounced.cancel();
	}

	/**
	 * Selection change listener. {@link module:engine/view/observer/mutationobserver~MutationObserver#flush Flush} mutations, check if
	 * selection changes and fires {@link module:engine/view/document~Document#event:selectionChange} event on every change
	 * and {@link module:engine/view/document~Document#event:selectionChangeDone} when selection stop changing.
	 *
	 * @private
	 * @param {Document} domDocument DOM document.
	 */
	_handleSelectionChange( domDocument ) {
		// Selection is handled when document is not focused but is read-only. This is because in read-only
		// mode contenteditable is set as false and editor won't receive focus but we still need to know
		// selection position.
		if ( !this.isEnabled || ( !this.document.isFocused && !this.document.isReadOnly ) ) {
			return;
		}

		// Ensure the mutation event will be before selection event on all browsers.
		this.mutationObserver.flush();

		// If there were mutations then the view will be re-rendered by the mutation observer and selection
		// will be updated, so selections will equal and event will not be fired, as expected.
		const domSelection = domDocument.defaultView.getSelection();
		const newViewSelection = this.domConverter.domSelectionToView( domSelection );

		if ( this.selection.isEqual( newViewSelection ) && this.domConverter.isDomSelectionCorrect( domSelection ) ) {
			return;
		}

		// Ensure we are not in the infinite loop (#400).
		// This counter is reset each second. 60 selection changes in 1 second is enough high number
		// to be very difficult (impossible) to achieve using just keyboard keys (during normal editor use).
		if ( ++this._loopbackCounter > 60 ) {
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

		if ( this.selection.isSimilar( newViewSelection ) ) {
			// If selection was equal and we are at this point of algorithm, it means that it was incorrect.
			// Just re-render it, no need to fire any events, etc.
			this.view.forceRender();
		} else {
			const data = {
				oldSelection: this.selection,
				newSelection: newViewSelection,
				domSelection
			};

			// Prepare data for new selection and fire appropriate events.
			this.document.fire( 'selectionChange', data );

			// Call` #_fireSelectionChangeDoneDebounced` every time when `selectionChange` event is fired.
			// This function is debounced what means that `selectionChangeDone` event will be fired only when
			// defined int the function time will elapse since the last time the function was called.
			// So `selectionChangeDone` will be fired when selection will stop changing.
			this._fireSelectionChangeDoneDebounced( data );
		}
	}

	/**
	 * Clears `SelectionObserver` internal properties connected with preventing infinite loop.
	 *
	 * @protected
	 */
	_clearInfiniteLoop() {
		this._loopbackCounter = 0;
	}
}

/**
 * Fired when selection has changed. This event is fired only when the selection change was the only change that happened
 * in the document, and old selection is different then the new selection.
 *
 * Introduced by {@link module:engine/view/observer/selectionobserver~SelectionObserver}.
 *
 * Note that because {@link module:engine/view/observer/selectionobserver~SelectionObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/selectionobserver~SelectionObserver
 * @event module:engine/view/document~Document#event:selectionChange
 * @param {Object} data
 * @param {module:engine/view/documentselection~DocumentSelection} data.oldSelection Old View selection which is
 * {@link module:engine/view/document~Document#selection}.
 * @param {module:engine/view/selection~Selection} data.newSelection New View selection which is converted DOM selection.
 * @param {Selection} data.domSelection Native DOM selection.
 */

/**
 * Fired when selection stops changing.
 *
 * Introduced by {@link module:engine/view/observer/selectionobserver~SelectionObserver}.
 *
 * Note that because {@link module:engine/view/observer/selectionobserver~SelectionObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/selectionobserver~SelectionObserver
 * @event module:engine/view/document~Document#event:selectionChangeDone
 * @param {Object} data
 * @param {module:engine/view/documentselection~DocumentSelection} data.oldSelection Old View selection which is
 * {@link module:engine/view/document~Document#selection}.
 * @param {module:engine/view/selection~Selection} data.newSelection New View selection which is converted DOM selection.
 * @param {Selection} data.domSelection Native DOM selection.
 */
