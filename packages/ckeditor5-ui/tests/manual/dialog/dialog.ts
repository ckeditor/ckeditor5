/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import { ButtonView, Dialog, View } from '../../../src';
import { Plugin } from '@ckeditor/ckeditor5-core';

import { icons } from '@ckeditor/ckeditor5-ui';

class ModalWithText extends Plugin {
	public static get requires() {
		return [ Dialog ] as const;
	}

	public init(): void {
		const t = this.editor.locale.t;

		this.editor.ui.componentFactory.add( 'modalWithText', locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Show modal' ),
				tooltip: true,
				withText: true
			} );

			buttonView.on( 'execute', () => {
				const dialog = this.editor.plugins.get( 'Dialog' );

				dialog.show( {
					isDraggable: false,
					onShow: dialog => {
						dialog.view.showHeader( t( 'Modal with text' ) );

						const textView = new View( locale );

						textView.setTemplate( {
							tag: 'div',
							attributes: {
								style: {
									padding: 'var(--ck-spacing-large)',
									whiteSpace: 'initial',
									width: '100%',
									maxWidth: '500px'
								},
								tabindex: -1
							},
							children: [
								`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
								dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
								commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
								nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
								anim id est laborum.`
							]
						} );

						dialog.view.children.add( textView );
						dialog.view.setActionButtons( [
							{
								label: t( 'Let\'s do this!' ),
								class: 'ck-button-action',
								withText: true,
								onExecute: () => dialog.hide()
							},
							{
								label: t( 'Test button' ),
								withText: false,
								icon: icons.colorPaletteIcon,
								onExecute: () => console.log( 'Test button' )
							},
							{
								label: t( 'Cancel' ),
								withText: true,
								onExecute: () => dialog.hide()
							}
						] );
					}
				} );
			} );

			return buttonView;
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ) as HTMLElement, {
		plugins: [
			Essentials,
			Autoformat,
			BlockQuote,
			Bold,
			Heading,
			Image,
			ImageCaption,
			ImageStyle,
			ImageToolbar,
			Indent,
			Italic,
			Link,
			List,
			MediaEmbed,
			Paragraph,
			Table,
			TableToolbar,

			FindAndReplace,
			SpecialCharacters,
			SpecialCharactersEssentials,
			SpecialCharactersEmoji,
			SourceEditing,
			ModalWithText
		],
		toolbar: [
			'heading', '|', 'bold', 'italic', 'link',
			'|',
			'findAndReplace', 'specialCharacters', 'mediaEmbed', 'sourceEditingDialog', 'modalWithText'
		],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
		}
	} )
	.then( editor => {
		Object.assign( window, { editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function SpecialCharactersEmoji( editor ) {
	editor.plugins.get( 'SpecialCharacters' ).addItems( 'Emoji', [
		{ character: '😂', title: 'Face with Tears of Joy' },
		{ character: '❤️', title: 'Red Heart' },
		{ character: '🤣', title: 'Rolling on the Floor Laughing' },
		{ character: '👍', title: 'Thumbs Up Sign' },
		{ character: '😭', title: 'Loudly Crying Face' },
		{ character: '🙏', title: 'Person with Folded Hands' },
		{ character: '😘', title: 'Face Throwing a Kiss' },
		{ character: '🥰', title: 'Smiling Face with Hearts' },
		{ character: '😍', title: 'Smiling Face with Heart-Eyes' },
		{ character: '😊', title: 'Smiling Face with Smiling Eyes' },
		{ character: '🎉', title: 'Party Popper' },
		{ character: '😁', title: 'Grinning Face with Smiling Eyes' },
		{ character: '💕', title: 'Two Hearts' },
		{ character: '🥺', title: 'Pleading Face' },
		{ character: '😅', title: 'Smiling Face with Open Mouth and Cold Sweat' },
		{ character: '🔥', title: 'Fire' },
		{ character: '☺️', title: 'Smiling Face' },
		{ character: '🤦', title: 'Face Palm' },
		{ character: '♥️', title: 'Heart Suit' },
		{ character: '🤷', title: 'Shrug' },
		{ character: '🙄', title: 'Face With Rolling Eyes' },
		{ character: '😆', title: 'Smiling Face with Open Mouth and Tightly-Closed Eyes' },
		{ character: '🤗', title: 'Hugging Face' },
		{ character: '😉', title: 'Winking Face' },
		{ character: '🎂', title: 'Birthday Cake' },
		{ character: '🤔', title: 'Thinking Face' },
		{ character: '👏', title: 'Clapping Hands Sign' },
		{ character: '🙂', title: 'Slightly Smiling Face' },
		{ character: '😳', title: 'Flushed Face' },
		{ character: '🥳', title: 'Partying Face' },
		{ character: '😎', title: 'Smiling Face with Sunglasses' },
		{ character: '👌', title: 'OK Hand Sign' },
		{ character: '💜', title: 'Purple Heart' },
		{ character: '😔', title: 'Pensive Face' },
		{ character: '💪', title: 'Flexed Biceps' },
		{ character: '✨', title: 'Sparkles' },
		{ character: '💖', title: 'Sparkling Heart' },
		{ character: '👀', title: 'Eyes' },
		{ character: '😋', title: 'Face Savoring Delicious Food' },
		{ character: '😏', title: 'Smirking Face' },
		{ character: '😢', title: 'Crying Face' },
		{ character: '👉', title: 'Backhand Index Pointing Right' },
		{ character: '💗', title: 'Growing Heart' },
		{ character: '😩', title: 'Weary Face' },
		{ character: '💯', title: 'Hundred Points Symbol' },
		{ character: '🌹', title: 'Rose' },
		{ character: '💞', title: 'Revolving Hearts' },
		{ character: '🎈', title: 'Balloon' },
		{ character: '💙', title: 'Blue Heart' },
		{ character: '😃', title: 'Smiling Face with Open Mouth' },
		{ character: '😡', title: 'Pouting Face' },
		{ character: '💐', title: 'Bouquet' },
		{ character: '😜', title: 'Face with Stuck-Out Tongue and Winking Eye' },
		{ character: '🙈', title: 'See-No-Evil Monkey' },
		{ character: '🤞', title: 'Crossed Fingers' },
		{ character: '😄', title: 'Smiling Face with Open Mouth and Smiling Eyes' },
		{ character: '🤤', title: 'Drooling Face' },
		{ character: '🙌', title: 'Person Raising Both Hands in Celebration' },
		{ character: '🤪', title: 'Zany Face' },
		{ character: '❣️', title: 'Heavy Heart Exclamation Mark Ornament' },
		{ character: '😀', title: 'Grinning Face' },
		{ character: '💋', title: 'Kiss Mark' },
		{ character: '💀', title: 'Skull' },
		{ character: '👇', title: 'Backhand Index Pointing Down' },
		{ character: '💔', title: 'Broken Heart' },
		{ character: '😌', title: 'Relieved Face' },
		{ character: '💓', title: 'Beating Heart' },
		{ character: '🤩', title: 'Grinning Face with Star Eyes' },
		{ character: '🙃', title: 'Upside Down Face' },
		{ character: '😬', title: 'Grimacing Face' },
		{ character: '😱', title: 'Face Screaming in Fear' },
		{ character: '😴', title: 'Sleeping Face' },
		{ character: '🤭', title: 'Face with Hand Over Mouth' },
		{ character: '😐', title: 'Neutral Face' },
		{ character: '🌞', title: 'Sun with Face' },
		{ character: '😒', title: 'Unamused Face' },
		{ character: '😇', title: 'Smiling Face with Halo' },
		{ character: '🌸', title: 'Cherry Blossom' },
		{ character: '😈', title: 'Smiling Face With Horns' },
		{ character: '🎶', title: 'Multiple Musical Notes' },
		{ character: '✌️', title: 'Victory Hand' },
		{ character: '🎊', title: 'Confetti Ball' },
		{ character: '🥵', title: 'Hot Face' },
		{ character: '😞', title: 'Disappointed Face' },
		{ character: '💚', title: 'Green Heart' },
		{ character: '☀️', title: 'Sun' },
		{ character: '🖤', title: 'Black Heart' },
		{ character: '💰', title: 'Money Bag' },
		{ character: '😚', title: 'Kissing Face With Closed Eyes' },
		{ character: '👑', title: 'Crown' },
		{ character: '🎁', title: 'Wrapped Gift' },
		{ character: '💥', title: 'Collision' },
		{ character: '🙋', title: 'Happy Person Raising One Hand' },
		{ character: '☹️', title: 'Frowning Face' },
		{ character: '😑', title: 'Expressionless Face' },
		{ character: '🥴', title: 'Woozy Face' },
		{ character: '👈', title: 'Backhand Index Pointing Left' },
		{ character: '💩', title: 'Pile of Poo' },
		{ character: '✅', title: 'Check Mark Button' }
	] );
}
