/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module word-count/wordcount
 */

import { type DocumentChangeEvent } from 'ckeditor5/src/engine';
import { Plugin, type Editor } from 'ckeditor5/src/core';
import { Template, View } from 'ckeditor5/src/ui';
import { env } from 'ckeditor5/src/utils';

import { modelElementToPlainText } from './utils';
import type { WordCountConfig } from './wordcountconfig';

import { throttle, isElement } from 'lodash-es';

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
 * ```html
 * <paragraph>foo</paragraph>
 * <paragraph>bar</paragraph>
 * // Words: 2, Characters: 7
 *
 * <paragraph><$text bold="true">foo</$text>bar</paragraph>
 * // Words: 1, Characters: 6
 *
 * <paragraph>*&^%)</paragraph>
 * // Words: 0, Characters: 5
 *
 * <paragraph>foo(bar)</paragraph>
 * //Words: 1, Characters: 8
 *
 * <paragraph>12345</paragraph>
 * // Words: 1, Characters: 5
 * ```
 */
export default class WordCount extends Plugin {
	/**
	 * The number of characters in the editor.
	 *
	 * @observable
	 * @readonly
	 */
	declare public characters: number;

	/**
	 * The number of words in the editor.
	 *
	 * @observable
	 * @readonly
	 */
	declare public words: number;

	/**
	 * The label used to display the words value in the {@link #wordCountContainer output container}.
	 *
	 * @observable
	 * @private
	 * @readonly
	 */
	declare public _wordsLabel: string | undefined;

	/**
	 * The label used to display the characters value in the {@link #wordCountContainer output container}.
	 *
	 * @observable
	 * @private
	 * @readonly
	 */
	declare public _charactersLabel: string | undefined;

	/**
	 * The configuration of this plugin.
	 */
	private _config: WordCountConfig;

	/**
	 * The reference to a {@link module:ui/view~View view object} that contains the self-updating HTML container.
	 */
	private _outputView: View | undefined;

	/**
	 * A regular expression used to recognize words in the editor's content.
	 */
	private readonly _wordsMatchRegExp: RegExp;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this.set( 'characters', 0 );
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

		this.set( '_wordsLabel', undefined );
		this.set( '_charactersLabel', undefined );

		this._config = editor.config.get( 'wordCount' ) || {};

		this._outputView = undefined;

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
	public static get pluginName(): 'WordCount' {
		return 'WordCount';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.model.document.on<DocumentChangeEvent>( 'change:data', throttle( this._refreshStats.bind( this ), 250 ) );

		if ( typeof this._config.onUpdate == 'function' ) {
			this.on<WordCountUpdateEvent>( 'update', ( evt, data ) => {
				this._config.onUpdate!( data );
			} );
		}

		if ( isElement( this._config.container ) ) {
			this._config.container!.appendChild( this.wordCountContainer );
		}
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		if ( this._outputView ) {
			this._outputView.element!.remove();
			this._outputView.destroy();
		}

		super.destroy();
	}

	/**
	 * Creates a self-updating HTML element. Repeated executions return the same element.
	 * The returned element has the following HTML structure:
	 *
	 * ```html
	 * <div class="ck ck-word-count">
	 * 	<div class="ck-word-count__words">Words: 4</div>
	 * 	<div class="ck-word-count__characters">Characters: 28</div>
	 * </div>
	 * ```
	 */
	public get wordCountContainer(): HTMLElement {
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

		return this._outputView.element!;
	}

	/**
	 * Determines the number of characters in the current editor's model.
	 */
	private _getCharacters(): number {
		const txt = modelElementToPlainText( this.editor.model.document.getRoot()! );

		return txt.replace( /\n/g, '' ).length;
	}

	/**
	 * Determines the number of words in the current editor's model.
	 */
	private _getWords(): number {
		const txt = modelElementToPlainText( this.editor.model.document.getRoot()! );
		const detectedWords = txt.match( this._wordsMatchRegExp ) || [];

		return detectedWords.length;
	}

	/**
	 * Determines the number of words and characters in the current editor's model and assigns it to {@link #characters} and {@link #words}.
	 * It also fires the {@link #event:update}.
	 *
	 * @fires update
	 */
	private _refreshStats(): void {
		const words = this.words = this._getWords();
		const characters = this.characters = this._getCharacters();

		this.fire<WordCountUpdateEvent>( 'update', {
			words,
			characters
		} );
	}
}

/**
 * An event fired after {@link ~WordCount#words} and {@link ~WordCount#characters} are updated.
 *
 * @eventName ~WordCount#update
 */
export type WordCountUpdateEvent = {
	name: 'update';
	args: [ { words: number; characters: number } ];
};
