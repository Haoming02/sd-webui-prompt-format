class pfUI {
	/** @param {string} text @param {string} hint @returns {HTMLButtonElement} */
	static #button(text, hint) {
		const button = document.createElement("button");
		button.classList.add(["lg", "secondary", "gradio-button"]);
		button.textContent = text;
		if (hint) button.title = hint;
		return button;
	}

	/** @param {boolean} value @param {string} text @returns {HTMLLabelElement} */
	static #checkbox(value, text) {
		const label = document.getElementById("pf_checkbox").querySelector("label").cloneNode(true);
		label.classList.add("pf-checkbox");
		label.removeAttribute("id");

		label.children[0].checked = value;
		label.children[1].textContent = text;

		return label;
	}

	/**	@param {boolean} autoRun @param {boolean} dedupe @param {boolean} rmUnderscore @returns {HTMLDivElement} */
	static setupUIs(autoRun, dedupe, rmUnderscore) {
		const formatter = document.createElement("div");
		formatter.id = "le-formatter";

		const autoCB = this.#checkbox(autoRun, "Auto Format");
		const dedupeCB = this.#checkbox(dedupe, "Remove Duplicates");
		const underscoreCB = this.#checkbox(rmUnderscore, "Remove Underscores");

		const manualBtn = this.#button("Format", "Manually Format the Prompts");
		manualBtn.style.display = autoRun ? "none" : "flex";
		const refreshBtn = this.#button("Reload", "Reload Exclusion & Alias");
		refreshBtn.style.display = rmUnderscore ? "flex" : "none";

		formatter.appendChild(autoCB);
		formatter.appendChild(manualBtn);
		formatter.appendChild(dedupeCB);
		formatter.appendChild(underscoreCB);
		formatter.appendChild(refreshBtn);

		formatter.auto = autoCB.children[0];
		formatter.manual = manualBtn;
		formatter.dedupe = dedupeCB.children[0];
		formatter.underscore = underscoreCB.children[0];
		formatter.refresh = refreshBtn;

		return formatter;
	}
}
