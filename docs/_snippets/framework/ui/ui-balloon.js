/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, ButtonView, BalloonPanelView */

const balloon = new BalloonPanelView();

const buttonBalloon = new ButtonView();
buttonBalloon.label = 'A balloon panel';
buttonBalloon.withText = true;
buttonBalloon.render();
balloon.render();

balloon.content.add( buttonBalloon );

const positions = BalloonPanelView.defaultPositions;

balloon.pin( {
	target: document.getElementById( 'ui-balloon' ),
	positions: [
		positions.northArrowSouth,
		positions.southArrowNorth
	]
} );
document.getElementById( 'ui-balloon' ).append( balloon.element );

// // --- Contextual Balloon ------------------------------------------------------------

// export default class FormView extends View {
// 	constructor() {
// 		super();
// 		console.log( this.setTemplate );
// 		const input = new LabeledFieldView( this.locale, createLabeledInputText );
// 		input.label = 'Input field';

// 		// --- Labeled input text -------------------------------------------------

// 		const labeledNumberView = new LabeledFieldView( locale, createLabeledInputNumber );
// 		labeledNumberView.label = 'Input field';

// 		// --- Labeled input options -------------------------------------------------

// 		const labeledInputDisabled = new LabeledFieldView( locale, createLabeledInputText );
// 		labeledInputDisabled.value = 'The value of the input';

// 		labeledInputDisabled.label = 'Read-only input field';
// 		labeledInputDisabled.isEnabled = false;

// 		const labeledInputInfo = new LabeledFieldView( locale, createLabeledInputText );

// 		labeledInputInfo.label = 'Input field with info text';
// 		labeledInputInfo.infoText = 'Info text goes here.';

// 		const labeledInputError = new LabeledFieldView( locale, createLabeledInputText );

// 		labeledInputError.label = 'Input field with error text';
// 		labeledInputError.errorText = 'Error text goes here.';

// 		const button = new ButtonView();
// 		button.set( {
// 			label: 'Close the balloon',
// 			icon: cancelIcon,
// 			withText: true,
// 			tooltip: true,
// 			class: 'ck-button-cancel'
// 		} );

// 		const childViews = [
// 			input, button, labeledInputDisabled, labeledNumberView, labeledInputError, labeledInputInfo
// 		];

// 		this.setTemplate( {
// 			tag: 'form',
// 			attributes: {
// 				class: [ 'ck' ],
// 				tabindex: '-1',
// 				style: {
// 					padding: '15px'
// 				}
// 			},
// 			children: childViews
// 		} );
// 	}

// 	render() {
// 		super.render();
// 	}
// }

