/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dialog/dialogactionsview
 */

import {
	FocusTracker,
	KeystrokeHandler,
	type Locale,
	type CollectionChangeEvent
} from '@ckeditor/ckeditor5-utils';
import type Button from '../button/button';
import ButtonView from '../button/buttonview';
import View from '../view';
import ViewCollection from '../viewcollection';
import FocusCycler from '../focuscycler';

/**
 * TODO
 */
export default class DialogActionsView extends View {
	/**
	 * TODO
	 */
	public readonly children: ViewCollection;

	/**
	 * TODO
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * TODO
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * TODO
	 */
	public readonly focusCycler: FocusCycler;

	/**
	 * TODO
	 */
	private readonly _focusables: ViewCollection;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		this.children = this.createCollection<ButtonView>();
		this.children.on<CollectionChangeEvent>( 'change', this._updateFocusCycleableItems.bind( this ) );
		this.keystrokes = new KeystrokeHandler();
		this.focusTracker = new FocusTracker();
		this._focusables = new ViewCollection();
		this.focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-dialog__actions'
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

		this._updateFocusCycleableItems();

		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * TODO
	 */
	public reset(): void {
		while ( this.children.length ) {
			this.children.remove( 0 );
		}
	}

	/**
	 * TODO
	 */
	public setButtons( definitions: Array<DialogActionButtonDefinition> ): void {
		for ( const definition of definitions ) {
			const button = new ButtonView( this.locale );

			let property: keyof DialogActionButtonDefinition;

			for ( property in definition ) {
				if ( property == 'onExecute' ) {
					button.on( 'execute', () => definition.onExecute() );
				} else {
					button.set( property, definition[ property ] );
				}
			}

			this.children.add( button );
		}
	}

	/**
	 * @inheritDoc
	 */
	public focus( direction?: 1 | -1 ): void {
		if ( direction === -1 ) {
			this.focusCycler.focusLast();
		} else {
			this.focusCycler.focusFirst();
		}
	}

	/**
	 * TODO
	 */
	private _updateFocusCycleableItems() {
		for ( const focusable of this._focusables ) {
			this.focusTracker.remove( focusable.element! );
		}

		this._focusables.clear();

		Array.from( this.children ).forEach( v => {
			this._focusables.add( v );
			this.focusTracker.add( v.element! );
		} );
	}
}

export type DialogActionButtonDefinition =
	Pick<Button, 'label'> &
	Partial<Pick<Button, 'withText' | 'class' | 'icon'>> &
	{ onExecute: Function };
