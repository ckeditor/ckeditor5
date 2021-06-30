/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/ui/checkboxview
 */

import { View } from 'ckeditor5/src/ui';
import { getCode } from 'ckeditor5/src/utils';

/**
 * The checkbox view class.
 *
 * @extends module:ui/view~View
 */
export default class CheckboxView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * (Optional) The additional CSS class set on the button.
		 *
		 * @observable
		 * @member {String} #class
		 */
		this.set( 'class' );

		/**
		 * Controls whether the checkbox view is enabled, i.e. it can be clicked and can execute an action.
		 *
		 * @observable
		 * @default true
		 * @member {Boolean} #isEnabled
		 */
		this.set( 'isEnabled', true );

		/**
		 * Controls whether the checkbox view is visible. Visible by default, the checkboxes are hidden
		 * using a CSS class.
		 *
		 * @observable
		 * @default true
		 * @member {Boolean} #isVisible
		 */
		this.set( 'isVisible', true );

		/**
		 * Indicates whether a related checkbox is checked.
		 *
		 * @observable
		 * @default false
		 * @member {Boolean} #isChecked
		 */
		this.set( 'isChecked', false );

		/**
		 * The text of the label associated with the checkbox view.
		 *
		 * @observable
		 * @member {String} #label
		 */
		this.set( 'label' );

		/**
		 * The HTML `id` attribute to be assigned to the checkbox.
		 *
		 * @observable
		 * @default null
		 * @member {String|null} #id
		 */
		this.set( 'id', null );

		/**
		 * (Optional) Controls the `tabindex` HTML attribute of the checkbox. By default, the checkbox is focusable
		 * but is not included in the <kbd>Tab</kbd> order.
		 *
		 * @observable
		 * @default -1
		 * @member {String} #tabindex
		 */
		this.set( 'tabindex', -1 );

		/**
		 * The collection of the child views inside of the checkbox {@link #element}.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

		/**
		 * The label of the checkbox view. It is configurable using the {@link #label label attribute}.
		 *
		 * @readonly
		 * @member {module:ui/view~View} #labelView
		 */
		this.labelView = this._createLabelView( );

		/**
		 * The input of the checkbox view.
		 *
		 * @readonly
		 * @member {module:ui/view~View} #checkboxInputView
		 */
		this.checkboxInputView = this._createCheckboxInputView();

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					bind.to( 'class' ),
					bind.if( 'isEnabled', 'ck-disabled', value => !value ),
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				],
				tabindex: bind.to( 'tabindex' )
			},

			on: {
				keydown: bind.to( evt => {
					// Need to check target. Otherwise we would handle space press on input[type=text] and it would change
					// checked property twice due to default browser handling kicking in too.
					if ( evt.target === this.element && evt.keyCode == getCode( 'space' ) ) {
						this.isChecked = !this.isChecked;
					}
				} )
			},

			children: this.children
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.children.add( this.checkboxInputView );
		this.children.add( this.labelView );
	}

	/**
	 * Focuses the {@link #element} of the checkbox.
	 */
	focus() {
		this.element.focus();
	}

	/**
	 * Creates a checkbox input view instance and binds it with checkbox attributes.
	 *
	 * @private
	 * @returns {module:ui/view~View}
	 */
	_createCheckboxInputView() {
		const checkboxInputView = new View();
		const bind = this.bindTemplate;

		checkboxInputView.setTemplate( {
			tag: 'input',
			attributes: {
				type: 'checkbox',
				id: bind.to( 'id' ),
				'checked': bind.if( 'isChecked' ),
				'disabled': bind.if( 'isEnabled', true, value => !value ),
				'aria-disabled': bind.if( 'isEnabled', true, value => !value )
			},

			on: {
				change: bind.to( evt => {
					this.isChecked = evt.target.checked;
				} )
			}
		} );

		return checkboxInputView;
	}

	/**
	 * Creates a label view instance and binds it with checkbox attributes.
	 *
	 * @private
	 * @returns {module:ui/view~View}
	 */
	_createLabelView() {
		const labelView = new View();

		labelView.setTemplate( {
			tag: 'label',

			attributes: {
				for: this.bindTemplate.to( 'id' )
			},

			children: [
				{
					text: this.bindTemplate.to( 'label' )
				}
			]
		} );

		return labelView;
	}
}
