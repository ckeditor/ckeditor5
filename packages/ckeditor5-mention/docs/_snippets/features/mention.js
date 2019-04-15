/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '.snippet-mention__editor' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ MentionCustomization ],
		toolbar: {
			items: [
				'bold', 'italic', 'underline', 'strikethrough', '|', 'link', '|', 'undo', 'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [
						{ id: '@cflores', userId: '1', avatar: 'm_1', name: 'Charles Flores' },
						{ id: '@gjackson', userId: '2', avatar: 'm_2', name: 'Gerald Jackson' },
						{ id: '@wreed', userId: '3', avatar: 'm_3', name: 'Wayne Reed' },
						{ id: '@lgarcia', userId: '4', avatar: 'm_4', name: 'Louis Garcia' },
						{ id: '@rwilson', userId: '5', avatar: 'm_5', name: 'Roy Wilson' },
						{ id: '@mnelson', userId: '6', avatar: 'm_6', name: 'Matthew Nelson' },
						{ id: '@rwilliams', userId: '7', avatar: 'm_7', name: 'Randy Williams' },
						{ id: '@ajohnson', userId: '8', avatar: 'm_8', name: 'Albert Johnson' },
						{ id: '@sroberts', userId: '9', avatar: 'm_9', name: 'Steve Roberts' },
						{ id: '@kevans', userId: '10', avatar: 'm_10', name: 'Kevin Evans' },
						{ id: '@mwilson', userId: '11', avatar: 'w_1', name: 'Mildred Wilson' },
						{ id: '@mnelson', userId: '12', avatar: 'w_2', name: 'Melissa Nelson' },
						{ id: '@kallen', userId: '13', avatar: 'w_3', name: 'Kathleen Allen' },
						{ id: '@myoung', userId: '14', avatar: 'w_4', name: 'Mary Young' },
						{ id: '@arogers', userId: '15', avatar: 'w_5', name: 'Ashley Rogers' },
						{ id: '@dgriffin', userId: '16', avatar: 'w_6', name: 'Debra Griffin' },
						{ id: '@dwilliams', userId: '17', avatar: 'w_7', name: 'Denise Williams' },
						{ id: '@ajames', userId: '18', avatar: 'w_8', name: 'Amy James' },
						{ id: '@randerson', userId: '19', avatar: 'w_9', name: 'Ruby Anderson' },
						{ id: '@wlee', userId: '20', avatar: 'w_10', name: 'Wanda Lee' }
					],
					itemRenderer: customItemRenderer
				},
				{
					marker: '#',
					feed: [
						'#american',
						'#asian',
						'#baking',
						'#breakfast',
						'#cake',
						'#caribbean',
						'#chinese',
						'#chocolate',
						'#cooking',
						'#dairy',
						'#delicious',
						'#delish',
						'#dessert',
						'#desserts',
						'#dinner',
						'#eat',
						'#eating',
						'#eggs',
						'#fish',
						'#food',
						'#foodgasm',
						'#foodie',
						'#foodporn',
						'#foods',
						'#french',
						'#fresh',
						'#fusion',
						'#glutenfree',
						'#greek',
						'#grilling',
						'#halal',
						'#homemade',
						'#hot',
						'#hungry',
						'#icecream',
						'#indian',
						'#italian',
						'#japanese',
						'#keto',
						'#korean',
						'#lactosefree',
						'#lunch',
						'#meat',
						'#mediterranean',
						'#mexican',
						'#moroccan',
						'#nom',
						'#nomnom',
						'#paleo',
						'#poultry',
						'#snack',
						'#spanish',
						'#sugarfree',
						'#sweet',
						'#sweettooth',
						'#tasty',
						'#thai',
						'#vegan',
						'#vegetarian',
						'#vietnamese',
						'#yum',
						'#yummy'
					]
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		document.querySelector( '.snippet-mention-send' ).addEventListener( 'click', () => {
			const clone = document.querySelector( '.snippet-mention__posts li' ).cloneNode( true );

			clone.classList.add( 'new-post' );
			clone.querySelector( 'img' ).src = '../assets/img/m_0.jpg';
			clone.querySelector( 'strong' ).textContent = 'CKEditor User';
			clone.querySelector( 'a.mailto-user' ).textContent = '@ckeditor';
			clone.querySelector( '.time' ).textContent = 'now';
			clone.querySelector( '.post-content' ).innerHTML = editor.getData();

			document.querySelector( '.snippet-mention__posts' ).appendChild( clone );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function MentionCustomization( editor ) {
	// The upcast converter will convert view <a class="mention" href="">
	// elements to the model 'mention' text attribute.
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
				// The mention feature expects that the mention attribute value
				// in the model is a plain object with a set of additional attributes.
				// In order to create a proper object use the toMentionAttribute() helper method:
				return editor.plugins.get( 'Mention' ).toMentionAttribute( viewItem );
			}
		},
		converterPriority: 'high'
	} );

	// Downcast the model 'mention' text attribute to a view <a> element.
	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: 'mention',
		view: ( modelAttributeValue, viewWriter ) => {
			// Do not convert empty attributes (lack of value means no mention).
			if ( !modelAttributeValue ) {
				return;
			}

			let href;

			if ( modelAttributeValue.id[ 0 ] === '@' ) {
				href = `mailto:${ modelAttributeValue.id.slice( 1 ) }@example.com`;
			} else {
				href = `https://example.com/social/${ modelAttributeValue.id.slice( 1 ) }`;
			}

			return viewWriter.createAttributeElement( 'a', {
				class: 'mention',
				'data-mention': modelAttributeValue.id,
				href
			} );
		},
		converterPriority: 'high'
	} );
}

function customItemRenderer( item ) {
	const itemElement = document.createElement( 'span' );
	const avatar = document.createElement( 'img' );
	const userNameElement = document.createElement( 'span' );
	const fullNameElement = document.createElement( 'span' );

	itemElement.classList.add( 'snippet-mention__item' );

	avatar.src = `../assets/img/${ item.avatar }.jpg`;

	userNameElement.classList.add( 'snippet-mention__item__user-name' );
	userNameElement.textContent = item.id;

	fullNameElement.classList.add( 'snippet-mention__item__full-name' );
	fullNameElement.textContent = item.name;

	itemElement.appendChild( avatar );
	itemElement.appendChild( userNameElement );
	itemElement.appendChild( fullNameElement );

	return itemElement;
}
