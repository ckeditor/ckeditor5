/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { FocusTracker, KeystrokeHandler, type Locale, type CollectionChangeEvent } from '@ckeditor/ckeditor5-utils';
import type Button from '../button/button';
import ButtonView from '../button/buttonview';
import View from '../view';
import ViewCollection from '../viewcollection';
import FocusCycler from '../focuscycler';

/**
 * TODO
 */
export default class ModalActionsView extends View {
	public readonly children: ViewCollection;

	public readonly keystrokes: KeystrokeHandler;
	public readonly focusTracker: FocusTracker;
	public readonly focusCycler: FocusCycler;
	private readonly _focusables: ViewCollection;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		/**
		 * TODO
		 */
		this.children = this.createCollection<ButtonView>();

		this.children.on<CollectionChangeEvent>( 'change', this._updateFocusCycleableItems.bind( this ) );

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * TODO
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * TODO
		 */
		this._focusables = new ViewCollection();

		/**
		 * TODO
		 */
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
					'ck-modal__actions'
				]
			},
			children: this.children
		} );
	}

	public override render(): void {
		super.render();

		this._updateFocusCycleableItems();

		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * TODO
	 */
	public clear(): void {
		while ( this.children.length ) {
			this.children.remove( 0 );
		}
	}

	/**
	 * TODO
	 *
	 * @param definitions
	 */
	public setButtons( definitions: Array<ModalActionButtonDefinition> ): void {
		for ( const definition of definitions ) {
			const button = new ButtonView( this.locale );

			let property: keyof ModalActionButtonDefinition;

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
	 * TODO
	 */
	public focus(): void {
		this.focusFirst();
	}

	/**
	 * TODO
	 */
	public focusFirst(): void {
		this.focusCycler.focusFirst();
	}

	/**
	 * TODO
	 */
	public focusLast(): void {
		this.focusCycler.focusLast();
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

export type ModalActionButtonDefinition =
	Pick<Button, 'label'> &
	Partial<Pick<Button, 'withText' | 'class' | 'icon'>> &
	{ onExecute: Function };
