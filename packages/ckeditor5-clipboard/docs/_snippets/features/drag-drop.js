/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { CS_CONFIG, attachTourBalloon } from '@snippets/index.js';
import { DragDropEditor } from './build-drag-drop-source.js';

const contactsContainer = document.querySelector( '.contacts' );

DragDropEditor.create( document.querySelector( '#snippet-drag-drop' ), {
	placeholder: 'Drop the content here to test the feature.',
	cloudServices: CS_CONFIG
} )
	.then( editor => {
		window.editor = editor;

		attachTourBalloon( {
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

const contacts = [
	{
		name: 'Huckleberry Finn',
		tel: '+48 1345 234 235',
		email: 'h.finn@example.com',
		avatar: 'hfin'
	},
	{
		name: 'D\'Artagnan',
		tel: '+45 2345 234 235',
		email: 'dartagnan@example.com',
		avatar: 'dartagnan'
	},
	{
		name: 'Little Red Riding Hood',
		tel: '+45 2345 234 235',
		email: 'lrrh@example.com',
		avatar: 'lrrh'
	},
	{
		name: 'Alice',
		tel: '+20 4345 234 235',
		email: 'alice@example.com',
		avatar: 'alice'
	},
	{
		name: 'Phileas Fogg',
		tel: '+44 3345 234 235',
		email: 'p.fogg@example.com',
		avatar: 'pfog'
	},
	{
		name: 'Winnetou',
		tel: '+44 3345 234 235',
		email: 'winnetou@example.com',
		avatar: 'winetou'
	},
	{
		name: 'Edmond Dantès',
		tel: '+20 4345 234 235',
		email: 'count@example.com',
		avatar: 'edantes'
	},
	{
		name: 'Robinson Crusoe',
		tel: '+45 2345 234 235',
		email: 'r.crusoe@example.com',
		avatar: 'rcrusoe'
	}
];

contactsContainer.addEventListener( 'dragstart', event => {
	const target =
		event.target.nodeType == 1 ? event.target : event.target.parentElement;
	const draggable = target.closest( '[draggable]' );

	event.dataTransfer.setData( 'text/plain', draggable.innerText );
	event.dataTransfer.setData( 'text/html', draggable.innerText );
	event.dataTransfer.setData(
		'contact',
		JSON.stringify( contacts[ draggable.dataset.contact ] )
	);

	event.dataTransfer.setDragImage( draggable, 0, 0 );
} );

contacts.forEach( ( contact, id ) => {
	const li = document.createElement( 'li' );

	li.innerHTML =
		`<div class="contact h-card" data-contact="${ id }" draggable="true">` +
		`<img src="../assets/img/${ contact.avatar }.png" alt="avatar" class="u-photo" draggable="false" />` +
		contact.name +
		'</div>';

	contactsContainer.appendChild( li );
} );
