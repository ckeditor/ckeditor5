import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { createDropdown } from 'ckeditor5/src/ui';

import InlineTooltipFormView from './ui/inlinetooltipview';

export default class InlineTooltipUI extends Plugin {
    init() {
        
        const editor = this.editor;
        const t = editor.t;

        editor.ui.componentFactory.add('inlineTooltip', locale => {

            const dropdown = createDropdown( locale );
            const command = editor.commands.get('inlinetooltip');
            const inlineTooltipForm = new InlineTooltipFormView( editor.locale );

			this._setUpDropdown( dropdown, inlineTooltipForm, command );
			this._setUpForm( dropdown, inlineTooltipForm, command );

			return dropdown;

            const view = new ButtonView( locale );

            view.set({
                label: t('Inline tooltip'),
                icon: '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H16L12,22L8,18H4A2,2 0 0,1 2,16V4A2,2 0 0,1 4,2M4,4V16H8.83L12,19.17L15.17,16H20V4H4M6,7H18V9H6V7M6,11H16V13H6V11Z" /></svg>',
                tooltip: true
            });

            view.on( 'execute', () => {
                const imageURL = prompt( 'Image URL' );
            } );


            view.bind('isEnabled').to(command);

            return view;

        });
        
    }


	_setUpDropdown( dropdown, form, command ) {
		const editor = this.editor;
		const t = editor.t;
		const button = dropdown.buttonView;

		dropdown.bind( 'isEnabled' ).to( command );
		dropdown.panelView.children.add( form );

		button.set( {
			label: t( 'Inline tooltip' ),
			icon: '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H16L12,22L8,18H4A2,2 0 0,1 2,16V4A2,2 0 0,1 4,2M4,4V16H8.83L12,19.17L15.17,16H20V4H4M6,7H18V9H6V7M6,11H16V13H6V11Z" /></svg>',
			tooltip: true
		} );

		// Note: Use the low priority to make sure the following listener starts working after the
		// default action of the drop-down is executed (i.e. the panel showed up). Otherwise, the
		// invisible form/input cannot be focused/selected.
		button.on( 'open', () => {
			form.disableCssTransitions();

			// Make sure that each time the panel shows up, the URL field remains in sync with the value of
			// the command. If the user typed in the input, then canceled (`urlInputView#fieldView#value` stays
			// unaltered) and re-opened it without changing the value of the media command (e.g. because they
			// didn't change the selection), they would see the old value instead of the actual value of the
			// command.
			form.text = command.text || '';
			form.tooltip = command.tooltip || '';
			form.textInputView.fieldView.select();
			form.tooltipInputView.fieldView.select();
			form.focus();
			form.enableCssTransitions();
		}, { priority: 'low' } );

		dropdown.on( 'submit', () => {
			if ( form.isValid() ) {
				editor.execute( 'mediaEmbed', form.url );
				closeUI();
			}
		} );

		dropdown.on( 'change:isOpen', () => form.resetFormStatus() );
		dropdown.on( 'cancel', () => closeUI() );

		function closeUI() {
			editor.editing.view.focus();
			dropdown.isOpen = false;
		}
	}


	_setUpForm( dropdown, form, command ) {
		form.delegate( 'submit', 'cancel' ).to( dropdown );
		form.textInputView.bind( 'value' ).to( command, 'text' );
        form.tooltipInputView.bind('value').to( command, 'tooltip');

		// Form elements should be read-only when corresponding commands are disabled.
		form.textInputView.bind( 'isReadOnly' ).to( command, 'isEnabled', value => !value );
	}
}