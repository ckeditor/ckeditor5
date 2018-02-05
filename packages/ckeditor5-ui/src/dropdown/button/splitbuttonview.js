/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/button/splitbuttonview
 */

import View from '../../view';
import ButtonView from '../../button/buttonview';

import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';

import dropdownArrowIcon from '../../../theme/icons/dropdown-arrow.svg';

import '../../../theme/components/button/splitbutton.css';

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
 * @implements module:ui/dropdown/dropdownbuttoninterface~DropdownButtonInterface
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
		 * Used to create a {@link #tooltip}.
		 *
		 * @observable
		 * @member {String} #label
		 */
		this.set( 'label' );

		/**
		 * (Optional) The keystroke associated with the button, i.e. <kbd>Ctrl</kbd>+<kbd>B</kbd>,
		 * in the string format compatible with {@link module:utils/keyboard}.
		 *
		 * @observable
		 * @member {Boolean} #keystroke
		 */
		this.set( 'keystroke' );

		/**
		 * (Optional) An XML {@link module:ui/icon/iconview~IconView#content content} of the icon.
		 * When defined, an {@link module:ui/button/buttonview~ButtonView#iconView} will be added to the {@link #actionView} button.
		 *
		 * @observable
		 * @member {String} #icon
		 */
		this.set( 'icon' );

		/**
		 * (Optional) Tooltip of the button, i.e. displayed when hovering the button with the mouse cursor.
		 *
		 * * If defined as a `Boolean` (e.g. `true`), then combination of `label` and `keystroke` will be set as a tooltip.
		 * * If defined as a `String`, tooltip will equal the exact text of that `String`.
		 * * If defined as a `Function`, `label` and `keystroke` will be passed to that function, which is to return
		 * a string with the tooltip text.
		 *
		 *		const view = new ButtonView( locale );
		 *		view.tooltip = ( label, keystroke ) => `A tooltip for ${ label } and ${ keystroke }.`
		 *
		 * @observable
		 * @default false
		 * @member {Boolean|String|Function} #tooltip
		 */
		this.set( 'tooltip' );

		/**
		 * Controls whether the button view is "on". It makes sense when a feature it represents
		 * is currently active, e.g. a bold button is "on" when the selection is in the bold text.
		 *
		 * To disable the button, use {@link #isEnabled} instead.
		 *
		 * @observable
		 * @member {Boolean} #isOn
		 */
		this.set( 'isOn', false );

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

		buttonView.bind( 'icon', 'isEnabled', 'label', 'isOn', 'tooltip', 'keystroke' ).to( this );

		buttonView.delegate( 'execute' ).to( this );

		return buttonView;
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

		arrowView.icon = dropdownArrowIcon;

		arrowView.extendTemplate( {
			attributes: {
				class: 'ck-splitbutton-arrow'
			}
		} );

		arrowView.bind( 'isEnabled' ).to( this );

		arrowView.delegate( 'execute' ).to( this, 'select' );

		return arrowView;
	}
}
