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

// The base styles of the CRM, and the changes that its releases bring to them. Each set holds global rules, like any style sheet
// of a real application would. The `{scope}` placeholder limits them to the area around the editors and the overlay layer of
// the light-DOM editor, so the rest of the guide keeps its styles.
const BASE_STYLES = `
	{scope} p, {scope} li, {scope} blockquote {
		font-family: "Salesforce Sans", -apple-system, "Segoe UI", sans-serif; font-size: 13px; color: hsl(0, 0%, 9%);
	}
	{scope} h2, {scope} h3 { color: hsl(213, 94%, 19%); font-weight: 700; }
	{scope} a { color: hsl(210, 100%, 33%); }
`;

const RELEASES = [
	{
		id: 'reset',
		label: 'CSS reset',
		styles: `
			{scope} h2, {scope} h3 { margin: 0; font-size: 1em; font-weight: inherit; }
			{scope} p, {scope} blockquote { margin: 0; }
			{scope} ul, {scope} ol { margin: 0; padding: 0; list-style: none; }
		`
	},
	{
		id: 'redesign',
		label: 'New design system',
		styles: `
			{scope} h2, {scope} h3 { font-weight: 300; letter-spacing: -0.01em; }
			{scope} h2 { font-size: 1.75em; }
			{scope} blockquote {
				padding: 0.75em 1em; border-left: 4px solid hsl(207, 99%, 42%); border-radius: 0 8px 8px 0;
				background: hsl(207, 100%, 96%); font-style: normal;
			}
		`
	},
	{
		id: 'rebrand',
		label: 'Rebrand',
		styles: `
			{scope} h2, {scope} h3 { color: hsl(272, 60%, 30%); }
			{scope} a { color: hsl(272, 60%, 38%); font-weight: 600; text-decoration: none; }
		`
	},
	{
		id: 'compact',
		label: 'Compact density',
		styles: `
			{scope} p, {scope} li, {scope} blockquote { line-height: 1.25; }
			{scope} p { margin-block: 0.25em; }
			{scope} li { margin: 0; }
			{scope} h2, {scope} h3 { margin-block: 0.5em 0.25em; }
		`
	}
];

const demoElement = document.querySelector( '#snippet-shadow-dom' );

setUpReleases();
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

// Applies the CRM releases that the reader picks. Their rules are added to the page like any page styles, so they reach
// the light-DOM editor and its overlay layer, and stop at the shadow boundary.
function setUpReleases() {
	// The checkboxes are in the guide, above the snippet.
	const checkboxElements = document.querySelectorAll( 'input[name="snippet-shadow-dom-release"]' );
	const releaseNotesElement = demoElement.querySelector( '.shadow-dom-demo__app-release' );
	const pageStyleSheet = new CSSStyleSheet();
	const scope = ':is(.shadow-dom-demo__frame-main, .shadow-dom-demo__overlay)';

	document.adoptedStyleSheets = [ ...document.adoptedStyleSheets, pageStyleSheet ];

	const update = () => {
		const checkedValues = [ ...checkboxElements ]
			.filter( checkboxElement => checkboxElement.checked )
			.map( checkboxElement => checkboxElement.value );
		// The releases apply in their order, whatever order the reader picks them in.
		const releases = RELEASES.filter( release => checkedValues.includes( release.id ) );
		const styles = [ BASE_STYLES, ...releases.map( release => release.styles ) ].join( '' );

		for ( const release of RELEASES ) {
			demoElement.classList.toggle( `shadow-dom-demo_${ release.id }`, releases.includes( release ) );
		}

		releaseNotesElement.textContent = releases.length ?
			`Installed updates: ${ releases.map( release => release.label ).join( ', ' ) }.` :
			'No updates installed yet.';

		pageStyleSheet.replaceSync( styles.replaceAll( '{scope}', scope ) );
	};

	for ( const checkboxElement of checkboxElements ) {
		checkboxElement.addEventListener( 'change', update );
	}

	// The browser may restore the checked boxes when the page is reloaded.
	update();
}
