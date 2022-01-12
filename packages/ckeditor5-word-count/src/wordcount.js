/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module word-count/wordcount
 */

import { Plugin } from 'ckeditor5/src/core';
import { View, Template } from 'ckeditor5/src/ui';
import { env } from 'ckeditor5/src/utils';
import { throttle, isElement } from 'lodash-es';
import { modelElementToPlainText } from './utils';

/**
 * The word count plugin.
 *
 * This plugin calculates all words and characters in all {@link module:engine/model/text~Text text nodes} available in the model.
 * It also provides an HTML element that updates its state whenever the editor content is changed.
 *
 * The model's data is first converted to plain text using {@link module:word-count/utils~modelElementToPlainText}.
 * The number of words and characters in your text are determined based on the created plain text. Please keep in mind
 * that every block in the editor is separated with a newline character, which is included in the calculation.
 *
 * Here are some examples of how the word and character calculations are made:
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
 * 		//Words: 1, Characters: 8
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
		 * @member {Number} module:word-count/wordcount~WordCount#characters
		 */
		this.set( 'characters', 0 );

		/**
		 * The number of words in the editor.
		 *
		 * @observable
		 * @readonly
		 * @member {Number} module:word-count/wordcount~WordCount#words
		 */
		this.set( 'words', 0 );

		// Don't wait for the #update event to set the value of the properties but obtain it right away.
		// This way, accessing the properties directly returns precise numbers, e.g. for validation, etc.
		// If not accessed directly, the properties will be refreshed upon #update anyway.
		Object.defineProperties( this, {
			characters: {
				get() {
					return ( this.characters = this._getCharacters() );
				}
			},
			words: {
				get() {
					return ( this.words = this._getWords() );
				}
			}
		} );

		/**
		 * The label used to display the words value in the {@link #wordCountContainer output container}.
		 *
		 * @observable
		 * @private
		 * @readonly
		 * @member {String} module:word-count/wordcount~WordCount#_wordsLabel
		 */
		this.set( '_wordsLabel' );

		/**
		 * The label used to display the characters value in the {@link #wordCountContainer output container}.
		 *
		 * @observable
		 * @private
		 * @readonly
		 * @member {String} module:word-count/wordcount~WordCount#_charactersLabel
		 */
		this.set( '_charactersLabel' );

		/**
		 * The configuration of this plugin.
		 *
		 * @private
		 * @type {Object}
		 */
		this._config = editor.config.get( 'wordCount' ) || {};

		/**
		 * The reference to a {@link module:ui/view~View view object} that contains the self-updating HTML container.
		 *
		 * @private
		 * @readonly
		 * @type {module:ui/view~View}
		 */
		this._outputView = undefined;

		/**
		 * A regular expression used to recognize words in the editor's content.
		 *
		 * @readonly
		 * @private
		 * @type {RegExp}
		 */
		this._wordsMatchRegExp = env.features.isRegExpUnicodePropertySupported ?
			// Usage of regular expression literal cause error during build (ckeditor/ckeditor5-dev#534).
			// Groups:
			// {L} - Any kind of letter from any language.
			// {N} - Any kind of numeric character in any script.
			new RegExp( '([\\p{L}\\p{N}]+\\S?)+', 'gu' ) :
			/([a-zA-Z0-9À-ž]+\S?)+/gu;
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

		editor.model.document.on( 'change:data', throttle( this._refreshStats.bind( this ), 250 ) );

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
		if ( this._outputView ) {
			this._outputView.element.remove();
			this._outputView.destroy();
		}

		super.destroy();
	}

	/**
	 * Creates a self-updating HTML element. Repeated executions return the same element.
	 * The returned element has the following HTML structure:
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
					return t( 'Words: %0', words );
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
					return t( 'Characters: %0', words );
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
	 * Determines the number of characters in the current editor's model.
	 *
	 * @private
	 * @returns {Number}
	 */
	_getCharacters() {
		const txt = modelElementToPlainText( this.editor.model.document.getRoot() );

		return txt.replace( /\n/g, '' ).length;
	}

	/**
	 * Determines the number of words in the current editor's model.
	 *
	 * @private
	 * @returns {Number}
	 */
	_getWords() {
		const txt = modelElementToPlainText( this.editor.model.document.getRoot() );
		const detectedWords = txt.match( this._wordsMatchRegExp ) || [];

		return detectedWords.length;
	}

	/**
	 * Determines the number of words and characters in the current editor's model and assigns it to {@link #characters} and {@link #words}.
	 * It also fires the {@link #event:update}.
	 *
	 * @private
	 * @fires update
	 */
	_refreshStats() {
		const words = this.words = this._getWords();
		const characters = this.characters = this._getCharacters();

		this.fire( 'update', {
			words,
			characters
		} );
	}
}

/**
 * An event fired after {@link #words} and {@link #characters} are updated.
 *
 * @event update
 * @param {Object} data
 * @param {Number} data.words The number of words in the current model.
 * @param {Number} data.characters The number of characters in the current model.
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
 * @interface module:word-count/wordcount~WordCountConfig
 */

/**
 * The configuration of the word count feature.
 * It is introduced by the {@link module:word-count/wordcount~WordCount} feature.
 *
 * Read more in {@link module:word-count/wordcount~WordCountConfig}.
 *
 * @member {module:word-count/wordcount~WordCountConfig} module:core/editor/editorconfig~EditorConfig#wordCount
 */

/**
 * This option allows for hiding the word counter. The element obtained through
 * {@link module:word-count/wordcount~WordCount#wordCountContainer} will only preserve
 * the characters part. Word counter is displayed by default when this configuration option is not defined.
 *
 *		const wordCountConfig = {
 *			displayWords: false
 *		};
 *
 * The configuration above will result in the following container:
 *
 *		<div class="ck ck-word-count">
 *			<div class="ck-word-count__characters">Characters: 28</div>
 *		</div>
 *
 * @member {Boolean} module:word-count/wordcount~WordCountConfig#displayWords
 */

/**
 * This option allows for hiding the character counter. The element obtained through
 * {@link module:word-count/wordcount~WordCount#wordCountContainer} will only preserve
 * the words part. Character counter is displayed by default when this configuration option is not defined.
 *
 *		const wordCountConfig = {
 *			displayCharacters: false
 *		};
 *
 * The configuration above will result in the following container:
 *
 *		<div class="ck ck-word-count">
 *			<div class="ck-word-count__words">Words: 4</div>
 *		</div>
 *
 * @member {Boolean} module:word-count/wordcount~WordCountConfig#displayCharacters
 */

/**
 * This configuration takes a function that is executed whenever the word count plugin updates its values.
 * This function is called with one argument, which is an object with the `words` and `characters` keys containing
 * the number of detected words and characters in the document.
 *
 *		const wordCountConfig = {
 *			onUpdate: function( stats ) {
 *				doSthWithWordNumber( stats.words );
 *				doSthWithCharacterNumber( stats.characters );
 *			}
 *		};
 *
 * @member {Function} module:word-count/wordcount~WordCountConfig#onUpdate
 */

/**
 * Allows for providing the HTML element that the
 * {@link module:word-count/wordcount~WordCount#wordCountContainer word count container} will be appended to automatically.
 *
 *		const wordCountConfig = {
 *			container: document.getElementById( 'container-for-word-count' );
 *		};
 *
 * @member {HTMLElement} module:word-count/wordcount~WordCountConfig#container
 */
