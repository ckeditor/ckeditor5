
//import { focusDropdownContentsOnArrows } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import ColorpickerInputView from './colorpickerinputview';
import ColorpickerCommand from './colorpickercommand'

import DropdownPanelView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownpanelview';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import DropdownButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/dropdownbuttonview';


import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { FONT_COLOR, renderDowncastElement, renderUpcastAttribute } from '@ckeditor/ckeditor5-font/src/utils';

import fontColorIcon from '@ckeditor/ckeditor5-font/theme/icons/font-color.svg';

export default class ColorPickerUI extends Plugin {

	/**
	 * @inheritDoc
	 */
	constructor(editor) {
		super(editor);

		editor.conversion.for('upcast').elementToAttribute({
			view: {
				name: 'span',
				styles: {
					'color': /[\s\S]+/
				}
			},
			model: {
				key: FONT_COLOR,
				value: renderUpcastAttribute('color')
			}
		});

		// Support legacy `<font color="..">` formatting.
		editor.conversion.for('upcast').elementToAttribute({
			view: {
				name: 'font',
				attributes: {
					'color': /^#?\w+$/
				}
			},
			model: {
				key: FONT_COLOR,
				value: viewElement => viewElement.getAttribute('color')
			}
		});

		editor.conversion.for('downcast').attributeToElement({
			model: FONT_COLOR,
			view: renderDowncastElement('color')
		});

		editor.commands.add(FONT_COLOR, new ColorpickerCommand(editor));

		// Allow the font color attribute on text nodes.
		editor.model.schema.extend('$text', { allowAttributes: FONT_COLOR });

		editor.model.schema.setAttributeProperties(FONT_COLOR, {
			isFormatting: true,
			copyOnEnter: true
		});

	}

	init() {
		console.log('ColorPickerUI#init() got called');

		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add('colorPicker', locale => {
			//const dropdownView = createDropdown(locale);

			const buttonView = new DropdownButtonView(locale);

			const panelView = new DropdownPanelView(locale);
			const dropdownView = new DropdownView(locale, buttonView, panelView);

			buttonView.bind('isEnabled').to(dropdownView);

			if (buttonView instanceof DropdownButtonView) {
				buttonView.bind('isOn').to(dropdownView, 'isOpen');
			} else {
				buttonView.arrowView.bind('isOn').to(dropdownView, 'isOpen');
			}

			// focusDropdownContentsOnArrows( dropdownView );

			dropdownView.buttonView.set({
				// The t() function helps localize the editor. All strings enclosed in t() can be
				// translated and change when the language of the editor changes.
				label: t('Font Color'),
				// withText: true,
				tooltip: true,
				icon: fontColorIcon
			});

			dropdownView.render();

			const inputview = new ColorpickerInputView(locale, {
				columns: 5,
				removeButtonLabel: t('Remove color'),
				documentColorsLabel: t('Document colors'),
				documentColorsCount: 10
			});

			dropdownView.panelView.children.add(inputview);

			inputview.bind('selectedColor').to(editor.commands.get(FONT_COLOR), 'value');

			inputview.on('input', (eventInfo, event) => {
				dropdownView.fire('execute', event);
			});
			
			dropdownView.bind('isEnabled').to(editor.commands.get(FONT_COLOR));

			dropdownView.on('execute', (evt, data) => {
				editor.execute(FONT_COLOR, data);
				//editor.editing.view.focus();
			});

			return dropdownView;
		});
	}

}
