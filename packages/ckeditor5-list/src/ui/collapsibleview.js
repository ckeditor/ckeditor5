/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { View, ButtonView } from 'ckeditor5/src/ui';
import { FocusTracker } from 'ckeditor5/src/utils';

// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import dropdownArrowIcon from '@ckeditor/ckeditor5-ui/theme/icons/dropdown-arrow.svg';

import '../../theme/collapsible.css';

/**
 * TODO
 *
 * @extends module:ui/view~View
 */
export default class CollapsibleView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale, childViews ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * TODO
		 */
		this.set( 'isCollapsed', false );

		/**
		 * TODO
		 */
		this.set( 'label' );

		/**
		 * TODO
		 */
		this.buttonView = this._createButtonView();

		/**
		 * A collection of the child views.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

		/**
		 * Tracks information about the DOM focus in the collapsible.
		 *
		 * @readonly
		 * @protected
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * TODO
		 */
		this.set( '_collapsibleAriaLabelUid' );

		if ( childViews ) {
			this.children.addMany( childViews );
		}

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-collapsible',
					bind.if( 'isCollapsed', 'ck-collapsible_collapsed' )
				]
			},
			children: [
				this.buttonView,
				{
					tag: 'div',
					attributes: {
						class: [
							'ck',
							'ck-collapsible__children'
						],
						role: 'region',
						hidden: bind.if( 'isCollapsed', 'hidden' ),
						'aria-labelledby': bind.to( '_collapsibleAriaLabelUid' )
					},
					children: this.children
				}
			]
		} );
	}

	render() {
		super.render();

		this._collapsibleAriaLabelUid = this.buttonView.labelView.element.id;
	}

	/**
	 * TODO
	 *
	 * @returns
	 */
	_createButtonView() {
		const buttonView = new ButtonView( this.locale );
		const bind = buttonView.bindTemplate;

		buttonView.set( {
			withText: true,
			icon: dropdownArrowIcon
		} );

		buttonView.extendTemplate( {
			attributes: {
				'aria-expanded': bind.to( 'isOn', value => String( value ) )
			}
		} );

		buttonView.bind( 'label' ).to( this );
		buttonView.bind( 'isOn' ).to( this, 'isCollapsed', isCollapsed => !isCollapsed );

		buttonView.on( 'execute', () => {
			this.isCollapsed = !this.isCollapsed;
		} );

		return buttonView;
	}
}
