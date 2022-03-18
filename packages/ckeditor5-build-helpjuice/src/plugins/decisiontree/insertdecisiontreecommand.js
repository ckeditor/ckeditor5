import Command from "@ckeditor/ckeditor5-core/src/command";

export default class InsertDecisionTreeCommand extends Command {
	execute() {
		this.editor.model.change(writer => {
			this.editor.model.insertContent(createDecisionTree(writer));
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "decisionTree");

		this.isEnabled = allowedIn !== null;
	}
}

function createDecisionTree(writer) {
	const id = Math.random().toString(16).slice(2);
	const decisionTree = writer.createElement("decisionTree");

	// Create First Question and Append it to the Decision Tree Root Element
	const decisionTreeFirstQuestion = writer.createElement("decisionTreeFirstQuestion");
	const decisionTreeFirstQuestionContent = writer.createElement("paragraph");
	writer.insertText("Write your initial question/sentence to troubleshoot", decisionTreeFirstQuestionContent);
	writer.append(decisionTreeFirstQuestionContent, decisionTreeFirstQuestion);

	// Decision Tree Tabs Nav and Content
	const decisionTreeTabs = writer.createElement("decisionTreeTabs");

	// Create Nav and Append it to Decision Tree Tabs
	const decisionTreeTabNav = writer.createElement("decisionTreeTabNav");
	writer.append(decisionTreeTabNav, decisionTreeTabs);

	// Create Button
	const decisionTreeButton = writer.createElement("decisionTreeButton");
	writer.setAttributes({
		"data-id": id,
		"data-active": "active"
	}, decisionTreeButton);

	// Create Button Text
	const decisionTreeButtonText = writer.createElement("decisionTreeButtonText");
	const decisionTreeButtonTextContent = writer.createElement("paragraph")
	writer.insertText("Button Text", decisionTreeButtonTextContent);
	writer.append(decisionTreeButtonTextContent, decisionTreeButtonText);
	writer.append(decisionTreeButtonText, decisionTreeButton);

	// Create Delete Button
	const decisionTreeDeleteButton = writer.createElement("decisionTreeDeleteButton");
	writer.append(decisionTreeDeleteButton, decisionTreeButton);

	// Create Add Tab Button
	const decisionTreeAddTabButton = writer.createElement("decisionTreeAddTabButton");
	writer.insertText("Add Button", decisionTreeAddTabButton);

	writer.append(decisionTreeButton, decisionTreeTabNav);
	writer.append(decisionTreeAddTabButton, decisionTreeTabNav);

	// Create Content
	const decisionTreeTabContent = writer.createElement("decisionTreeTabContent");
	const decisionTreeTabContentParagraph = writer.createElement("paragraph");
	writer.insertText("This content will be shown (depending on) when button above is clicked", decisionTreeTabContentParagraph);

	writer.setAttributes({
		"id": id,
		"data-active": "active"
	}, decisionTreeTabContent)

	writer.append(decisionTreeTabContentParagraph, decisionTreeTabContent);
	writer.append(decisionTreeTabContent, decisionTreeTabs);

	// Create Add Answers Button
	const decisionTreeAddAnswers = writer.createElement("decisionTreeAddAnswers");
	writer.setAttribute("data-active", "active", decisionTreeAddAnswers);
	writer.append(decisionTreeAddAnswers, decisionTreeTabs);

	// // Append All Content into Decision Tree Root Element
	writer.append(decisionTreeFirstQuestion, decisionTree);
	writer.append(decisionTreeTabs, decisionTree);

	return decisionTree;
}
