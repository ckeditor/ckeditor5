import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertTabCommand extends Command {
	execute() {
		this.editor.model.change(writer => {
			this.editor.model.insertContent(createTab(writer));
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), 'tab');

		this.isEnabled = allowedIn !== null;
	}
}

function createTab(writer) {
	const docFrag = writer.createDocumentFragment();
	// CREATE TAB
	const tab = writer.createElement('tab');
	writer.setAttribute("data-controller", "editor--toggle-element", tab);

	const tabTitle = writer.createElement('tabTitle');
	writer.insertText("Tab Title", tabTitle);

	const tabBody = writer.createElement('tabBody');
	writer.setAttribute("data-editor--toggle-element-target", "body", tabBody);
	const tabBodyContent = writer.createElement('paragraph');
	writer.insertText("Tab Body", tabBodyContent);
	writer.append(tabBodyContent, tabBody);

	const tabToggle = writer.createElement('tabToggle');
	const tabDelete = writer.createElement('tabDelete');

	writer.append(tabTitle, tab);
	writer.append(tabBody, tab);
	writer.append(tabToggle, tab);
	writer.append(tabDelete, tab);

	// CREATE EMPTY PARAGRAPH
	const emptyParagraph = writer.createElement("paragraph")

	writer.append(tab, docFrag);
	writer.append(emptyParagraph, docFrag);

	return docFrag;
}
