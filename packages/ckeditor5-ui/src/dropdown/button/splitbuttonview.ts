/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/button/splitbuttonview
 */

import View from '../../view';
import ButtonView from '../../button/buttonview';
import type ViewCollection from '../../viewcollection';
import type Button from '../../button/button';
import type DropdownButton from './dropdownbutton';

import {
	KeystrokeHandler,
	FocusTracker,
	type Locale
} from '@ckeditor/ckeditor5-utils';

import dropdownArrowIcon from '../../../theme/icons/dropdown-arrow.svg';

import '../../../theme/components/dropdown/splitbutton.css';

/**
 * The split button view class.
 *
 * ```ts
 * const view = new SplitButtonView();
 *
 * view.set( {
 * 	label: 'A button',
 * 	keystroke: 'Ctrl+B',
 * 	tooltip: true
 * } );
 *
 * view.render();
 *
 * document.body.append( view.element );
 * ```
 *
 * Also see the {@link module:ui/dropdown/utils~createDropdown `createDropdown()` util}.
 */
export default class SplitButtonView extends View<HTMLDivElement> implements DropdownButton {
	/**
	 * Collection of the child views inside of the split button {@link #element}.
	 */
	public readonly children: ViewCollection;

	/**
	 * A main button of split button.
	 */
	public readonly actionView: ButtonView;

	/**
	 * A secondary button of split button that opens dropdown.
	 */
	public readonly arrowView: ButtonView;

	/**
	 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}. It manages
	 * keystrokes of the split button:
	 *
	 * * <kbd>▶</kbd> moves focus to arrow view when action view is focused,
	 * * <kbd>◀</kbd> moves focus to action view when arrow view is focused.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * Tracks information about DOM focus in the dropdown.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * @inheritDoc
	 */
	declare public label: string | undefined;

	/**
	 * @inheritDoc
	 */
	declare public keystroke: string | undefined;

	/**
	 * @inheritDoc
	 */
	declare public tooltip: Button[ 'tooltip' ];

	/**
	 * @inheritDoc
	 */
	declare public tooltipPosition: Button[ 'tooltipPosition' ];

	/**
	 * @inheritDoc
	 */
	declare public type: Button[ 'type' ];

	/**
	 * @inheritDoc
	 */
	declare public isOn: boolean;

	/**
	 * @inheritDoc
	 */
	declare public isEnabled: boolean;

	/**
	 * @inheritDoc
	 */
	declare public isVisible: boolean;

	/**
	 * @inheritDoc
	 */
	declare public isToggleable: boolean;

	/**
	 * @inheritDoc
	 */
	declare public withText: boolean;

	/**
	 * @inheritDoc
	 */
	declare public withKeystroke: boolean;

	/**
	 * @inheritDoc
	 */
	declare public icon: string | undefined;

	/**
	 * @inheritDoc
	 */
	declare public tabindex: number;

	/**
	 * @inheritDoc
	 */
	declare public class: string | undefined;

	/**
	 * @inheritDoc
	 */
	declare public labelStyle: string | undefined;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		// Implement the Button interface.
		this.set( 'class', undefined );
		this.set( 'labelStyle', undefined );
		this.set( 'icon', undefined );
		this.set( 'isEnabled', true );
		this.set( 'isOn', false );
		this.set( 'isToggleable', false );
		this.set( 'isVisible', true );
		this.set( 'keystroke', undefined );
		this.set( 'withKeystroke', false );
		this.set( 'label', undefined );
		this.set( 'tabindex', -1 );
		this.set( 'tooltip', false );
		this.set( 'tooltipPosition', 's' );
		this.set( 'type', 'button' );
		this.set( 'withText', false );

		this.children = this.createCollection();
		this.actionView = this._createActionView();
		this.arrowView = this._createArrowView();
		this.keystrokes = new KeystrokeHandler();
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
	public override render(): void {
		super.render();

		this.children.add( this.actionView );
		this.children.add( this.arrowView );

		this.focusTracker.add( this.actionView.element! );
		this.focusTracker.add( this.arrowView.element! );

		this.keystrokes.listenTo( this.element! );

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
	public override destroy(): void {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Focuses the {@link module:ui/button/buttonview~ButtonView#element} of the action part of split button.
	 */
	public focus(): void {
		this.actionView.focus();
	}

	/**
	 * Creates a {@link module:ui/button/buttonview~ButtonView} instance as {@link #actionView} and binds it with main split button
	 * attributes.
	 */
	private _createActionView() {
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
	 */
	private _createArrowView() {
		const arrowView = new ButtonView();
		const bind = arrowView.bindTemplate;

		arrowView.icon = dropdownArrowIcon;

		arrowView.extendTemplate( {
			attributes: {
				class: [
					'ck-splitbutton__arrow'
				],
				'data-cke-tooltip-disabled': bind.to( 'isOn' ),
				'aria-haspopup': true,
				'aria-expanded': bind.to( 'isOn', value => String( value ) )
			}
		} );

		arrowView.bind( 'isEnabled' ).to( this );
		arrowView.bind( 'label' ).to( this );
		arrowView.bind( 'tooltip' ).to( this );

		arrowView.delegate( 'execute' ).to( this, 'open' );

		return arrowView;
	}
}
