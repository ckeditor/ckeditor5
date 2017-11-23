/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/button/buttonview
 */

import View from '../view';
import ButtonView from './buttonview';

import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';

/**
 * TODO
 */
export default class SplitButtonView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		this.children = this.createCollection();

		this.buttonView = this._createButtonView();
		this.arrowView = this._createArrowView();

		this.keystrokes = new KeystrokeHandler();
		this.focusTracker = new FocusTracker();

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: 'ck-splitbutton'
			},

			children: this.children
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.children.add( this.buttonView );
		this.children.add( this.arrowView );

		this.focusTracker.add( this.buttonView.element );
		this.focusTracker.add( this.arrowView.element );

		this.keystrokes.listenTo( this.element );

		// Overrides toolbar focus cycling behavior
		this.keystrokes.set( 'arrowright', ( evt, cancel ) => {
			if ( this.focusTracker.focusedElement === this.buttonView.element ) {
				this.arrowView.focus();

				cancel();
			}
		} );

		// Overrides toolbar focus cycling behavior
		this.keystrokes.set( 'arrowleft', ( evt, cancel ) => {
			if ( this.focusTracker.focusedElement === this.arrowView.element ) {
				this.buttonView.focus();

				cancel();
			}
		} );
	}

	focus() {
		this.buttonView.focus();
	}

	_createButtonView() {
		const buttonView = new ButtonView();

		buttonView.bind( 'icon' ).to( this, 'icon' );

		return buttonView;
	}

	_createArrowView() {
		const arrowView = new ButtonView();

		// TODO:
		arrowView.icon = 'abc';

		arrowView.extendTemplate( {
			attributes: {
				class: 'ck-splitbutton-arrow'
			}
		} );

		return arrowView;
	}
}
