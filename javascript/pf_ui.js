class pfUI {

	/** @param {string} text @param {string} tip @returns {HTMLButtonElement} */
	static #button(text, tip) {
		const button = document.createElement('button');
		button.classList.add(['lg', 'secondary', 'gradio-button']);
		button.textContent = text;
		if (tip) button.title = tip;
		return button;
	}

	/** @param {boolean} value @param {string} text @returns {HTMLLabelElement} */
	static #checkbox(value, text) {
		const label = document.getElementById('tab_settings').querySelector('input[type=checkbox]').parentNode.cloneNode(true);
		label.classList.add("pf-checkbox");
		label.removeAttribute('id');

		const checkbox = label.children[0];
		checkbox.checked = value;
		const span = label.children[1];
		span.textContent = text;

		return label;
	}

	/**
	 * @param {boolean} autoRun
	 * @param {boolean} dedupe
	 * @param {boolean} removeUnderscore
	 * @returns {HTMLDivElement}
	 */
	static setupUIs(autoRun, dedupe, removeUnderscore) {
		const formatter = document.createElement('div');
		formatter.id = 'le-formatter';

		const manualBtn = this.#button('Format', null);
		manualBtn.style.display = autoRun ? 'none' : 'flex';
		const refreshBtn = this.#button('Reload', 'Reload Cached Cards & Alias');
		refreshBtn.style.display = removeUnderscore ? 'flex' : 'none';

		const autoCB = this.#checkbox(autoRun, 'Auto Format');
		const dedupeCB = this.#checkbox(dedupe, 'Remove Duplicates');
		const underscoreCB = this.#checkbox(removeUnderscore, 'Remove Underscores');

		formatter.appendChild(autoCB);
		formatter.appendChild(manualBtn);
		formatter.appendChild(dedupeCB);
		formatter.appendChild(underscoreCB);
		formatter.appendChild(refreshBtn);

		formatter.manual = manualBtn;
		formatter.refresh = refreshBtn;
		formatter.auto = autoCB.children[0];
		formatter.dedupe = dedupeCB.children[0];
		formatter.underscore = underscoreCB.children[0];

		return formatter;
	}

}
