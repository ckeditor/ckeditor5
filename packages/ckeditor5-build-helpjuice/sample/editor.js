function createDecisionTreeButton(writer, id) {
	const decisionTreeButton = writer.createElement("decisionTreeButton");
	const decisionTreeButtonText = writer.createElement("decisionTreeButtonText");
	const decisionTreeButtonTextContent = writer.createElement("paragraph");
	const decisionTreeDeleteButton = writer.createElement("decisionTreeDeleteButton");

	writer.insertText("Button Text", decisionTreeButtonTextContent);
	writer.append(decisionTreeButtonTextContent, decisionTreeButtonText);
	writer.append(decisionTreeButtonText, decisionTreeButton);
	writer.append(decisionTreeDeleteButton, decisionTreeButton);
	return decisionTreeButton;
}

function createDecisionTreeTabContent(writer, id) {
	const decisionTreeTabContent = writer.createElement("decisionTreeTabContent");
	const decisionTreeTabContentInner = writer.createElement("decisionTreeTabContentInner");
	const decisionTreeTabContentParagraph = writer.createElement("paragraph");

	writer.setAttributes({
		"id": id,
		"data-active": "inactive"
	}, decisionTreeTabContent);

	writer.insertText("This content will be shown (depending on) when button above is clicked", decisionTreeTabContentParagraph);
	writer.append(decisionTreeTabContentParagraph, decisionTreeTabContentInner);
	writer.append(decisionTreeTabContentInner, decisionTreeTabContent);
	return decisionTreeTabContent;
}

function findAllEditorTextNodes(writer, root) {
	const nodes = [];
	const range = writer.createRangeIn(root);

	for (const value of range.getWalker({ ignoreElementEnd: true })) {
		const node = value.item;
		if (node.textNode) {
			nodes.push(node);
		}
	}

	return nodes;
};

const findNodes = function(writer, type, root) {
	const nodes = [];
	const range = writer.createRangeIn(root);

	for (const value of range.getWalker()) {
		const node = value.item;

		if (node.name == type ) {
			nodes.push(node);
		}
	}

	return nodes;
};

HelpjuiceEditor
	.create(document.querySelector('#helpjuice-editor'))
	.then(editor => {
		const viewDocument = editor.editing.view.document;
		window.editor = editor;
		CKEditorInspector.attach(editor);

		editor.listenTo( viewDocument, 'click', (event, data) => {
			const modelElement = editor.editing.mapper.toModelElement(data.target);

			// DECISION TREE
			if (modelElement.name == "decisionTreeAddTabButton") {
				editor.model.change(writer => {
					const id = Math.random().toString(16).slice(2);
					// CREATE BUTTON
					const decisionTreeButton = createDecisionTreeButton(writer, id);
					writer.setAttributes({
						"data-id": id,
						"data-active": "inactive"
					}, decisionTreeButton);
					writer.append(decisionTreeButton, writer.createPositionBefore(modelElement));

					// CREATE TAB CONTENT
					const decisionTreeTabContent = createDecisionTreeTabContent(writer, id);
					writer.setAttributes({
						"id": id,
						"data-active": "inactive"
					}, decisionTreeTabContent);
					writer.append(decisionTreeTabContent, modelElement.parent.parent);
				})
			}

			// DECISION TREE BUTTON ACTIVE CLASS
			if (modelElement.parent.name == "decisionTreeButtonText") {
				editor.model.change(writer => {
					const button = modelElement.parent.parent;
					const buttonId = button.getAttribute("data-id");
					const allButtons = Array.from(button.parent._children._nodes.filter(node => node.name == "decisionTreeButton" && node != button));

					const allContentElements = button.parent.parent._children._nodes.filter(child => child.name == "decisionTreeTabContent")

					writer.setAttribute("data-active", "active", button);

					allContentElements.forEach(element => {
						for (const [key, value] of element._attrs.entries()) {
							if (key == "id") {
								if (value === buttonId) {
									writer.setAttribute("data-active", "active", element);
								} else {
									writer.setAttribute("data-active", "inactive", element);
								}
							}
						}
					})

					for (const btn of allButtons) {
						writer.setAttribute("data-active", "inactive", btn);
					}
				})
			}

			// DECISION TREE DELETE BUTTON
			if (modelElement.name == "decisionTreeDeleteButton") {
				editor.model.change(writer => {
					const buttonDataId = modelElement.parent.getAttribute("data-id");
					const buttonDataActive = modelElement.parent.getAttribute("data-active");
					const buttons = modelElement.parent.parent._children._nodes.filter(node => node.name == "decisionTreeButton");
					const tabNav = modelElement.parent.parent;

					if (buttons.length > 1) {
						// REMOVE BUTTON AND CONTENT
						modelElement.parent.parent.parent._children._nodes.forEach(el => {
							for (const [key, value] of Array.from(el._attrs.entries())) {
								if (key === 'id' && value === buttonDataId) {
									writer.remove(modelElement.parent);
									writer.remove(el);
								}
							}
						})
						// IF ACTIVE BUTTON IS DELETED, SET ACTIVE CLASS TO FIRST BUTTON
						if (buttonDataActive == "active") {
							const firstBtn = tabNav._children._nodes.filter(node => node.name == "decisionTreeButton")[0];
							// SET ACTIVE CLASS TO BUTTON
							writer.setAttribute("data-active", "active", firstBtn);
							// SET ACTIVE CLASS TO BUTTON CONTENT
							tabNav.parent._children._nodes.forEach(el => {
								for (const [key, value] of Array.from(el._attrs.entries())) {
									if (key === 'id' && value === firstBtn.getAttribute("data-id")) {
										writer.setAttribute("data-active", "active", el);
									}
								}
							})
						}
					} else {
						const topElement = modelElement.parent.parent.parent.parent;

						if (topElement.name == "decisionTree") {
							writer.remove(topElement)
						} else {
							writer.remove(modelElement.parent.parent.parent);
						}
					}
				})
			}

			// ADD NEW TREE TO ACTIVE CONTENT UNLESS IS NOT ALREADY ADDED
			if (modelElement.name == "decisionTreeAddAnswers") {
				const id = Math.random().toString(16).slice(2);
				const activeContent = modelElement.parent._children._nodes.filter(node => node.getAttribute("data-active") == "active");
				editor.model.change(writer => {
					if (activeContent[0]._children._nodes.filter(node => node.name == "decisionTreeTabs").length > 0) {
						return
					} else {
						const decisionTreeTabs = writer.createElement("decisionTreeTabs");
						const decisionTreeTabNav = writer.createElement("decisionTreeTabNav");
						writer.append(decisionTreeTabNav, decisionTreeTabs);

						// CREATE BUTTON
						const decisionTreeButton = createDecisionTreeButton(writer, id);
						writer.setAttributes({
							"data-id": id,
							"data-active": "active"
						}, decisionTreeButton);
						writer.append(decisionTreeButton, decisionTreeTabNav);

						// CREATE ADD BUTTON
						const decisionTreeAddTabButton = writer.createElement("decisionTreeAddTabButton");
						writer.append(decisionTreeAddTabButton, decisionTreeTabNav);


						// CREATE CONTENT
						const decisionTreeTabContent = createDecisionTreeTabContent(writer, id);
						writer.setAttributes({
							"id": id,
							"data-active": "active"
						}, decisionTreeTabContent);
						writer.append(decisionTreeTabContent, decisionTreeTabs);

						// ADD NEW TREE BUTTON
						const decisionTreeAddAnswers = writer.createElement("decisionTreeAddAnswers");
						writer.append(decisionTreeAddAnswers, decisionTreeTabs);

						writer.append(decisionTreeTabs, activeContent[0]);
					}
				})
			}

			// DELETE CUSTOM ELEMENTS
			if (modelElement.name == "accordionDelete"
				|| modelElement.name == "tabDelete"
				|| modelElement.name == "infoDelete"
				|| modelElement.name == "successDelete"
				|| modelElement.name == "warningDelete"
				|| modelElement.name == "dangerDelete") {
				editor.model.change(writer => {
					writer.remove(modelElement.parent);
				})
			}
		});
	})
	.catch(error => {
		console.error( 'There was a problem initializing the editor.', error);
	});
