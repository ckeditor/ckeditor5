/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/button/splitbuttonview
 */

import View from '../../view';
import ButtonView from '../../button/buttonview';

import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';

import dropdownArrowIcon from '../../../theme/icons/dropdown-arrow.svg';

import '../../../theme/components/dropdown/splitbutton.css';

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
 * Also see the {@link module:ui/dropdown/utils~createDropdown `createDropdown()` util}.
 *
 * @implements module:ui/dropdown/button/dropdownbutton~DropdownButton
 * @extends module:ui/view~View
 */
export default class SplitButtonView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		// Implement the Button interface.
		this.set( 'class' );
		this.set( 'icon' );
		this.set( 'isEnabled', true );
		this.set( 'isOn', false );
		this.set( 'isToggleable', false );
		this.set( 'isVisible', true );
		this.set( 'keystroke' );
		this.set( 'label' );
		this.set( 'tabindex', -1 );
		this.set( 'tooltip' );
		this.set( 'tooltipPosition', 's' );
		this.set( 'type', 'button' );
		this.set( 'withText', false );

		/**
		 * Collection of the child views inside of the split button {@link #element}.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

		/**
		 * A main button of split button.
		 *
		 * @readonly
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.actionView = this._createActionView();

		/**
		 * A secondary button of split button that opens dropdown.
		 *
		 * @readonly
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.arrowView = this._createArrowView();

		/**
		 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}. It manages
		 * keystrokes of the split button:
		 *
		 * * <kbd>▶</kbd> moves focus to arrow view when action view is focused,
		 * * <kbd>◀</kbd> moves focus to action view when arrow view is focused.
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
				class: [
					'ck',
					'ck-splitbutton',
					bind.to( 'class' ),
					bind.if( 'isVisible', 'ck-hidden', value => !value ),
					this.arrowView.bindTemplate.if( 'isOn', 'ck-splitbutton_open' )
				]
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
		this.children.add( this.arrowView );

		this.focusTracker.add( this.actionView.element );
		this.focusTracker.add( this.arrowView.element );

		this.keystrokes.listenTo( this.element );

		// Overrides toolbar focus cycling behavior.
		this.keystrokes.set( 'arrowright', ( evt, cancel ) => {
			if ( this.focusTracker.focusedElement === this.actionView.element ) {
				this.arrowView.focus();

				cancel();
			}
		} );

		// Overrides toolbar focus cycling behavior.
		this.keystrokes.set( 'arrowleft', ( evt, cancel ) => {
			if ( this.focusTracker.focusedElement === this.arrowView.element ) {
				this.actionView.focus();

				cancel();
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
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
		const actionView = new ButtonView();

		actionView.bind(
			'icon',
			'isEnabled',
			'isOn',
			'isToggleable',
			'keystroke',
			'label',
			'tabindex',
			'tooltip',
			'tooltipPosition',
			'type',
			'withText'
		).to( this );

		actionView.extendTemplate( {
			attributes: {
				class: 'ck-splitbutton__action'
			}
		} );

		actionView.delegate( 'execute' ).to( this );

		return actionView;
	}

	/**
	 * Creates a {@link module:ui/button/buttonview~ButtonView} instance as {@link #arrowView} and binds it with main split button
	 * attributes.
	 *
	 * @private
	 * @returns {module:ui/button/buttonview~ButtonView}
	 */
	_createArrowView() {
		const arrowView = new ButtonView();
		const bind = arrowView.bindTemplate;

		arrowView.icon = dropdownArrowIcon;

		arrowView.extendTemplate( {
			attributes: {
				class: 'ck-splitbutton__arrow',
				'aria-haspopup': true,
				'aria-expanded': bind.to( 'isOn', value => String( value ) )
			}
		} );

		arrowView.bind( 'isEnabled' ).to( this );

		arrowView.delegate( 'execute' ).to( this, 'open' );

		return arrowView;
	}
}
