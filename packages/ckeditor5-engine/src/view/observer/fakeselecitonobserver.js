/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Observer from './observer.js';
import ViewSelection from '../selection.js';
import RootEditableElement from '../rooteditableelement.js';
import { keyCodes } from '../../../utils/keyboard.js';

/**
 * Fake selection observer class. If view selection is fake it is placed in dummy DOM container. This observer listens
 * on {@link engine.view.Document#keydown keydown} events and handles moving fake view selection to the correct place
 * if arrow keys are pressed.
 * Fires {@link engine.view.Document#selectionChage selectionChage event} simulating natural behaviour of
 * {@link engine.view.observer.SelectionObserver SelectionObserver}.
 *
 * @memberOf engine.view.observer
 * @extends engine.view.observer.Observer
 * @fires engine.view.Document#selectionChage
 */
export default class FakeSelectionObserver extends Observer {
	constructor( document ) {
		super( document );

		document.on( 'keydown', ( eventInfo, data ) => {
			const selection = document.selection;

			if ( selection.isFake && _isArrowKeyCode( data.keyCode ) ) {
				// Prevents default keydown handling - no selection change will occur.
				data.preventDefault();

				// Find selected widget element in selection.
				const range = selection.getFirstRange();
				let widget;

				for ( let element of range.getItems() ) {
					if ( element.isWidget ) {
						widget = element;
					}
				}

				if ( !widget ) {
					return;
				}

				// Determine if widget is block.
				if ( widget.parent instanceof RootEditableElement ) {
					// TODO: handle moving with block widgets.
				} else {
					this._handleInlineWidget( widget, data.keyCode );
				}
			}
		}, { priority: 'lowest' } );
	}

	/**
	 * @inheritDoc
	 */
	observe() {}

	_handleInlineWidget( widgetElement, keyCode ) {
		const selection = this.document.selection;
		const newSelection = ViewSelection.createFromSelection( selection );
		newSelection.setFake( false );

		// Left or up arrow pressed - move selection to start.
		if ( keyCode == keyCodes.arrowleft || keyCode == keyCodes.arrowup ) {
			newSelection.collapseToStart();
		}

		// Right or down arrow pressed - move selection to end.
		if ( keyCode == keyCodes.arrowright || keyCode == keyCodes.arrowdown ) {
			newSelection.collapseToEnd();
		}

		// Check if another inline widget is next or before.
		// const anchor = newSelection.anchor;
		//
		// if ( anchor.nodeAfter && anchor.nodeAfter !== widgetElement && anchor.nodeAfter.isWidget ) {
		// 	newSelection.setRanges( [ ViewRange.createOn( anchor.nodeAfter ) ] );
		// } else if ( anchor.nodeBefore && anchor.nodeBefore !== widgetElement && anchor.nodeBefore.isWidget ) {
		// 	newSelection.setRanges( [ ViewRange.createOn( anchor.nodeBefore ) ] );
		// }

		this.document.fire( 'selectionChange', {
			oldSelection: selection,
			newSelection: newSelection,
			domSelection: null
		} );
	}
}

// Checks if one of the arrow keys is pressed.
//
// @private
// @param {Number} keyCode
// @returns {Boolean}
function _isArrowKeyCode( keyCode ) {
	return keyCode == keyCodes.arrowright ||
		keyCode == keyCodes.arrowleft ||
		keyCode == keyCodes.arrowup ||
		keyCode == keyCodes.arrowdown;
}

