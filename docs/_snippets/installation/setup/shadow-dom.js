/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	ClassicEditor,
	Plugin,
	Essentials,
	Paragraph,
	Heading,
	Bold,
	Italic,
	Link,
	List,
	BlockQuote
} from 'ckeditor5';
import { Comments, TrackChanges } from 'ckeditor5-premium-features';
import {
	createElement,
	getViewportTopOffsetConfig,
	createSnippetShadowRootElement
} from '@snippets/index.js';

import './shadow-dom.css';

// The users, the comment thread, and the suggestion that the initial data refers to.
const USERS = [
	{ id: 'user-1', name: 'Mex Haddox' },
	{ id: 'user-2', name: 'Zee Croce' }
];

const COMMENT_THREADS = [
	{
		threadId: 'thread-1',
		comments: [
			{
				commentId: 'comment-1',
				authorId: 'user-2',
				content: '<p>Comments and suggestions work in both editors.</p>',
				createdAt: new Date( '2026-09-28T10:15:00' ),
				attributes: {}
			}
		],
		context: {
			type: 'text',
			value: 'Style isolation'
		},
		resolvedAt: null,
		resolvedBy: null,
		attributes: {}
	}
];

const SUGGESTIONS = [
	{
		id: 'suggestion-1',
		type: 'insertion',
		authorId: 'user-2',
		createdAt: new Date( '2026-09-28T10:20:00' ),
		data: null,
		attributes: {}
	}
];

const INITIAL_DATA = `
	<h2><comment-start name="thread-1"></comment-start>Style isolation<comment-end name="thread-1"></comment-end></h2>
	<p>
		Both editors use the same configuration.
		Only the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM">DOM tree</a>
		they live in is different.
	</p>
	<ul>
		<li>The toolbar and its dropdowns.</li>
		<li>The tooltips and balloons.</li>
		<li>The content of the editing area.</li>
	</ul>
	<blockquote>
		<p>
			The <suggestion-start name="insertion:suggestion-1:user-2"></suggestion-start>global
			<suggestion-end name="insertion:suggestion-1:user-2"></suggestion-end>page styles stop at the shadow boundary.
		</p>
	</blockquote>
`;

// Loads the users, the comment thread, and the suggestion. The demo has no backend, so everything stays in the browser.
class CollaborationDataLoader extends Plugin {
	static get pluginName() {
		return 'CollaborationDataLoader';
	}

	static get requires() {
		// `Comments` brings `CommentsRepository` and `Users` along.
		return [ Comments, TrackChanges ];
	}

	init() {
		const usersPlugin = this.editor.plugins.get( 'Users' );
		const commentsRepositoryPlugin = this.editor.plugins.get( 'CommentsRepository' );
		const trackChangesPlugin = this.editor.plugins.get( 'TrackChanges' );

		for ( const user of USERS ) {
			usersPlugin.addUser( user );
		}

		usersPlugin.defineMe( 'user-1' );

		for ( const commentThread of COMMENT_THREADS ) {
			commentsRepositoryPlugin.addCommentThread( commentThread );
		}

		for ( const suggestion of SUGGESTIONS ) {
			trackChangesPlugin.addSuggestion( suggestion );
		}
	}
}

// The host applications the demo can put around both editors. Each one brings global rules, like any style sheet of a real
// application would. The `{scope}` placeholder limits them to the area around the editors and the overlay layer of the light-DOM editor,
// so the rest of the guide keeps its styles.
const SURROUNDINGS = [
	{
		id: 'docs',
		title: 'Docs site',
		side: `
			<div class="shadow-dom-demo__side-search">Search docs…</div>
			<ul>
				<li>Getting started</li>
				<li>Installation</li>
				<li class="shadow-dom-demo__side-active">Shadow DOM</li>
				<li>Theming</li>
				<li>API reference</li>
			</ul>
			<div class="shadow-dom-demo__side-note">v49 · stable</div>
		`,
		before: `
			<p class="shadow-dom-demo__app-kicker">Guides › Setup</p>
			<h3>Embedding the editor in your pages</h3>
			<p>
				This docs site sets a serif font for its body copy, teal headings, and underlined
				<a href="#snippet-shadow-dom">links</a>. Every article inherits these rules, and so does anything placed in it.
			</p>
			<ul>
				<li>The paragraph and this list are part of the docs site.</li>
				<li>Compare them with the content of both editors below.</li>
			</ul>
		`,
		after: `
			<p class="shadow-dom-demo__app-note">Was this page helpful? Yes · No</p>
		`,
		styles: `
			{scope} p, {scope} li, {scope} blockquote { font-family: Georgia, "Times New Roman", serif; color: #2d3748; }
			{scope} h2, {scope} h3 { color: #10b981; font-family: system-ui, sans-serif; }
			{scope} a { color: #0d9488; text-decoration: underline; }
		`
	},
	{
		id: 'crm',
		title: 'Sales console',
		side: `
			<div class="shadow-dom-demo__side-card">
				<span class="shadow-dom-demo__side-avatar">AC</span>
				<span>
					<span class="shadow-dom-demo__side-kicker">Account</span><br>
					<span class="shadow-dom-demo__side-name">Acme Corp</span>
				</span>
			</div>
			<div class="shadow-dom-demo__side-kicker">Activity</div>
			<ul>
				<li>Call with the CTO, today</li>
				<li>Renewal email, Monday</li>
				<li>Contract draft, Friday</li>
			</ul>
		`,
		before: `
			<p class="shadow-dom-demo__app-kicker">Account › Acme Corp › Notes</p>
			<h3>Renewal call summary</h3>
			<p>
				The sales console sets every paragraph to 13 pixels and colors headings in navy. Notes are written in
				<a href="#snippet-shadow-dom">rich text</a> right on the account record.
			</p>
			<ul class="shadow-dom-demo__app-fields">
				<li><strong>Owner:</strong> Mex Haddox</li>
				<li><strong>Stage:</strong> Negotiation</li>
				<li><strong>Close date:</strong> Dec 12</li>
			</ul>
		`,
		after: `
			<div class="shadow-dom-demo__app-actions" aria-hidden="true">
				<span>Cancel</span>
				<span class="shadow-dom-demo__app-action_primary">Save note</span>
			</div>
		`,
		styles: `
			{scope} p, {scope} li, {scope} blockquote {
				font-family: "Salesforce Sans", -apple-system, "Segoe UI", sans-serif; font-size: 13px; color: #181818;
			}
			{scope} h2, {scope} h3 { color: #032d60; font-weight: 700; }
			{scope} a { color: #0176d3; }
		`
	},
	{
		id: 'cms',
		title: 'CMS admin',
		side: `
			<div class="shadow-dom-demo__side-button">+ Add content</div>
			<ul>
				<li>Articles
					<ul>
						<li class="shadow-dom-demo__side-active">Shadow DOM demo</li>
						<li>Release notes</li>
					</ul>
				</li>
				<li>Pages</li>
				<li>Media</li>
			</ul>
		`,
		before: `
			<p class="shadow-dom-demo__app-kicker">Articles › Edit</p>
			<h3>Edit article: Shadow DOM demo</h3>
			<p>
				The admin panel uses a compact sans-serif font for all its text and underlines its
				<a href="#snippet-shadow-dom">links</a>. The article body is edited in the rich-text field below.
			</p>
			<ul class="shadow-dom-demo__app-fields">
				<li><strong>Status:</strong> Draft</li>
				<li><strong>Author:</strong> Zee Croce</li>
				<li><strong>Category:</strong> Tutorials</li>
			</ul>
		`,
		after: `
			<div class="shadow-dom-demo__app-actions" aria-hidden="true">
				<span>Save draft</span>
				<span>Preview</span>
				<span class="shadow-dom-demo__app-action_primary">Publish</span>
			</div>
		`,
		styles: `
			{scope} p, {scope} li, {scope} blockquote {
				font-family: -apple-system, "Segoe UI", Roboto, sans-serif; font-size: 13px; color: #3c434a;
			}
			{scope} h2, {scope} h3 { color: #1d2327; }
			{scope} a { color: #2271b1; text-decoration: underline; }
		`
	}
];

const demoElement = document.querySelector( '#snippet-shadow-dom' );

setUpSurroundings();
createLightDomEditor();
createShadowDomEditor();

function createLightDomEditor() {
	const overlayContainer = createElement( 'div', {
		className: 'shadow-dom-demo__overlay'
	} );

	document.body.append( overlayContainer );

	createEditor( demoElement.querySelector( '.shadow-dom-demo__light-editor' ), overlayContainer )
		.then( editor => {
			window.lightDomEditor = editor;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

function createShadowDomEditor() {
	const editorHost = demoElement.querySelector( '.shadow-dom-demo__shadow-host' );
	const overlayContainer = createSnippetShadowRootElement( {
		className: editorHost.className,
		layers: editorHost.getAttribute( 'layers' )?.split( ' ' )
	} );

	Promise.all( [ editorHost.stylesLoaded, overlayContainer.host.stylesLoaded ] )
		.then( () => createEditor( editorHost.shadowRoot.querySelector( '.shadow-dom-demo__shadow-editor' ), overlayContainer ) )
		.then( editor => {
			window.shadowDomEditor = editor;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

// Both overlay layers mount at the end of the page, because balloons are misplaced when the overlay container has
// a positioned ancestor.
async function createEditor( attachTo, overlayContainer ) {
	const editor = await ClassicEditor.create( {
		attachTo,
		root: {
			initialData: INITIAL_DATA
		},
		plugins: [
			Essentials, Paragraph, Heading, Bold, Italic, Link, List, BlockQuote,
			Comments, TrackChanges, CollaborationDataLoader
		],
		toolbar: [
			'heading', '|', 'bold', 'italic', 'link', '|', 'comment', 'trackChanges',
			'|', 'bulletedList', 'numberedList', 'blockQuote', '|', 'undo', 'redo'
		],
		comments: {
			editorConfig: {
				extraPlugins: [ Bold, Italic, List ]
			}
		},
		ui: {
			overlayContainer,
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		}
	} );

	editor.on( 'destroy', () => {
		( overlayContainer.host ?? overlayContainer ).remove();
	} );

	return editor;
}

// Renders the picker of surrounding apps and switches between them. The rules of the selected app are added to the page
// like any page styles, so they reach the light-DOM editor and its overlay layer, and stop at the shadow boundary.
function setUpSurroundings() {
	// The radio buttons are in the guide, above the snippet.
	const radioElements = document.querySelectorAll( 'input[name="snippet-shadow-dom-surrounding"]' );
	const titleElement = demoElement.querySelector( '.shadow-dom-demo__frame-title' );
	const sideElement = demoElement.querySelector( '.shadow-dom-demo__frame-side' );
	const beforeElement = demoElement.querySelector( '.shadow-dom-demo__app-before' );
	const afterElement = demoElement.querySelector( '.shadow-dom-demo__app-after' );
	const pageStyleSheet = new CSSStyleSheet();
	const scope = ':is(.shadow-dom-demo__frame-main, .shadow-dom-demo__overlay)';

	document.adoptedStyleSheets = [ ...document.adoptedStyleSheets, pageStyleSheet ];

	const select = id => {
		const surrounding = SURROUNDINGS.find( surrounding => surrounding.id === id );

		demoElement.dataset.surround = surrounding.id;
		titleElement.textContent = surrounding.title;
		sideElement.innerHTML = surrounding.side;
		beforeElement.innerHTML = surrounding.before;
		afterElement.innerHTML = surrounding.after;
		pageStyleSheet.replaceSync( surrounding.styles.replaceAll( '{scope}', scope ) );
	};

	for ( const radioElement of radioElements ) {
		radioElement.addEventListener( 'change', () => select( radioElement.value ) );
	}

	// The browser may restore a different choice when the page is reloaded.
	select( document.querySelector( 'input[name="snippet-shadow-dom-surrounding"]:checked' )?.value ?? 'docs' );
}
