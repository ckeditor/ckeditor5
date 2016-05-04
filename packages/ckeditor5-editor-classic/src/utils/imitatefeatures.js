/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Model from '/ckeditor5/ui/model.js';
import Button from '/ckeditor5/ui/button/button.js';
import ButtonView from '/ckeditor5/ui/button/buttonview.js';

/**
 * Immitates that some features were loaded and did their job.
 *
 * @param {ckeditor5.Editor} editor
 */
export function imitateFeatures( editor ) {
	const t = editor.t;

	const boldModel = new Model( {
		isEnabled: true,
		isOn: false,
		label: t( 'Bold' ),
		icon: 'bold'
	} );

	boldModel.on( 'execute', () => {
		/* global console */
		console.log( 'bold executed' );

		boldModel.isOn = !boldModel.isOn;
	} );

	editor.ui.featureComponents.add( 'bold', Button, ButtonView, boldModel );

	const italicModel = new Model( {
		isEnabled: true,
		isOn: false,
		label: t( 'Italic' ),
		icon: 'italic'
	} );

	italicModel.on( 'execute', () => {
		/* global console */
		console.log( 'italic executed' );

		italicModel.isOn = !italicModel.isOn;
	} );

	editor.ui.featureComponents.add( 'italic', Button, ButtonView, italicModel );

	window.boldModel = boldModel;
	window.italicModel = italicModel;
}

export function imitateDestroyFeatures() {
	delete window.boldModel;
	delete window.italicModel;
}
