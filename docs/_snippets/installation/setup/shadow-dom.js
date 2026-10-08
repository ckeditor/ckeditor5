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

const demoElement = document.querySelector( '#snippet-shadow-dom' );

setUpPageStylesButtons();
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

// Adds global rules to the page, like any style sheet of the host application would. They are scoped to the demo and
// the overlay layer of the light-DOM editor, so the rest of the guide keeps its styles. Like any page styles, they
// stop at the shadow boundary.
function setUpPageStylesButtons() {
	// The buttons are in the guide, above the snippet, and the reset one starts disabled there.
	const applyButton = document.querySelector( '#snippet-shadow-dom-apply-styles' );
	const resetButton = document.querySelector( '#snippet-shadow-dom-reset-styles' );
	const pageStyleSheet = new CSSStyleSheet();

	pageStyleSheet.replaceSync( `
		p { color: #9a3412; font-family: Georgia, serif; font-size: 1.125em; }
		h2 { color: #15803d; }
		li { font-style: italic; }
	` );

	const togglePageStyles = isApplied => {
		const otherStyleSheets = document.adoptedStyleSheets.filter( sheet => sheet !== pageStyleSheet );

		document.adoptedStyleSheets = isApplied ? [ ...otherStyleSheets, pageStyleSheet ] : otherStyleSheets;

		applyButton.disabled = isApplied;
		resetButton.disabled = !isApplied;
		( isApplied ? resetButton : applyButton ).focus();
	};

	applyButton.addEventListener( 'click', () => togglePageStyles( true ) );
	resetButton.addEventListener( 'click', () => togglePageStyles( false ) );
}
