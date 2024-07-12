class LeFormatter {

	static #cachedCards = null;

	/** @param {Element} textArea @param {boolean} dedupe @param {boolean} removeUnderscore @param {boolean} autoRefresh */
	static formatPipeline(textArea, dedupe, removeUnderscore, autoRefresh) {
		const lines = textArea.value.split('\n');

		for (let i = 0; i < lines.length; i++)
			lines[i] = this.#formatString(lines[i], dedupe, removeUnderscore);

		textArea.value = lines.join('\n');

		if (autoRefresh)
			updateInput(textArea);
	}

	/** @param {string} input @param {boolean} dedupe @param {boolean} removeUnderscore @returns {string} */
	static #formatString(input, dedupe, removeUnderscore) {
		// Remove Duplicate
		if (dedupe)
			input = this.#dedupe(input);

		// Fix Commas inside Brackets
		input = input
			.replace(/,+\s*\)/g, '),')
			.replace(/,+\s*\]/g, '],')
			.replace(/\(\s*,+/g, ',(')
			.replace(/\[\s*,+/g, ',[');

		// Sentence -> Tags
		var tags = input.split(',');

		// Remove Underscore
		if (removeUnderscore) {
			if (this.#cachedCards == null)
				this.#cachedCards = LeFormatterConfig.cacheCards();
			tags = this.#removeUnderscore(tags);
		}

		// Remove Stray Brackets
		const patterns = /^\(+$|^\)+$|^\[+$|^\]+$/;
		tags = tags.filter(word => !patterns.test(word));

		// Remove extra Spaces
		input = tags.join(', ').replace(/\s{2,}/g, ' ');

		// Fix Bracket & Space
		input = input
			.replace(/\s\)/g, ')')
			.replace(/\s\]/g, ']')
			.replace(/\(\s/g, '(')
			.replace(/\[\s/g, '[');

		// Fix Empty Bracket
		while (input.match(/\(\s*\)|\[\s*\]/g))
			input = input.replace(/\(\s*\)|\[\s*\]/g, '');

		return input.split(',').map(word => word.trim()).filter(word => word).join(', ');
	}

	/** @param {string} input @returns {string} */
	static #dedupe(input) {
		const chunks = input.split(',');

		const uniqueSet = new Set();
		const resultArray = [];
		const KEYWORD = /^(AND|BREAK)$/;

		chunks.forEach((tag) => {
			const cleanedTag = tag.replace(/\[|\]|\(|\)|\s+/g, '').trim();

			if (KEYWORD.test(cleanedTag)) {
				resultArray.push(tag);
				return;
			}

			if (!uniqueSet.has(cleanedTag)) {
				uniqueSet.add(cleanedTag);
				resultArray.push(tag);
				return;
			}

			resultArray.push(tag.replace(cleanedTag, ''));
		});

		return resultArray.join(', ');
	}

	/** @param {Array<string} tags @returns {Array<string} */
	static #removeUnderscore(tags) {
		const result = [];

		tags.forEach((tag) => {
			if (!tag.trim())
				return;

			// [start:end:step] OR <lora:name:str>
			const chucks = tag.split(':').map(c => c.trim());

			for (let i = 0; i < chucks.length; i++) {
				if (!this.#cachedCards.includes(chucks[i]))
					chucks[i] = chucks[i].replace(/_/g, ' ');
			}

			result.push(chucks.join(':').trim());
		});

		return result;
	}
}

onUiLoaded(async () => {

	const config = new LeFormatterConfig();

	document.addEventListener('keydown', (e) => {
		if (e.altKey && e.shiftKey && e.code === 'KeyF') {
			e.preventDefault();
			config.promptFields.forEach((field) => LeFormatter.formatPipeline(field, config.dedupe, config.removeUnderscore, true));
		}
	});

	const formatter = LeFormatterUI.setupUIs(
		() => {
			config.promptFields.forEach((field) => LeFormatter.formatPipeline(field, config.dedupe, config.removeUnderscore, true));
		},
		config.autoRun, config.dedupe, config.removeUnderscore
	);

	formatter.checkboxs[0].addEventListener("change", (e) => {
		config.autoRun = e.target.checked;
		formatter.btn.style.display = config.autoRun ? 'none' : 'flex';
	});

	formatter.checkboxs[1].addEventListener("change", (e) => {
		config.dedupe = e.target.checked;
	});

	formatter.checkboxs[2].addEventListener("change", (e) => {
		config.removeUnderscore = e.target.checked;
	});

	const tools = document.getElementById('quicksettings');
	tools.after(formatter);

	['txt', 'img'].forEach((mode) => {
		const generateButton = gradioApp().getElementById(`${mode}2img_generate`);
		const enqueueButton = gradioApp().getElementById(`${mode}2img_enqueue`);

		generateButton?.addEventListener('click', () => {
			if (config.autoRun)
				config.promptFields.forEach((field) => LeFormatter.formatPipeline(field, config.dedupe, config.removeUnderscore, config.refresh));
		});

		enqueueButton?.addEventListener('click', () => {
			if (config.autoRun)
				config.promptFields.forEach((field) => LeFormatter.formatPipeline(field, config.dedupe, config.removeUnderscore, config.refresh));
		});
	});
});
