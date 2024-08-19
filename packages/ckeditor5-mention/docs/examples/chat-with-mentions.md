---
category: examples-framework
order: 80
classes: main__content--no-toc
toc: false
meta-title: Chat with mentions | CKEditor 5 Documentation
---

# Chat with mentions

The {@link features/mentions mention} feature allows developing rich–text applications (like chats) with autocomplete suggestions displayed in a dedicated panel as the user types a pre-configured marker. For instance, in the editor below, type **"@"** to mention users and **"#"** to select from the list of available tags.

{@snippet examples/chat-with-mentions}

Learn how to {@link features/mentions#configuration configure mention feeds} in the dedicated guide and check out the full source code of this example below if you want to implement your own chat using CKEditor&nbsp;5 WYSIWYG editor.

## Editor example configuration

The following code will let you run the editor inside a chat application like in the example above.

<details>
<summary>View editor configuration script</summary>

```js
import {
	ClassicEditor,
	Bold,
	Italic,
	Strikethrough,
	Underline,
	Essentials,
	Link,
	Mention,
	Paragraph
} from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '.chat__editor' ), {
		licenseKey: 'GPL', // Or '<YOUR_LICENSE_KEY>'.
		extraPlugins: [ Essentials, Paragraph, Mention, MentionLinks, Bold, Italic, Underline, Strikethrough, Link ],
		toolbar: {
			items: [
				'undo', 'redo',
				'|',
				'heading',
				'|',
				'bold', 'italic', 'underline', 'strikethrough',
				'|',
				'link', 'uploadImage', 'insertTable', 'mediaEmbed',
				'|',
				'bulletedList', 'numberedList', 'outdent', 'indent'
			]
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
			clone.querySelector( 'img' ).src = 'https://ckeditor.com/docs/ckeditor5/latest/assets/img/m_0.jpg';
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

	avatar.src = `https://ckeditor.com/docs/ckeditor5/latest/assets/img/${ item.avatar }.jpg`;

	userNameElement.classList.add( 'mention__item__user-name' );
	userNameElement.textContent = item.id;

	fullNameElement.classList.add( 'mention__item__full-name' );
	fullNameElement.textContent = item.name;

	itemElement.appendChild( avatar );
	itemElement.appendChild( userNameElement );
	itemElement.appendChild( fullNameElement );

	return itemElement;
}
```

</details>

<details>
<summary>View editor content listing</summary>

```html
<div class="chat">
	<ul class="chat__posts">
		<li>
			<img src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/m_1.jpg" alt="avatar" class="photo">
			<div class="chat__posts__post__message">
				<strong>Charles Flores</strong>
				<a class="chat__posts__post__mailto-user" href="mailto:cflores@example.com">@cflores</a>
				<span class="chat__posts__post__time">2 hours ago</span>
				<p class="chat__posts__post__content">
					Thanks for another <a class="mention" data-mention="#yummy" href="https://example.com/social/yummy">#yummy</a> recipe,
					<a class="mention" data-mention="@dwilliams" href="mailto:dwilliams@example.com">@dwilliams</a>!
					Makes me <a class="mention" data-mention="#hungry" href="https://example.com/social/hungry">#hungry</a>
					just looking at the photos 😋. Definitely adding it to my TODO list for our next
					<a class="mention" data-mention="#mediterranean" href="https://example.com/social/mediterranean">#mediterranean</a> potluck.
				</p>
			</div>
		</li>
		<li>
			<img src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/w_1.jpg" alt="avatar" class="photo">
			<div class="chat__posts__post__message">
				<strong>Mildred Wilson</strong>
				<a class="chat__posts__post__mailto-user" href="mailto:mwilson@example.com">@mwilson</a>
				<span class="chat__posts__post__time">4 hours ago</span>
				<p class="chat__posts__post__content">
					Really appreciate the <a class="mention" data-mention="#vegetarian" href="https://example.com/social/vegetarian">#vegetarian</a>
					and <a class="mention" data-mention="#vegan" href="https://example.com/social/vegan">#vegan</a> variations of your recipes.
					So thoughtful of you! 🌱
				</p>
			</div>
		</li>
	</ul>
	<div class="chat__editor">
		<p>
			I agree with <a href="mailto:mwilson@example.com" class="mention" data-mention="@mwilson">@mwilson</a> 👍.
			It’s so nice of you to always be providing a few options to try! I love
			<a href="https://example.com/social/greek" class="mention" data-mention="#greek">#greek</a> cuisine with a modern twist,
			this one will be perfect to try.
		</p>
	</div>

	<button class="chat-send" type="button">Send</button>
</div>

<style>
	/* ---- General layout ---------------------------------------------------------------------- */

	.chat {
		margin-bottom: 1em
	}

	/* ---- Chat posts -------------------------------------------------------------------------- */

	.chat ul.chat__posts {
		border: 1px solid var(--ck-color-base-border);
		border-top-left-radius: var(--ck-border-radius);
		border-top-right-radius: var(--ck-border-radius);
		border-bottom: none;
		margin: 1em 0 0;
		padding: 1em;
		list-style-position: inside;
	}

	.chat ul.chat__posts li {
		display: flex;
	}

	.chat ul.chat__posts li.new-post {
		/* Highlight a new post in the chat. */
		animation: highlight 600ms ease-out;
	}

	.chat ul.chat__posts li + li {
		margin-top: 1em;
	}

	.chat .chat__posts li .photo {
		border-radius: 100%;
		height: 40px;
		margin-right: 1.5em;
	}

	.chat .chat__posts li .time {
		color: hsl(0, 0%, 72%);
		font-size: .9em;
	}

	.chat .chat__posts .chat__posts__post__message > strong::after,
	.chat__posts__post__mailto-user::after {
		content: "•";
		padding-left: 5px;
		padding-right: 5px;
		color: hsl(0, 0%, 72%);
	}

	@keyframes highlight {
		0% {
			background-color: yellow;
		}

		100% {
			background-color: white;
		}
	}

	/* ---- Chat editor ------------------------------------------------------------------------- */

	.chat .chat__editor {
		/* Anti–FOUC (flash of unstyled content). */
		padding: 1em;
		border: 1px solid var(--ck-color-base-border);
	}

	.chat .chat__editor + .ck.ck-editor {
		margin-top: 0;
	}

	.chat .chat__editor + .ck.ck-editor .ck.ck-toolbar {
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}

	.chat .chat__editor + .ck.ck-editor .ck-content.highlighted {
		animation: highlight 600ms ease-out;
	}

	/* ---- In–editor mention list --------------------------------------------------------------- */

	.ck-mentions .mention__item {
		display: block;
	}

	.ck-mentions .mention__item img {
		border-radius: 100%;
		height: 30px;
	}

	.ck-mentions .mention__item span {
		margin-left: .5em;
	}

	.ck-mentions .mention__item.ck-on span {
		color: var(--ck-color-base-background);
	}

	.ck-mentions .mention__item .mention__item__full-name {
		color: hsl(0, 0%, 45%);
	}

	.ck-mentions .mention__item:hover:not(.ck-on) .mention__item__full-name {
		color: hsl(0, 0%, 40%);
	}

	/* ---- Chat editor content styles ----------------------------------------------------------- */

	.chat .ck-content .mention {
		background: unset;
	}

	.chat .ck.ck-content a,
	.chat .chat__posts a {
		color: hsl(231, 89%, 53%);
	}
</style>
```
</details>
