import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import EllipsisIcon from './icons/ellipsis-icon.svg';

export default class ExtraFormattingUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add('ExtraFormattingDropdown', locale => {
            const dropdownView = createDropdown(locale);
			const items = []

			items.push(editor.ui.componentFactory.create('strikethrough'))
			items.push(editor.ui.componentFactory.create('subscript'))
			items.push(editor.ui.componentFactory.create('superscript'))
			addToolbarToDropdown(dropdownView, items)

			dropdownView.buttonView.set( {
				label: t('Extra Formatting'),
				icon: EllipsisIcon,
				tooltip: true,
			});

			return dropdownView
		});
	}
}
