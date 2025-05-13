/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage.js';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink.js';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage.js';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';
import { UpcastWriter } from '@ckeditor/ckeditor5-engine';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

const contacts = [
	/* eslint-disable @stylistic/no-multi-spaces */
	{ name: 'Huckleberry Finn',			tel: '+48 1345 234 235', email: 'h.finn@example.com', avatar: 'hfin' },
	{ name: 'D\'Artagnan',				tel: '+45 2345 234 235', email: 'dartagnan@example.com', avatar: 'dartagnan' },
	{ name: 'Phileas Fogg',				tel: '+44 3345 234 235', email: 'p.fogg@example.com', avatar: 'pfog' },
	{ name: 'Alice',					tel: '+20 4345 234 235', email: 'alice@example.com', avatar: 'alice' },
	{ name: 'Little Red Riding Hood',	tel: '+45 2345 234 235', email: 'lrrh@example.com', avatar: 'lrrh' },
	{ name: 'Winnetou',					tel: '+44 3345 234 235', email: 'winnetou@example.com', avatar: 'winetou' },
	{ name: 'Edmond Dantès',			tel: '+20 4345 234 235', email: 'count@example.com', avatar: 'edantes' },
	{ name: 'Robinson Crusoe',			tel: '+45 2345 234 235', email: 'r.crusoe@example.com', avatar: 'rcrusoe' }
	/* eslint-enable @stylistic/no-multi-spaces */
];

class HCardEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		this._defineSchema();
		this._defineConverters();
		this._defineClipboardInputOutput();

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

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				classes: [ 'h-card' ]
			},
			model: ( viewElement, { writer } ) => {
				return writer.createElement( 'h-card', getCardDataFromViewElement( viewElement ) );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'h-card',
			view: ( modelItem, { writer: viewWriter } ) => toWidget( createCardView( modelItem, viewWriter ), viewWriter )
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'h-card',
			view: ( modelItem, { writer: viewWriter } ) => createCardView( modelItem, viewWriter )
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

	_defineClipboardInputOutput() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;

		this.listenTo( viewDocument, 'clipboardInput', ( evt, data ) => {
			const contactData = data.dataTransfer.getData( 'contact' );

			// There is no contact data or the clipboard content was already processed by the listener on the higher priority
			// (for example while pasting into code-block).
			if ( !contactData || data.content ) {
				return;
			}

			const contact = JSON.parse( contactData );
			const writer = new UpcastWriter( viewDocument );
			const fragment = writer.createDocumentFragment();

			writer.appendChild(
				writer.createElement( 'span', { class: 'h-card' }, [
					writer.createElement( 'a', { href: `mailto:${ contact.email }`, class: 'p-name u-email' }, contact.name ),
					writer.createElement( 'span', { class: 'p-tel' }, contact.tel )
				] ),
				fragment
			);

			data.content = fragment;
		} );

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

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet, Code, RemoveFormat, CodeBlock, EasyImage, ImageResize, LinkImage,
			AutoImage, AutoLink, TextTransformation, Alignment, PasteFromOffice, PageBreak,
			HorizontalLine, ImageUpload, CloudServices, HCardEditing
		],
		toolbar: [
			'heading',
			'|',
			'removeFormat', 'bold', 'italic', 'code', 'link',
			'|',
			'bulletedList', 'numberedList',
			'|',
			'blockQuote', 'uploadImage', 'insertTable', 'mediaEmbed', 'codeBlock',
			'|',
			'alignment',
			'|',
			'pageBreak', 'horizontalLine',
			'|',
			'undo', 'redo'
		],
		cloudServices: CS_CONFIG,
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		image: {
			toolbar: [
				'imageTextAlternative', '|',
				'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', '|',
				'resizeImage'
			]
		},
		placeholder: 'Type the content here!'
	} )
	.then( editor => {
		window.editor = editor;

		const button = document.getElementById( 'read-only' );
		let isReadOnly = false;

		button.addEventListener( 'click', () => {
			isReadOnly = !isReadOnly;

			if ( isReadOnly ) {
				editor.enableReadOnlyMode( 'manual-test' );
			} else {
				editor.disableReadOnlyMode( 'manual-test' );
			}

			button.textContent = isReadOnly ?
				'Turn off read-only mode' :
				'Turn on read-only mode';

			editor.editing.view.focus();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const contactsContainer = document.querySelector( '#contactList' );

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
			`<img src="assets/${ contact.avatar }.png" alt="avatar" class="u-photo" draggable="false" />` +
			contact.name +
		'</div>';

	contactsContainer.appendChild( li );
} );

const dropArea = document.querySelector( '#drop-area' );

dropArea.addEventListener( 'dragover', event => {
	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy';
	dropArea.classList.add( 'dragover' );
} );

dropArea.addEventListener( 'dragleave', () => {
	dropArea.classList.remove( 'dragover' );
} );

dropArea.addEventListener( 'drop', event => {
	const contact = event.dataTransfer.getData( 'contact' );

	dropArea.innerText =
		'-- text/plain --\n' + event.dataTransfer.getData( 'text/plain' ) + '\n\n' +
		'-- text/html --\n' + event.dataTransfer.getData( 'text/html' ) + '\n\n' +
		'-- contact --\n' + ( contact ? JSON.stringify( JSON.parse( contact ), 0, 2 ) : '' ) + '\n';
	dropArea.classList.remove( 'dragover' );

	event.preventDefault();
} );
