/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/collapsible/collapsibleview
 */

import { IconDropdownArrow } from '@ckeditor/ckeditor5-icons';
import View from '../view.js';
import ButtonView from '../button/buttonview.js';
import type ViewCollection from '../viewcollection.js';
import type { FocusableView } from '../focuscycler.js';
import type { Locale } from '@ckeditor/ckeditor5-utils';

import '../../theme/components/collapsible/collapsible.css';

/**
 * A collapsible UI component. Consists of a labeled button and a container which can be collapsed
 * by clicking the button. The collapsible container can be a host to other UI views.
 *
 * @internal
 */
export default class CollapsibleView extends View {
	/**
	 * `true` when the container with {@link #children} is collapsed. `false` otherwise.
	 *
	 * @observable
	 */
	declare public isCollapsed: boolean;

	/**
	 * The text label of the {@link #buttonView}.
	 *
	 * @observable
	 * @default 'Show more'
	 */
	declare public label: string;

	/**
	 * The ID of the label inside the {@link #buttonView} that describes the collapsible
	 * container for assistive technologies. Set after the button was {@link #render rendered}.
	 *
	 * @internal
	 * @readonly
	 * @observable
	 */
	declare public _collapsibleAriaLabelUid: string | undefined;

	/**
	 * The main button that, when clicked, collapses or expands the container with {@link #children}.
	 */
	public readonly buttonView: ButtonView;

	/**
	 * A collection of the child views that can be collapsed by clicking the {@link #buttonView}.
	 */
	public readonly children: ViewCollection<FocusableView>;

	/**
	 * Creates an instance of the collapsible view.
	 *
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param childViews An optional array of initial child views to be inserted into the collapsible.
	 */
	constructor( locale: Locale, childViews?: Array<FocusableView> ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'isCollapsed', false );
		this.set( 'label', '' );

		this.buttonView = this._createButtonView();
		this.children = this.createCollection();

		this.set( '_collapsibleAriaLabelUid', undefined );

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
	public override render(): void {
		super.render();

		this._collapsibleAriaLabelUid = this.buttonView.labelView.element!.id;
	}

	/**
	 * Focuses the first focusable.
	 */
	public focus(): void {
		this.buttonView.focus();
	}

	/**
	 * Creates the main {@link #buttonView} of the collapsible.
	 */
	private _createButtonView() {
		const buttonView = new ButtonView( this.locale );
		const bind = buttonView.bindTemplate;

		buttonView.set( {
			withText: true,
			icon: IconDropdownArrow
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
