/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, setTimeout */

import { Underline, Strikethrough } from '@ckeditor/ckeditor5-basic-styles';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor
	.create( document.querySelector( '.chat__editor' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ Mention, MentionLinks, Underline, Strikethrough ],
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic', 'underline', 'strikethrough',
				'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [
						{ id: '@cflores', avatar: 'm_1', name: 'Charles Flores' },
						{ id: '@gjackson', avatar: 'm_2', name: 'Gerald Jackson' },
						{ id: '@wreed', avatar: 'm_3', name: 'Wayne Reed' },
						{ id: '@lgarcia', avatar: 'm_4', name: 'Louis Garcia' },
						{ id: '@rwilson', avatar: 'm_5', name: 'Roy Wilson' },
						{ id: '@mnelson', avatar: 'm_6', name: 'Matthew Nelson' },
						{ id: '@rwilliams', avatar: 'm_7', name: 'Randy Williams' },
						{ id: '@ajohnson', avatar: 'm_8', name: 'Albert Johnson' },
						{ id: '@sroberts', avatar: 'm_9', name: 'Steve Roberts' },
						{ id: '@kevans', avatar: 'm_10', name: 'Kevin Evans' },
						{ id: '@mwilson', avatar: 'w_1', name: 'Mildred Wilson' },
						{ id: '@mnelson', avatar: 'w_2', name: 'Melissa Nelson' },
						{ id: '@kallen', avatar: 'w_3', name: 'Kathleen Allen' },
						{ id: '@myoung', avatar: 'w_4', name: 'Mary Young' },
						{ id: '@arogers', avatar: 'w_5', name: 'Ashley Rogers' },
						{ id: '@dgriffin', avatar: 'w_6', name: 'Debra Griffin' },
						{ id: '@dwilliams', avatar: 'w_7', name: 'Denise Williams' },
						{ id: '@ajames', avatar: 'w_8', name: 'Amy James' },
						{ id: '@randerson', avatar: 'w_9', name: 'Ruby Anderson' },
						{ id: '@wlee', avatar: 'w_10', name: 'Wanda Lee' }
					],
					itemRenderer: customItemRenderer
				},
				{
					marker: '#',
					feed: [
						'#american', '#asian', '#baking', '#breakfast', '#cake', '#caribbean',
						'#chinese', '#chocolate', '#cooking', '#dairy', '#delicious', '#delish',
						'#dessert', '#desserts', '#dinner', '#eat', '#eating', '#eggs', '#fish',
						'#food', '#foodgasm', '#foodie', '#foodporn', '#foods', '#french', '#fresh',
						'#fusion', '#glutenfree', '#greek', '#grilling', '#halal', '#homemade',
						'#hot', '#hungry', '#icecream', '#indian', '#italian', '#japanese', '#keto',
						'#korean', '#lactosefree', '#lunch', '#meat', '#mediterranean', '#mexican',
						'#moroccan', '#nom', '#nomnom', '#paleo', '#poultry', '#snack', '#spanish',
						'#sugarfree', '#sweet', '#sweettooth', '#tasty', '#thai', '#vegan',
						'#vegetarian', '#vietnamese', '#yum', '#yummy'
					]
				}
			]
		}
	} )
	.then( editor => {
		const editingView = editor.editing.view;
		const rootElement = editingView.document.getRoot();

		window.editor = editor;

		// Clone the first message in the chat when "Send" is clicked, fill it with new data
		// and append to the chat list.
		document.querySelector( '.chat-send' ).addEventListener( 'click', () => {
			const message = editor.getData();

			if ( !message ) {
				editingView.change( writer => {
					writer.addClass( 'highlighted', rootElement );
					editingView.focus();
				} );

				setTimeout( () => {
					editingView.change( writer => {
						writer.removeClass( 'highlighted', rootElement );
					} );
				}, 650 );

				return;
			}

			const clone = document.querySelector( '.chat__posts li' ).cloneNode( true );

			clone.classList.add( 'new-post' );
			clone.querySelector( 'img' ).src = '../../assets/img/m_0.jpg';
			clone.querySelector( 'strong' ).textContent = 'CKEditor User';

			const mailtoUser = clone.querySelector( '.chat__posts__post__mailto-user' );

			mailtoUser.textContent = '@ckeditor';
			mailtoUser.href = 'mailto:info@cksource.com';

			clone.querySelector( '.chat__posts__post__time' ).textContent = 'just now';
			clone.querySelector( '.chat__posts__post__content' ).innerHTML = message;

			document.querySelector( '.chat__posts' ).appendChild( clone );

			editor.setData( '' );
			editingView.focus();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

/*
 * This plugin customizes the way mentions are handled in the editor model and data.
 * Instead of a classic <span class="mention"></span>,
 */
function MentionLinks( editor ) {
	// The upcast converter will convert a view
	//
	//		<a href="..." class="mention" data-mention="...">...</a>
	//
	// element to the model "mention" text attribute.
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
			value: viewItem => editor.plugins.get( 'Mention' ).toMentionAttribute( viewItem )
		},
		converterPriority: 'high'
	} );

	// Downcast the model "mention" text attribute to a view
	//
	//		<a href="..." class="mention" data-mention="...">...</a>
	//
	// element.
	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: 'mention',
		view: ( modelAttributeValue, { writer } ) => {
			// Do not convert empty attributes (lack of value means no mention).
			if ( !modelAttributeValue ) {
				return;
			}

			let href;

			// User mentions are downcasted as mailto: links. Tags become normal URLs.
			if ( modelAttributeValue.id[ 0 ] === '@' ) {
				href = `mailto:${ modelAttributeValue.id.slice( 1 ) }@example.com`;
			} else {
				href = `https://example.com/social/${ modelAttributeValue.id.slice( 1 ) }`;
			}

			return writer.createAttributeElement( 'a', {
				class: 'mention',
				'data-mention': modelAttributeValue.id,
				href
			}, {
				// Make mention attribute to be wrapped by other attribute elements.
				priority: 20,
				// Prevent merging mentions together.
				id: modelAttributeValue.uid
			} );
		},
		converterPriority: 'high'
	} );
}

/*
 * Customizes the way the list of user suggestions is displayed.
 * Each user has an @id, a name and an avatar.
 */
function customItemRenderer( item ) {
	const itemElement = document.createElement( 'span' );
	const avatar = document.createElement( 'img' );
	const userNameElement = document.createElement( 'span' );
	const fullNameElement = document.createElement( 'span' );

	itemElement.classList.add( 'mention__item' );

	avatar.src = `../../assets/img/${ item.avatar }.jpg`;

	userNameElement.classList.add( 'mention__item__user-name' );
	userNameElement.textContent = item.id;

	fullNameElement.classList.add( 'mention__item__full-name' );
	fullNameElement.textContent = item.name;

	itemElement.appendChild( avatar );
	itemElement.appendChild( userNameElement );
	itemElement.appendChild( fullNameElement );

	return itemElement;
}
