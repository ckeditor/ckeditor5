/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/button/listitembuttonview
 */

import type { ObservableChangeEvent, Locale } from '@ckeditor/ckeditor5-utils';
import type ButtonLabel from './buttonlabel.js';
import type ViewCollection from '../viewcollection.js';

import { icons } from '@ckeditor/ckeditor5-core';
import ButtonView from './buttonview.js';
import ButtonLabelView from './buttonlabelview.js';
import IconView from '../icon/iconview.js';
import View from '../view.js';

import '../../theme/components/button/listitembutton.css';

/**
 * Button that is used as dropdown list item entry.
 */
export default class ListItemButtonView extends ButtonView {
	/**
	 * Holds the view for the check icon of a button list item.
	 */
	private readonly _checkIconHolderView = new CheckIconHolderView();

	/**
	 * The flag that indicates if the button should render a check holder.
	 *
	 * @internal
	 * @readonly
	 * @observable
	 */
	declare public _shouldRenderCheckHolder: boolean;

	/**
	 * Indicates whether the button view has reserved space for a check holder.
	 *
	 * @observable
	 */
	declare public hasReservedCheckHolderSpace: boolean;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale, labelView: ButtonLabel = new ButtonLabelView() ) {
		super( locale, labelView );

		this.set( {
			hasReservedCheckHolderSpace: false,
			_shouldRenderCheckHolder: this.isToggleable
		} );

		const bind = this.bindTemplate;

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-list-item-button',
					bind.if( 'isToggleable', 'ck-list-item-button_toggleable' )
				]
			}
		} );

		this.bind( '_shouldRenderCheckHolder' ).to(
			this, 'hasReservedCheckHolderSpace',
			this, 'isToggleable',
			( hasReservedCheckHolderSpace, isToggleable ) => hasReservedCheckHolderSpace || isToggleable
		);
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		if ( this._shouldRenderCheckHolder ) {
			this.children.add( this._checkIconHolderView, 0 );
		}

		this._watchCheckIconHolderMount();
	}

	/**
	 * Renders the check icon if the button is toggleable.
	 */
	private _watchCheckIconHolderMount() {
		this._checkIconHolderView
			.bind( 'isOn' )
			.to( this, 'isOn', value => this.isToggleable && value );

		this.on<ObservableChangeEvent<boolean>>(
			'change:_shouldRenderCheckHolder',
			( evt, propertyName, shouldRenderCheckHolder ) => {
				const { children, _checkIconHolderView } = this;

				if ( shouldRenderCheckHolder && !children.has( _checkIconHolderView ) ) {
					children.add( _checkIconHolderView, 0 );
				} else if ( !shouldRenderCheckHolder && children.has( _checkIconHolderView ) ) {
					children.remove( _checkIconHolderView );
				}
			}
		);
	}
}

export class CheckIconHolderView extends View {
	/**
	 * The view for the check icon of the button list item.
	 */
	private readonly _checkIconView: IconView = this._createCheckIconView();

	/**
	 * Collection of child views.
	 */
	public readonly children: ViewCollection<View>;

	/**
	 * Indicates whether the button is in the "on" state.
	 */
	declare public isOn: boolean;

	/**
	 * @inheritDoc
	 */
	constructor() {
		super();

		const bind = this.bindTemplate;

		this.children = this.createCollection();

		this.set( 'isOn', false );
		this.setTemplate( {
			tag: 'span',
			children: this.children,
			attributes: {
				class: [
					'ck',
					'ck-list-item-button__check-holder',
					bind.to( 'isOn', isOn => isOn ? 'ck-on' : 'ck-off' )
				]
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		if ( this.isOn ) {
			this.children.add( this._checkIconView, 0 );
		}

		this._watchCheckIconMount();
	}

	/**
	 * Renders the check icon if the button is toggleable.
	 */
	private _watchCheckIconMount() {
		this.on<ObservableChangeEvent<boolean>>( 'change:isOn', ( evt, propertyName, isOn ) => {
			const { children, _checkIconView } = this;

			if ( isOn && !children.has( _checkIconView ) ) {
				children.add( _checkIconView );
			} else if ( !isOn && children.has( _checkIconView ) ) {
				children.remove( _checkIconView );
			}
		} );
	}

	/**
	 * Creates a check icon view.
	 */
	private _createCheckIconView() {
		const iconView = new IconView();

		iconView.content = icons.check;
		iconView.extendTemplate( {
			attributes: {
				class: 'ck-list-item-button__check-icon'
			}
		} );

		return iconView;
	}
}
