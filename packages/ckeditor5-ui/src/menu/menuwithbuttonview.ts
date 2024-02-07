/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menu/menuwithbuttonview
 */

import {
	type ObservableChangeEvent,
	type PositioningFunction,
	type Locale,
	FocusTracker,
	KeystrokeHandler,
	getOptimalPosition
} from '@ckeditor/ckeditor5-utils';
import View from '../view.js';
import MenuView from './menuview.js';
import MenuWithButtonButtonView from './menuwithbuttonbuttonview.js';

import '../../theme/components/menu/menuwithbutton.css';
import SplitButtonView from '../dropdown/button/splitbuttonview.js';

export default abstract class MenuWithButtonView extends View {
	public readonly buttonView: MenuWithButtonButtonView;
	public readonly menuView: MenuView;
	public readonly focusTracker: FocusTracker;
	public readonly keystrokes: KeystrokeHandler;

	declare public isOpen: boolean;
	declare public isEnabled: boolean;
	declare public class: string | undefined;
	declare public id: string | undefined;
	declare public menuPosition: string;
	declare public ariaDescribedById: string | undefined;

	constructor(
		locale: Locale,
		buttonView?: MenuWithButtonButtonView,
		menuView?: MenuView
	) {
		super( locale );

		const bind = this.bindTemplate;

		this.buttonView = buttonView || new MenuWithButtonButtonView( locale );
		this.menuView = menuView || new MenuView( locale );

		this.set( 'isOpen', false );
		this.set( 'isEnabled', true );
		this.set( 'class', undefined );
		this.set( 'id', undefined );
		this.set( 'menuPosition', 'auto' );

		this.buttonView.bind( 'isEnabled' ).to( this );
		this.menuView.bind( 'isVisible' ).to( this, 'isOpen' );

		if ( buttonView instanceof SplitButtonView ) {
			this.buttonView.arrowView.bind( 'isOn' ).to( this, 'isOpen' );
		} else {
			this.buttonView.bind( 'isOn' ).to( this, 'isOpen' );
		}

		this.keystrokes = new KeystrokeHandler();
		this.focusTracker = new FocusTracker();

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-menu-with-button',
					bind.to( 'class' ),
					bind.if( 'isEnabled', 'ck-disabled', value => !value )
				],
				id: bind.to( 'id' ),
				'aria-describedby': bind.to( 'ariaDescribedById' )
			},

			children: [
				this.buttonView,
				this.menuView
			]
		} );
	}

	public override render(): void {
		super.render();

		this.focusTracker.add( this.buttonView.element! );
		this.focusTracker.add( this.menuView.element! );
		this.keystrokes.listenTo( this.element! );
		this._positionMenuOnOpen();
	}

	private _positionMenuOnOpen(): void {
		this.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
			if ( !isOpen ) {
				return;
			}

			if ( this.menuPosition === 'auto' ) {
				const optimalPosition = MenuWithButtonView._getOptimalPosition( {
					element: this.menuView.element!,
					target: this.buttonView.element!,
					fitInViewport: true,
					positions: this.panelPositions
				} );

				this.menuView.position = ( optimalPosition ? optimalPosition.name : this.panelPositions[ 0 ].name ) as string;
			} else {
				this.menuView.position = this.menuPosition;
			}
		} );
	}

	public get panelPositions(): Array<PositioningFunction> {
		throw new Error( 'panelPositions() is abstract' );
	}

	public focus(): void {
		this.buttonView.focus();
	}

	private static _getOptimalPosition = getOptimalPosition;
}

/**
 * TODO
 *
 * @eventName ~MenuWithButtonViewExecuteEvent#execute
 */
export type MenuWithButtonViewExecuteEvent = {
	name: 'execute';
	args: [];
};
