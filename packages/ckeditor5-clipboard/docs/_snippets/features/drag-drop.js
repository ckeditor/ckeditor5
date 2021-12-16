/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Font from '@ckeditor/ckeditor5-font/src/font';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const contactsContainer = document.querySelector( '.contacts' );

//
// The H-Card editor plugin.
//

class HCardEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		this._defineSchema();
		this._defineConverters();
		this._defineClipboardInputOutput();

		// View-to-model position mapping is needed because an h-card element in the model is represented by a single element,
		// but in the view it is a more complex structure.
		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'h-card' ) )
		);
	}

	_defineSchema() {
		this.editor.model.schema.register( 'h-card', {
			allowWhere: '$text',
			isInline: true,
			isObject: true,
			allowAttributes: [ 'email', 'name', 'tel' ]
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		// Data-to-model conversion.
		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				classes: [ 'h-card' ]
			},
			model: ( viewElement, { writer } ) => {
				return writer.createElement( 'h-card', getCardDataFromViewElement( viewElement ) );
			}
		} );

		// Model-to-data conversion.
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'h-card',
			view: ( modelItem, { writer: viewWriter } ) => createCardView( modelItem, viewWriter )
		} );

		// Model-to-view conversion.
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'h-card',
			view: ( modelItem, { writer: viewWriter } ) => toWidget( createCardView( modelItem, viewWriter ), viewWriter )
		} );

		// Helper method for both downcast converters.
		function createCardView( modelItem, viewWriter ) {
			const email = modelItem.getAttribute( 'email' );
			const name = modelItem.getAttribute( 'name' );
			const tel = modelItem.getAttribute( 'tel' );

			const cardView = viewWriter.createContainerElement( 'span', { class: 'h-card' } );
			const linkView = viewWriter.createContainerElement( 'a', { href: `mailto:${ email }`, class: 'p-name u-email' } );
			const phoneView = viewWriter.createContainerElement( 'span', { class: 'p-tel' } );

			viewWriter.insert( viewWriter.createPositionAt( linkView, 0 ), viewWriter.createText( name ) );
			viewWriter.insert( viewWriter.createPositionAt( phoneView, 0 ), viewWriter.createText( tel ) );

			viewWriter.insert( viewWriter.createPositionAt( cardView, 0 ), linkView );
			viewWriter.insert( viewWriter.createPositionAt( cardView, 'end' ), phoneView );

			return cardView;
		}
	}

	// Integration with the clipboard pipeline.
	_defineClipboardInputOutput() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;

		// Processing pasted or dropped content.
		this.listenTo( viewDocument, 'clipboardInput', ( evt, data ) => {
			// The clipboard content was already processed by the listener on the higher priority
			// (for example while pasting into the code block).
			if ( data.content ) {
				return;
			}

			const contactData = data.dataTransfer.getData( 'contact' );

			if ( !contactData ) {
				return;
			}

			// Use JSON data encoded in the DataTransfer.
			const contact = JSON.parse( contactData );

			// Translate the h-card data to a view fragment.
			const writer = new UpcastWriter( viewDocument );
			const fragment = writer.createDocumentFragment();

			writer.appendChild(
				writer.createElement( 'span', { class: 'h-card' }, [
					writer.createElement( 'a', { href: `mailto:${ contact.email }`, class: 'p-name u-email' }, contact.name ),
					writer.createElement( 'span', { class: 'p-tel' }, contact.tel )
				] ),
				fragment
			);

			// Provide the content to the clipboard pipeline for further processing.
			data.content = fragment;
		} );

		// Processing copied, pasted or dragged content.
		this.listenTo( document, 'clipboardOutput', ( evt, data ) => {
			if ( data.content.childCount != 1 ) {
				return;
			}

			const viewElement = data.content.getChild( 0 );

			if ( viewElement.is( 'element', 'span' ) && viewElement.hasClass( 'h-card' ) ) {
				data.dataTransfer.setData( 'contact', JSON.stringify( getCardDataFromViewElement( viewElement ) ) );
			}
		} );
	}
}

//
// H-Card helper functions.
//

function getCardDataFromViewElement( viewElement ) {
	const children = Array.from( viewElement.getChildren() );
	const linkElement = children.find( element => element.is( 'element', 'a' ) && element.hasClass( 'p-name' ) );
	const telElement = children.find( element => element.is( 'element', 'span' ) && element.hasClass( 'p-tel' ) );

	return {
		name: getText( linkElement ),
		tel: getText( telElement ),
		email: linkElement.getAttribute( 'href' ).replace( /^mailto:/i, '' )
	};
}

function getText( viewElement ) {
	return Array.from( viewElement.getChildren() )
		.map( node => node.is( '$text' ) ? node.data : '' )
		.join( '' );
}

//
// Editor initialization.
//

ClassicEditor
	.create( document.querySelector( '#snippet-drag-drop' ), {
		plugins: [
			Essentials,
			UploadAdapter,
			Autoformat,
			Bold,
			Italic,
			BlockQuote,
			CKFinder,
			CloudServices,
			EasyImage,
			Heading,
			Image,
			ImageCaption,
			ImageStyle,
			ImageToolbar,
			ImageUpload,
			Indent,
			Link,
			List,
			MediaEmbed,
			Paragraph,
			PasteFromOffice,
			Table,
			TableToolbar,
			TextTransformation,
			Strikethrough,
			Underline,
			Font,
			Alignment,
			HorizontalLine,
			HCardEditing
		],
		toolbar: {
			items: [
				'heading',
				'|',
				'alignment',
				'|',
				'bold',
				'italic',
				'underline',
				'|',
				'link',
				'uploadImage',
				'insertTable',
				'horizontalLine',
				'|',
				'undo',
				'redo'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		fontFamily: {
			supportAllValues: true
		},
		fontSize: {
			options: [ 10, 12, 14, 'default', 18, 20, 22 ],
			supportAllValues: true
		},
		image: {
			toolbar: [ 'imageTextAlternative' ]
		},
		placeholder: 'Drop the content here to test the feature.',
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: contactsContainer.childNodes[ 2 ],
			text: 'Drag and drop me in the editor.',
			editor,
			tippyOptions: {
				placement: 'top',
				onHide: () => {
					contactsContainer.classList.remove( 'tour-balloon-visible' );
				}
			}
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

//
// Draggable H-Cards list.
//

const contacts = [
	{ name: 'Huckleberry Finn',			tel: '+48 1345 234 235', email: 'h.finn@example.com', avatar: 'hfin' },
	{ name: 'D\'Artagnan',				tel: '+45 2345 234 235', email: 'dartagnan@example.com', avatar: 'dartagnan' },
	{ name: 'Little Red Riding Hood',	tel: '+45 2345 234 235', email: 'lrrh@example.com', avatar: 'lrrh' },
	{ name: 'Alice',					tel: '+20 4345 234 235', email: 'alice@example.com', avatar: 'alice' },
	{ name: 'Phileas Fogg',				tel: '+44 3345 234 235', email: 'p.fogg@example.com', avatar: 'pfog' },
	{ name: 'Winnetou',					tel: '+44 3345 234 235', email: 'winnetou@example.com', avatar: 'winetou' },
	{ name: 'Edmond Dantès',			tel: '+20 4345 234 235', email: 'count@example.com', avatar: 'edantes' },
	{ name: 'Robinson Crusoe',			tel: '+45 2345 234 235', email: 'r.crusoe@example.com', avatar: 'rcrusoe' }
];

contactsContainer.addEventListener( 'dragstart', event => {
	const target = event.target.nodeType == 1 ? event.target : event.target.parentElement;
	const draggable = target.closest( '[draggable]' );

	event.dataTransfer.setData( 'text/plain', draggable.innerText );
	event.dataTransfer.setData( 'text/html', draggable.innerText );
	event.dataTransfer.setData( 'contact', JSON.stringify( contacts[ draggable.dataset.contact ] ) );

	event.dataTransfer.setDragImage( draggable, 0, 0 );
} );

contacts.forEach( ( contact, id ) => {
	const li = document.createElement( 'li' );

	li.innerHTML =
		`<div class="contact h-card" data-contact="${ id }" draggable="true">` +
			`<img src="../../assets/img/${ contact.avatar }.png" alt="avatar" class="u-photo" draggable="false" />` +
			contact.name +
		'</div>';

	contactsContainer.appendChild( li );
} );
