/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module wordcount/wordcount
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { modelElementToPlainText } from './utils';
import { throttle } from 'lodash-es';
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
		 * Property stores number of characters detected by {@link module:wordcount/wordcount~WordCount WordCount plugin}.
		 *
		 * @observable
		 * @readonly
		 * @member {Number} module:wordcount/wordcount~WordCount#characters
		 */
		this.set( 'characters', 0 );

		/**
		 * Property stores number of words detected by {@link module:wordcount/wordcount~WordCount WordCount plugin}.
		 *
		 * @observable
		 * @readonly
		 * @member {Number} module:wordcount/wordcount~WordCount#words
		 */
		this.set( 'words', 0 );

		/**
		 * Keeps reference to {@link module:ui/view~View view object} used to display self-updating HTML container.
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

		editor.model.document.on( 'change', throttle( this._calcWordsAndCharacters.bind( this ), 250 ) );
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
	 * Method creates self-updated HTML element. Repeated executions return the same element.
	 * Returned element has followed HTML structure:
	 *
	 * 		<div class="ck ck-word-count">
	 * 			<div>Words: 4</div>
	 * 			<div>Characters: 28</div>
	 * 		</div>
	 *
	 * @returns {HTMLElement}
	 */
	getWordCountContainer() {
		if ( !this._outputView ) {
			this._outputView = new View();

			const editor = this.editor;
			const t = editor.t;
			const displayWords = editor.config.get( 'wordCount.displayWords' );
			const displayCharacters = editor.config.get( 'wordCount.displayCharacters' );
			const bind = Template.bind( this, this );
			const children = [];

			if ( displayWords || displayWords === undefined ) {
				const wordsLabel = t( 'Words' ) + ':';

				children.push( {
					tag: 'div',
					children: [
						{
							text: [
								wordsLabel,
								bind.to( 'words' )
							]
						}
					]
				} );
			}

			if ( displayCharacters || displayCharacters === undefined ) {
				const charactersLabel = t( 'Characters' ) + ':';

				children.push( {
					tag: 'div',
					children: [
						{
							text: [
								charactersLabel,
								bind.to( 'characters' )
							]
						}
					]
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
	_calcWordsAndCharacters() {
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
 * Event is fired after {@link #words} and {@link #characters} are updated.
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
 * This option allows on hiding the word counter. The element obtained through
 * {@link module:wordcount/wordcount~WordCount#getWordCountContainer} will only preserve
 * the characters part. Word counter is displayed by default when this configuration option is not defined.
 *
 *		const wordCountConfig = {
 *			displayWords = false
 *		}
 *
 * The mentioned configuration will result with the followed container:
 *
 *		<div class="ck ck-word-count">
 *			<div>Characters: 28</div>
 *		</div>
 *
 * @member {Boolean} module:wordcount/wordcount~WordCountConfig#displayWords
 */

/**
 * This option allows on hiding the character counter. The element obtained through
 * {@link module:wordcount/wordcount~WordCount#getWordCountContainer} will only preserve
 * the words part. Character counter is displayed by default when this configuration option is not defined.
 *
 *		const wordCountConfig = {
 *			displayCharacters = false
 *		}
 *
 * The mentioned configuration will result with the followed container:
 *
 *		<div class="ck ck-word-count">
 *			<div>Words: 4</div>
 *		</div>
 *
 * @member {Boolean} module:wordcount/wordcount~WordCountConfig#displayCharacters
 */
