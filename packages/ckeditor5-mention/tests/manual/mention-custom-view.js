/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console, window */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import Table from '@ckeditor/ckeditor5-table/src/table';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import priorities from '@ckeditor/ckeditor5-utils/src/priorities';
import ModelSelection from '@ckeditor/ckeditor5-engine/src/model/selection';
import DocumentSelection from '@ckeditor/ckeditor5-engine/src/model/documentselection';

import MentionUI from '../../src/mentionui';
// eslint-disable-next-line no-unused-vars
import MentionEditing from '../../src/mentionediting';
// eslint-disable-next-line no-unused-vars
import MentionElementEditing from '../../src/mentioneditingelement';
// eslint-disable-next-line no-unused-vars
import MentionMarkerEditing, { createMentionMarkerId } from '../../src/mentioneditingmarker';

const HIGHER_THEN_HIGHEST = priorities.highest + 50;

// eslint-disable-next-line no-unused-vars
class CustomMentionAttributeView extends Plugin {
	init() {
		const editor = this.editor;

		editor.conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'a',
				key: 'data-mention',
				classes: 'mention',
				attributes: {
					href: true
				}
			},
			model: {
				key: 'mention',
				value: viewItem => {
					const mentionValue = {
						label: viewItem.getAttribute( 'data-mention' ),
						link: viewItem.getAttribute( 'href' )
					};

					return mentionValue;
				}
			},
			converterPriority: HIGHER_THEN_HIGHEST
		} );

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: 'mention',
			view: ( modelAttributeValue, viewWriter ) => {
				if ( !modelAttributeValue ) {
					return;
				}

				return viewWriter.createAttributeElement( 'a', {
					class: 'mention',
					'data-mention': modelAttributeValue.label,
					'href': modelAttributeValue.link
				} );
			},
			converterPriority: HIGHER_THEN_HIGHEST
		} );
	}
}

// eslint-disable-next-line no-unused-vars
class CustomMentionElementView extends Plugin {
	init() {
		const editor = this.editor;

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'a',
				classes: 'mention',
				attributes: {
					href: true
				}
			},
			model: ( viewItem, modelWriter ) => {
				const item = {
					label: viewItem.getAttribute( 'data-mention' ),
					link: viewItem.getAttribute( 'href' )
				};

				const frag = modelWriter.createDocumentFragment();
				const mention = modelWriter.createElement( 'mention', { item } );

				modelWriter.insert( mention, frag, 0 );

				modelWriter.insertText( item.label, mention, 0 );

				return mention;
			},
			converterPriority: HIGHER_THEN_HIGHEST
		} );

		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'mentionElement',
			view: ( modelElement, viewWriter ) => {
				const item = modelElement.getAttribute( 'item' );

				const link = viewWriter.createContainerElement( 'a', {
					class: 'mention',
					'data-mention': item.label,
					'href': item.link
				} );

				return link;
			},
			converterPriority: HIGHER_THEN_HIGHEST
		} );
	}
}

// eslint-disable-next-line no-unused-vars
class CustomMentionMarkerView extends Plugin {
	init() {
		const editor = this.editor;

		// Convert marker v->m.
		editor.conversion.for( 'upcast' ).elementToMarker( {
			view: {
				name: 'a',
				attribute: {
					'data-mention': /^\w/
				}
			},
			model: viewElement => createMentionMarkerId( viewElement.getAttribute( 'data-mention' ) )
		} );

		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'addMarker:mention', ( evt, data, conversionApi ) => {
				const label = data.markerName.split( ':' )[ 1 ];
				const id = data.markerName.split( ':' )[ 2 ];

				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;

				const item = getFeed( label.replace( '-', ' ' ) )[ 0 ];

				const attributes = {
					class: [ 'mention' ],
					'data-mention': label,
					id
				};

				if ( item ) {
					attributes.href = item.link;
					attributes.title = item.label;
				}

				// OMG I just wanted to change `<span>` to `<a>`...
				const viewElement = viewWriter.createAttributeElement( 'a', attributes );

				const viewSelection = viewWriter.document.selection;

				if ( data.item instanceof ModelSelection || data.item instanceof DocumentSelection ) {
					viewWriter.wrap( viewSelection.getFirstRange(), viewElement, viewSelection );
				} else {
					const viewRange = conversionApi.mapper.toViewRange( data.range );
					const rangeAfterWrap = viewWriter.wrap( viewRange, viewElement );

					for ( const element of rangeAfterWrap.getItems() ) {
						if ( element.is( 'attributeElement' ) && element.isSimilar( viewElement ) ) {
							conversionApi.mapper.bindElementToMarker( element, data.markerName );

							// One attribute element is enough, because all of them are bound together by the view writer.
							// Mapper uses this binding to get all the elements no matter how many of them are registered in the mapper.
							break;
						}
					}
				}
			}, { priority: HIGHER_THEN_HIGHEST } );
		} );
	}
}

ClassicEditor
	.create( global.document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Link, Heading, Bold, Italic, Underline, Undo, Clipboard, Widget, ShiftEnter, Table,

			// Uncomment below groups while commenting other to change model behavior.

			// 1. Using attributes
			MentionEditing,
			CustomMentionAttributeView,

			// 2. Using Element - buggy
			// MentionElementEditing,
			// CustomMentionElementView,

			// 3. Using marker - promising
			// MentionMarkerEditing,
			// CustomMentionMarkerView,

			// Common: ui
			MentionUI
		],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'underline', 'link', '|', 'insertTable', '|', 'undo', 'redo' ],
		mention: [
			{
				feed: getFeed
			}
		]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function getFeed( feedText ) {
	return [
		{ id: '1', label: 'Barney Stinson', link: 'https://www.imdb.com/title/tt0460649/characters/nm0000439' },
		{ id: '2', label: 'Lily Aldrin', link: 'https://www.imdb.com/title/tt0460649/characters/nm0004989' },
		{ id: '3', label: 'Marshall Eriksen', link: 'https://www.imdb.com/title/tt0460649/characters/nm0781981' },
		{ id: '4', label: 'Robin Scherbatsky', link: 'https://www.imdb.com/title/tt0460649/characters/nm1130627' },
		{ id: '5', label: 'Ted Mosby', link: 'https://www.imdb.com/title/tt0460649/characters/nm1102140' }
	].filter( item => {
		const searchString = feedText.toLowerCase();

		return item.label.toLowerCase().includes( searchString );
	} );
}
