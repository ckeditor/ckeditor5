/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Model from '/ckeditor5/core/ui/model.js';
import Button from '/ckeditor5/ui/button/button.js';
import ButtonView from '/ckeditor5/ui/button/buttonview.js';

/**
 * Immitates that some features were loaded and did their job.
 *
 * @param {core.Editor} editor
 */
export default function imitateFeatures( editor ) {
	const boldModel = new Model( {
		isEnabled: true,
		isOn: false,
		label: 'bold'
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
		label: 'italic'
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
