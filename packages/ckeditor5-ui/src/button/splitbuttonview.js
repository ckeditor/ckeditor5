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
 * The split button view class.
 *
 *		const view = new SplitButtonView();
 *
 *		view.set( {
 *			label: 'A button',
 *			keystroke: 'Ctrl+B',
 *			tooltip: true
 *		} );
 *
 *		view.render();
 *
 *		document.body.append( view.element );
 *
 * @extends module:ui/view~View
 */
export default class SplitButtonView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * Controls whether the button view is enabled, i.e. it can be clicked and execute an action.
		 *
		 * To change the "on" state of the button, use {@link #isOn} instead.
		 *
		 * @observable
		 * @member {Boolean} #isEnabled
		 */
		this.set( 'isEnabled', true );

		/**
		 * The label of the button view visible to the user when {@link #withText} is `true`.
		 * It can also be used to create a {@link #tooltip}.
		 *
		 * @observable
		 * @member {String} #label
		 */
		this.set( 'label' );

		/**
		 * (Optional) An XML {@link module:ui/icon/iconview~IconView#content content} of the icon.
		 * When defined, an {@link #iconView} will be added to the action button.
		 *
		 * @observable
		 * @member {String} #icon
		 */
		this.set( 'icon' );

		/**
		 * Collection of the child views inside of the split button {@link #element}.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

		this.actionView = this._createActionView();
		this.selectView = this._createSelectView();

		/**
		 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}. It manages
		 * keystrokes of the split button:
		 *
		 * * <kbd>▶</kbd> moves focus to select view when action view is focused,
		 * * <kbd>◀</kbd> moves focus to action view when select view is focused.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * Tracks information about DOM focus in the dropdown.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
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

		// Overrides toolbar focus cycling behavior.
		this.keystrokes.set( 'arrowright', ( evt, cancel ) => {
			if ( this.focusTracker.focusedElement === this.actionView.element ) {
				this.selectView.focus();

				cancel();
			}
		} );

		// Overrides toolbar focus cycling behavior.
		this.keystrokes.set( 'arrowleft', ( evt, cancel ) => {
			if ( this.focusTracker.focusedElement === this.selectView.element ) {
				this.actionView.focus();

				cancel();
			}
		} );
	}

	/**
	 * Focuses the {@link #actionView#element} of the action part of split button.
	 */
	focus() {
		this.actionView.focus();
	}

	/**
	 * Creates a {@link module:ui/button/buttonview~ButtonView} instance as {@link #actionView} and binds it with main split button
	 * attributes.
	 *
	 * @private
	 * @returns {module:ui/button/buttonview~ButtonView}
	 */
	_createActionView() {
		const buttonView = new ButtonView();

		buttonView.bind( 'icon', 'isEnabled', 'label' ).to( this );

		buttonView.delegate( 'execute' ).to( this );

		return buttonView;
	}

	/**
	 * Creates a {@link module:ui/button/buttonview~ButtonView} instance as {@link #selectView} and binds it with main split button
	 * attributes.
	 *
	 * @private
	 * @returns {module:ui/button/buttonview~ButtonView}
	 */
	_createSelectView() {
		const selectView = new ButtonView();

		selectView.icon = arrowIcon;

		selectView.extendTemplate( {
			attributes: {
				class: 'ck-splitbutton-select'
			}
		} );

		selectView.bind( 'isEnabled' ).to( this );

		selectView.delegate( 'execute' ).to( this, 'select' );

		return selectView;
	}
}
