import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FilesIcon from './icons/files.svg';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

export default class FilesManagerUI extends Plugin {
	static get pluginName() {
		return 'FilesManager';
	}

	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add('FilesManager', locale => {

			const dropdownView = createDropdown(locale);

			// Configure dropdown's button properties:
			dropdownView.buttonView.set({
				label: t('Files Manager'),
				icon: FilesIcon,
				tooltip: true,
				class: "files-manager-btn"
			});

			dropdownView.render();

			// Create Heading for Panel
			const panelContent = document.createElement("div");
			panelContent.setAttribute("data-controller", "editor--files-manager");

			dropdownView.panelView.element.appendChild(panelContent);

			document.body.appendChild(dropdownView.element);

			return dropdownView;
		});
	}
}
