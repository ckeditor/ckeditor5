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
import type { default as AnchorEditing, AnchorItem } from './anchorediting';

import {
	ButtonView,
	ContextualBalloon,
	ListItemView,
	ListView,
	type View,
	type ViewCollection
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
		let viewDecorated = false;

		balloon.on( 'set:visibleView', ( eventInfo, name, newView ) => {
			if ( newView instanceof LinkFormView && !viewDecorated ) {
				// UI needs to be appended only once.
				viewDecorated = true;

				enableAutoComplete( newView, () => ( this.editor.plugins.get( 'AnchorEditing' ) as AnchorEditing ).getAnchors() );
			}
		} );
	}
}

function enableAutoComplete( formView: LinkFormView, getAutocompleteOptions: ( query: string ) => Array<AnchorItem> ) {
	const listView: ListView & { isVisible?: boolean } = new ListView();
	const bind = listView.bindTemplate;

	listView.set( {
		isVisible: true
	} );

	listView.extendTemplate( {
		attributes: {
			class: [
				bind.if( 'isVisible', 'ck-hidden', value => !value )
			]
		}
	} );

	formView.urlInputView.fieldView.on( 'input', () => {
		listView.items.clear();

		const currentInputValue = formView.urlInputView.fieldView.element!.value.trim();

		if ( !currentInputValue ) {
			return;
		}

		const matchingOptions = getAutocompleteOptions( 'foo' ).filter( ( { key } ) => {
			return key.indexOf( currentInputValue ) !== -1;
		} );

		listView.items.add( getAutocompleteOption( '🔗 ' + currentInputValue, currentInputValue ) );

		for ( const option of matchingOptions ) {
			const itemView = getAutocompleteOption( '⚓︎ ' + option.key, option.key );

			listView.items.add( itemView );
		}
	} );

	formView.urlInputView.fieldView.listenTo( formView.urlInputView.fieldView.element!, 'keydown', ( evt, domEvent: KeyboardEvent ) => {
		if ( domEvent.code === 'ArrowUp' ) {
			selectPreviousOption( listView );
			domEvent.preventDefault();
		}

		if ( domEvent.code === 'ArrowDown' ) {
			selectNextOption( listView );
			domEvent.preventDefault();
		}

		if ( domEvent.code === 'Enter' ) {
			const selectedOption = getSelectedOption( listView );

			if ( listView.isVisible && selectedOption ) {
				formView.urlInputView.fieldView.value = ( selectedOption.children.first as ButtonViewWithUrl ).url;
				listView.isVisible = false;
				resetList( listView );
				domEvent.preventDefault();

				return;
			}
		}

		listView.isVisible = true;
	} );

	listView.bind( 'isVisible' ).to( formView.urlInputView, 'isFocused' );

	formView.urlInputView.fieldWrapperChildren.add( listView );
}

function getAutocompleteOption( label: string, url: string ): ListItemView {
	const item = new ListItemView();
	const button: ButtonViewWithUrl = new ButtonView();

	button.set( {
		withText: true,
		url
	} );

	button.label = label;
	item.children.add( button );

	return item;
}

function getSelectedOption( listView: ListView ): ListItemView | null {
	const items = listView.items as ViewCollection<ListItemView>;

	for ( const item of items ) {
		if ( ( item.children.first as ButtonView ).isOn ) {
			return item;
		}
	}

	return null;
}

function resetList( listView: ListView ) {
	const items = listView.items as ViewCollection<ListItemView>;

	for ( const item of items ) {
		( item.children.first as ButtonView ).isOn = false;
	}
}

function selectFirstOption( listView: ListView ) {
	const items = listView.items as ViewCollection<ListItemView>;

	for ( const item of items ) {
		( item.children.first as ButtonView ).isOn = false;
	}

	( items.first?.children.first as ButtonView ).isOn = true;
}

function selectLastOption( listView: ListView ) {
	const items = listView.items as ViewCollection<ListItemView>;

	for ( const item of items ) {
		( item.children.first as ButtonView ).isOn = false;
	}

	( items.last?.children.first as ButtonView ).isOn = true;
}

function selectNextOption( listView: ListView ) {
	const items = listView.items as ViewCollection<ListItemView>;
	const selectedOption = getSelectedOption( listView );

	if ( !selectedOption ) {
		selectFirstOption( listView );
		return;
	}

	const currentIndex = listView.items.getIndex( selectedOption as View );

	if ( currentIndex === listView.items.length - 1 ) {
		selectFirstOption( listView );

		return;
	}

	( items.get( currentIndex as number + 1 )!.children.first as ButtonView ).isOn = true;
	( selectedOption.children.first as ButtonView ).isOn = false;
}

function selectPreviousOption( listView: ListView ) {
	const items = listView.items as ViewCollection<ListItemView>;
	const selectedOption = getSelectedOption( listView );

	if ( !selectedOption ) {
		selectLastOption( listView );
		return;
	}

	const currentIndex = listView.items.getIndex( selectedOption as View );

	if ( currentIndex === 0 ) {
		selectLastOption( listView );

		return;
	}

	( items.get( currentIndex as number - 1 )!.children.first as ButtonView ).isOn = true;
	( selectedOption.children.first as ButtonView ).isOn = false;
}

type ButtonViewWithUrl = ButtonView & { url?: string };
