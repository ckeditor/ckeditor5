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

// TODO: temporary hack...
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

		this.actionView = this._createActionView();
		this.selectView = this._createSelectView();

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

		this.children.add( this.actionView );
		this.children.add( this.selectView );

		this.focusTracker.add( this.actionView.element );
		this.focusTracker.add( this.selectView.element );

		this.keystrokes.listenTo( this.element );

		// Overrides toolbar focus cycling behavior
		this.keystrokes.set( 'arrowright', ( evt, cancel ) => {
			if ( this.focusTracker.focusedElement === this.actionView.element ) {
				this.selectView.focus();

				cancel();
			}
		} );

		// Overrides toolbar focus cycling behavior
		this.keystrokes.set( 'arrowleft', ( evt, cancel ) => {
			if ( this.focusTracker.focusedElement === this.selectView.element ) {
				this.actionView.focus();

				cancel();
			}
		} );
	}

	focus() {
		this.actionView.focus();
	}

	_createActionView() {
		const buttonView = new ButtonView();

		buttonView.bind( 'icon', 'isEnabled', 'label' ).to( this );

		buttonView.delegate( 'execute' ).to( this );

		return buttonView;
	}

	_createSelectView() {
		const selectView = new ButtonView();

		selectView.icon = arrowIcon;

		selectView.extendTemplate( {
			attributes: {
				class: 'ck-splitbutton-arrow'
			}
		} );

		selectView.bind( 'isEnabled' ).to( this );

		selectView.delegate( 'execute' ).to( this, 'select' );

		return selectView;
	}
}
