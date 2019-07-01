/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module wordcount/wordcount
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { modelElementToPlainText } from './utils';
import { throttle, isElement } from 'lodash-es';
import View from '@ckeditor/ckeditor5-ui/src/view';
import Template from '@ckeditor/ckeditor5-ui/src/template';

/**
 * The word count plugin.
 *
 * This plugin calculates all words and characters in all {@link module:engine/model/text~Text text nodes} available in the model.
 * It also provides an HTML element, which updates its states whenever the editor's content is changed.
 *
 * Firstly model's data are convert to plain text using {@link module:wordcount/utils.modelElementToPlainText}.
 * Based on such created plain text there are determined amount of words and characters in your text. Please keep in mind
 * that every block in the editor is separate with a newline character, which is included in the calculation.
 *
 * Few examples of how word and character calculation are made:
 *
 * 		<paragraph>foo</paragraph>
 * 		<paragraph>bar</paragraph>
 * 		// Words: 2, Characters: 7
 *
 * 		<paragraph><$text bold="true">foo</$text>bar</paragraph>
 * 		// Words: 1, Characters: 6
 *
 * 		<paragraph>*&^%)</paragraph>
 * 		// Words: 0, Characters: 5
 *
 * 		<paragraph>foo(bar)</paragraph>
 * 		//Words: 2, Characters: 8
 *
 * 		<paragraph>12345</paragraph>
 * 		// Words: 1, Characters: 5
 *
 * @extends module:core/plugin~Plugin
 */
export default class WordCount extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * The number of characters in the editor.
		 *
		 * @observable
		 * @readonly
		 * @member {Number} module:wordcount/wordcount~WordCount#characters
		 */
		this.set( 'characters', 0 );

		/**
		 * The number of words in the editor.
		 *
		 * @observable
		 * @readonly
		 * @member {Number} module:wordcount/wordcount~WordCount#words
		 */
		this.set( 'words', 0 );

		/**
		 * Label used to display words value in {@link #wordCountContainer output container}
		 *
		 * @observable
		 * @private
		 * @readonly
		 * @member {String} module:wordcount/wordcount~WordCount#_wordsLabel
		 */
		this.set( '_wordsLabel' );

		/**
		 * Label used to display characters value in {@link #wordCountContainer output container}
		 *
		 * @observable
		 * @private
		 * @readonly
		 * @member {String} module:wordcount/wordcount~WordCount#_charactersLabel
		 */
		this.set( '_charactersLabel' );

		/**
		 * The configuration of this plugins.
		 *
		 * @private
		 * @type {Object}
		 */
		this._config = editor.config.get( 'wordCount' ) || {};

		/**
		 * A reference to a {@link module:ui/view~View view object} which contains self-updating HTML container.
		 *
		 * @private
		 * @readonly
		 * @type {module:ui/view~View}
		 */
		this._outputView;
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'WordCount';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.model.document.on( 'change:data', throttle( this._calculateWordsAndCharacters.bind( this ), 250 ) );

		if ( typeof this._config.onUpdate == 'function' ) {
			this.on( 'update', ( evt, data ) => {
				this._config.onUpdate( data );
			} );
		}

		if ( isElement( this._config.container ) ) {
			this._config.container.appendChild( this.wordCountContainer );
		}
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this._outputView.element.remove();
		this._outputView.destroy();

		super.destroy();
	}

	/**
	 * Creates self-updated HTML element. Repeated executions return the same element.
	 * Returned element has followed HTML structure:
	 *
	 * 		<div class="ck ck-word-count">
	 * 			<div class="ck-word-count__words">Words: 4</div>
	 * 			<div class="ck-word-count__characters">Characters: 28</div>
	 * 		</div>
	 *
	 * @type {HTMLElement}
	 */
	get wordCountContainer() {
		const editor = this.editor;
		const t = editor.t;
		const displayWords = editor.config.get( 'wordCount.displayWords' );
		const displayCharacters = editor.config.get( 'wordCount.displayCharacters' );
		const bind = Template.bind( this, this );
		const children = [];

		if ( !this._outputView ) {
			this._outputView = new View();

			if ( displayWords || displayWords === undefined ) {
				this.bind( '_wordsLabel' ).to( this, 'words', words => {
					return t( 'Words: %0', [ words ] );
				} );

				children.push( {
					tag: 'div',
					children: [
						{
							text: [ bind.to( '_wordsLabel' ) ]
						}
					],
					attributes: {
						class: 'ck-word-count__words'
					}
				} );
			}

			if ( displayCharacters || displayCharacters === undefined ) {
				this.bind( '_charactersLabel' ).to( this, 'characters', words => {
					return t( 'Characters: %0', [ words ] );
				} );

				children.push( {
					tag: 'div',
					children: [
						{
							text: [ bind.to( '_charactersLabel' ) ]
						}
					],
					attributes: {
						class: 'ck-word-count__characters'
					}
				} );
			}

			this._outputView.setTemplate( {
				tag: 'div',
				attributes: {
					class: [
						'ck',
						'ck-word-count'
					]
				},
				children
			} );

			this._outputView.render();
		}

		return this._outputView.element;
	}

	/**
	 * Determines the number of words and characters in the current editor's model and assigns it to {@link #characters} and {@link #words}.
	 * It also fires {@link #event:update}.
	 *
	 * @private
	 * @fires update
	 */
	_calculateWordsAndCharacters() {
		const txt = modelElementToPlainText( this.editor.model.document.getRoot() );

		this.characters = txt.length;

		this.words = ( txt.match( /[_a-zA-Z0-9À-ž]+/gu ) || [] ).length;

		this.fire( 'update', {
			words: this.words,
			characters: this.characters
		} );
	}
}

/**
 * Event fired after {@link #words} and {@link #characters} are updated.
 *
 * @event update
 * @param {Object} data
 * @param {Number} data.words number of words in current model
 * @param {Number} data.characters number of characters in current model
 */

/**
 * The configuration of the word count feature.
 *
 *		ClassicEditor
 *			.create( {
 *				wordCount: ... // Word count feature configuration.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface module:wordcount/wordcount~WordCountConfig
 */

/**
 * The configuration of the word count feature.
 * It is introduced by the {@link module:wordcount/wordcount~WordCount} feature.
 *
 * Read more in {@link module:wordcount/wordcount~WordCountConfig}.
 *
 * @member {module:wordcount/wordcount~WordCountConfig} module:core/editor/editorconfig~EditorConfig#wordCount
 */

/**
 * This option allows for hiding the word count. The element obtained through
 * {@link module:wordcount/wordcount~WordCount#wordCountContainer} will only preserve
 * the characters part. word count is displayed by default when this configuration option is not defined.
 *
 *		const wordCountConfig = {
 *			displayWords = false
 *		}
 *
 * The mentioned configuration will result with the followed container:
 *
 *		<div class="ck ck-word-count">
 *			<div class="ck-word-count__characters">Characters: 28</div>
 *		</div>
 *
 * @member {Boolean} module:wordcount/wordcount~WordCountConfig#displayWords
 */

/**
 * This option allows for hiding the character counter. The element obtained through
 * {@link module:wordcount/wordcount~WordCount#wordCountContainer} will only preserve
 * the words part. Character counter is displayed by default when this configuration option is not defined.
 *
 *		const wordCountConfig = {
 *			displayCharacters = false
 *		}
 *
 * The mentioned configuration will result in the following container
 *
 *		<div class="ck ck-word-count">
 *			<div class="ck-word-count__words">Words: 4</div>
 *		</div>
 *
 * @member {Boolean} module:wordcount/wordcount~WordCountConfig#displayCharacters
 */

/**
 * This configuration takes a function, which is executed whenever the word-count plugin updates its values.
 * This function is called with one argument, which is an object with `words` and `characters` keys containing
 * a number of detected words and characters in the document.
 *
 *		const wordCountConfig = {
 *			onUpdate: function( values ) {
 *				doSthWithWordNumber( values.words );
 *				doSthWithCharacterNumber( values.characters );
 *			}
 *		}
 *
 * @member {Function} module:wordcount/wordcount~WordCountConfig#onUpdate
 */

/**
 * This option allows on providing an HTML element where
 * {@link module:wordcount/wordcount~WordCount#wordCountContainer word count container} will be appended automatically.
 *
 *		const wordCountConfig = {
 *			container: document.getElementById( 'container-for-word-count' );
 *		}
 *
 * @member {HTMLElement} module:wordcount/wordcount~WordCountConfig#container
 */
