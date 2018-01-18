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

import arrowIcon from '@ckeditor/ckeditor5-core/theme/icons/low-vision.svg';

import './../../theme/components/button/splitbutton.css';

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
		this.selectView = this._createArrowView();

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
		this.children.add( this.selectView );

		this.focusTracker.add( this.buttonView.element );
		this.focusTracker.add( this.selectView.element );

		this.keystrokes.listenTo( this.element );

		// Overrides toolbar focus cycling behavior
		this.keystrokes.set( 'arrowright', ( evt, cancel ) => {
			if ( this.focusTracker.focusedElement === this.buttonView.element ) {
				this.selectView.focus();

				cancel();
			}
		} );

		// Overrides toolbar focus cycling behavior
		this.keystrokes.set( 'arrowleft', ( evt, cancel ) => {
			if ( this.focusTracker.focusedElement === this.selectView.element ) {
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

		buttonView.delegate( 'execute' ).to( this );

		buttonView.bind( 'isEnabled' ).to( this );
		buttonView.bind( 'label' ).to( this );

		return buttonView;
	}

	_createArrowView() {
		const selectView = new ButtonView();

		selectView.icon = arrowIcon;

		selectView.extendTemplate( {
			attributes: {
				class: 'ck-splitbutton-arrow'
			}
		} );

		selectView.delegate( 'execute' ).to( this, 'select' );

		selectView.bind( 'isEnabled' ).to( this );

		return selectView;
	}
}
