/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/anchorui
 */

import { Plugin } from 'ckeditor5/src/core';
import LinkUI from './linkui';
import LinkFormView from './ui/linkformview';
import LinkActionsView from './ui/linkactionsview';
// import { InputView } from 'ckeditor5/src/ui';
import type AnchorEditing from './anchorediting';

import {
	ContextualBalloon,
	// InputView,
	OptionView,
	SelectView
} from 'ckeditor5/src/ui';

/**
 * The anchor UI plugin.
 */
export default class AnchorUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'AnchorUI' {
		return 'AnchorUI';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ LinkUI ] as const;
	}

	public init(): void {
		this._extendBalloon();
	}

	private _extendBalloon(): void {
		const balloon = this.editor.plugins.get( ContextualBalloon );
		const selectView = new SelectView( this.editor.locale );
		let viewDecorated = false;

		balloon.on( 'set:visibleView', ( eventInfo, name, newView ) => {
			console.log( 'balloon view changed' );

			console.log( newView instanceof LinkFormView, newView instanceof LinkActionsView );

			if ( newView instanceof LinkFormView ) {
				selectView.children.clear();

				const anchors = ( this.editor.plugins.get( 'AnchorEditing' ) as AnchorEditing ).getAnchors();
				let lastValue = '';

				for ( const anchorItem of anchors ) {
					const anchorOption = new OptionView( this.editor.locale );
					anchorOption.value = anchorItem.key;
					anchorOption.label = anchorItem.key;
					lastValue = anchorOption.value;
					selectView.children.add( anchorOption );
				}

				if ( lastValue ) {
					selectView.setWorkaroundValue( lastValue );
				}
			}

			if ( newView instanceof LinkFormView && !viewDecorated ) {
				// UI needs to be appended only once.
				viewDecorated = true;
				newView.children.add( selectView );
				console.log( 'input added' );
			}
		} );
	}
}
