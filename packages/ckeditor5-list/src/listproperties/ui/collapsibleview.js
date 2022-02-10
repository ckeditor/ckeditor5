/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/ui/collapsibleview
 */

import { View, ButtonView } from 'ckeditor5/src/ui';

// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import dropdownArrowIcon from '@ckeditor/ckeditor5-ui/theme/icons/dropdown-arrow.svg';

import '../../../theme/collapsible.css';

/**
 * A collapsible UI component. Consists of a labeled button and a container which can be collapsed
 * by clicking the button. The collapsible container can be a host to other UI views.
 *
 * @protected
 * @extends module:ui/view~View
 */
export default class CollapsibleView extends View {
	/**
	 * Creates an instance of the collapsible view.
	 *
	 * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param {Array.<module:ui/view~View>} [childViews] An optional array of initial child views to be inserted
	 * into the collapsible.
	 */
	constructor( locale, childViews ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * `true` when the container with {@link #children} is collapsed. `false` otherwise.
		 *
		 * @observable
		 * @member {Boolean} #isCollapsed
		 */
		this.set( 'isCollapsed', false );

		/**
		 * The text label of the {@link #buttonView}.
		 *
		 * @observable
		 * @member {String} #label
		 * @default 'Show more'
		 */
		this.set( 'label', '' );

		/**
		 * The main button that, when clicked, collapses or expands the container with {@link #children}.
		 *
		 * @readonly
		 * @member {module:ui/button/buttonview~ButtonView} #buttonView
		 */
		this.buttonView = this._createButtonView();

		/**
		 * A collection of the child views that can be collapsed by clicking the {@link #buttonView}.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection} #children
		 */
		this.children = this.createCollection();

		/**
		 * The ID of the label inside the {@link #buttonView} that describes the collapsible
		 * container for assistive technologies. Set after the button was {@link #render rendered}.
		 *
		 * @private
		 * @readonly
		 * @observable
		 * @member {String} #_collapsibleAriaLabelUid
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

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this._collapsibleAriaLabelUid = this.buttonView.labelView.element.id;
	}

	/**
	 * Creates the main {@link #buttonView} of the collapsible.
	 *
	 * @private
	 * @returns {module:ui/button/buttonview~ButtonView}
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
