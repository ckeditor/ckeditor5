import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import Command from '@ckeditor/ckeditor5-core/src/command';

import ckeditor5Icon from '../theme/icons/c1d1f3dc04fe71d56a88f4cdb56291b3.svg';

/* global speechSynthesis, SpeechSynthesisUtterance */

export default class TextToSpeech extends Plugin {
	static get pluginName() {
		return 'TextToSpeech';
	}

	init() {
		const editor = this.editor;
		const t = editor.t;

		const command = new TextToSpeechCommand( editor );
		editor.commands.add( 'textToSpeech', command );

		editor.config.define( 'textToSpeech.rate', 1 );
		editor.config.define( 'textToSpeech.pitch', 1 );

		// Add the "myPlugin" button to feature components.
		editor.ui.componentFactory.add( 'textToSpeech', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Text to speech' ),
				icon: ckeditor5Icon,
				tooltip: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			view.isEnabled = false;

			// Execute the command.
			this.listenTo( view, 'execute', () => {
				editor.execute( 'textToSpeech' );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}

class TextToSpeechCommand extends Command {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		// It does not affect data so should be enabled in read-only mode.
		this.affectsData = false;
		this.isEnabled = false;
		this.value = false;

		speechSynthesis.addEventListener( 'voiceschanged', () => {
			this.isEnabled = true;
		} );

		this._currentUtterance = null;
	}

	refresh() {}

	/**
	 * @inheritDoc
	 */
	execute() {
		if ( this.value ) {
			this.value = false;

			speechSynthesis.cancel();

			return;
		}

		this.value = true;

		const model = this.editor.model;
		const selection = model.document.selection;

		let range;

		if ( selection.isCollapsed ) {
			range = model.createRangeIn( model.document.getRoot() );
		} else {
			range = model.createRange( selection.getFirstPosition(), selection.getLastPosition() );
		}

		const text = rangeToText( range );
		this._currentUtterance = new SpeechSynthesisUtterance( text );

		const voice = this._getVoice();

		if ( voice ) {
			this._currentUtterance.voice = voice;
		}

		this._currentUtterance.rate = this.editor.config.get( 'textToSpeech.rate' );
		this._currentUtterance.pitch = this.editor.config.get( 'textToSpeech.pitch' );
		// this._currentUtterance.volume = 1;
		this._currentUtterance.addEventListener( 'end', () => {
			this.value = false;
		} );

		speechSynthesis.speak( this._currentUtterance );
	}

	_getVoice() {
		const voices = speechSynthesis.getVoices();
		const lang = this.editor.locale.contentLanguage;

		for ( const voice of voices ) {
			if ( voice.lang.startsWith( lang ) ) {
				return voice;
			}
		}

		return null;
	}
}

function rangeToText( range ) {
	return Array.from( range.getItems() ).reduce( ( rangeText, node ) => {
		// Trim text to a last occurrence of an inline element and update range start.
		if ( !( node.is( 'text' ) || node.is( 'textProxy' ) ) ) {
			// Editor has only one inline element defined in schema: `<softBreak>` which is treated as new line character in blocks.
			// Special handling might be needed for other inline elements (inline widgets).
			return rangeText + '. ';
		}

		return rangeText + node.data;
	}, '' );
}
