class LeFormatter {

	// ===== Cache Embedding & LoRA Prompts =====
	static cachedCards = null;

	static cacheCards() {
		this.cachedCards = [];

		const extras = document.getElementById('txt2img_extra_tabs')?.querySelectorAll('span.name');
		if (extras == null)
			return;

		extras.forEach((card) => {
			if (card.textContent.includes('_'))
				this.cachedCards.push(card.textContent);
		});
	}

	// ===== Main Format Logics =====
	static formatPipeline(textArea, dedupe, removeUnderscore, autoRefresh) {
		const lines = textArea.value.split('\n');

		for (let i = 0; i < lines.length; i++)
			lines[i] = LeFormatter.formatString(lines[i], dedupe, removeUnderscore);

		textArea.value = lines.join('\n');

		if (autoRefresh)
			updateInput(textArea);
	}

	static removeUnderscoreSmart(remove, tag) {
		if (!remove)
			return tag;

		if (this.cachedCards == null)
			this.cacheCards();

		// [start:end:step] OR <lora:name:str>
		const chucks = tag.split(':').map(c => c.trim());

		for (let i = 0; i < chucks.length; i++) {
			if (!this.cachedCards.includes(chucks[i]))
				chucks[i] = chucks[i].replace(/_/g, ' ');
		}

		return chucks.join(':');
	}

	static formatString(input, dedupe, removeUnderscore) {
		// Remove Duplicate
		if (dedupe) {
			const temp = input.split(',');

			const cleanArray = [];
			const finalArray = [];

			temp.forEach((tag) => {
				const cleanedTag = tag.replace(/\[|\]|\(|\)|\s+/g, '').trim();

				if (/^(AND|BREAK)$/.test(cleanedTag)) {
					finalArray.push(cleanedTag);
					return;
				}

				if (!cleanArray.includes(cleanedTag)) {
					cleanArray.push(cleanedTag);
					finalArray.push(tag);
					return;
				}

				finalArray.push(tag.replace(cleanedTag, ''));
			});

			input = finalArray.join(', ');
		}

		// Fix Bracket & Comma
		input = input.replace(/,\s*\)/g, '),').replace(/,\s*\]/g, '],').replace(/\(\s*,/g, ',(').replace(/\[\s*,/g, ',[');

		// Remove Commas
		let tags = input.split(',').map(word => this.removeUnderscoreSmart(removeUnderscore, word.trim())).filter(word => word !== '');

		// Remove Stray Brackets
		const patterns = [/^\(+$/, /^\)+$/, /^\[+$/, /^\]+$/];
		tags = tags.filter(word => !patterns[0].test(word)).filter(word => !patterns[1].test(word)).filter(word => !patterns[2].test(word)).filter(word => !patterns[3].test(word));

		// Remove Spaces
		input = tags.join(', ').replace(/\s+/g, ' ');

		// Fix Bracket & Space
		input = input.replace(/\s+\)/g, ')').replace(/\s+\]/g, ']').replace(/\(\s+/g, '(').replace(/\[\s+/g, '[');

		// Fix Empty Bracket
		input = input.replace(/\(\s+\)/g, '').replace(/\[\s+\]/g, '');

		// Remove Empty Brackets
		while (input.match(/\(\s*\)|\[\s*\]/g))
			input = input.replace(/\(\s*\)|\[\s*\]/g, '');

		return input.split(',').map(word => word.trim()).filter(word => word !== '').join(', ');
	}

	// ===== Load Settings =====
	/** @returns {boolean} */
	static shouldRefresh() {
		const config = gradioApp().getElementById('setting_pf_disableupdateinput').querySelector('input[type=checkbox]');
		return !config.checked;
	}

	/** @returns {boolean} */
	static defaultAuto() {
		const config = gradioApp().getElementById('setting_pf_startinauto').querySelector('input[type=checkbox]');
		return config.checked;
	}

	/** @returns {boolean} */
	static defaultDedupe() {
		const config = gradioApp().getElementById('setting_pf_startwithdedupe').querySelector('input[type=checkbox]');
		return config.checked;
	}

	/** @returns {boolean} */
	static defaultRemoveUnderscore() {
		const config = gradioApp().getElementById('setting_pf_startwithrmudscr').querySelector('input[type=checkbox]');
		return config.checked;
	}

	// ===== Cache All Prompt Fields =====
	/** @returns {Array<Element>} */
	static getPromptFields() {
		const textareas = [];

		// Expandable ID List in 1 place
		[
			'txt2img_prompt',
			'txt2img_neg_prompt',
			'img2img_prompt',
			'img2img_neg_prompt',
			'hires_prompt',
			'hires_neg_prompt'
		].forEach((id) => {
			const textArea = gradioApp().getElementById(id)?.querySelector('textarea');
			if (textArea != null)
				textareas.push(textArea);
		});

		return textareas;
	}
}

onUiLoaded(async () => {
	const promptFields = LeFormatter.getPromptFields();
	const refresh = LeFormatter.shouldRefresh();

	var autoRun = LeFormatter.defaultAuto();
	var dedupe = LeFormatter.defaultDedupe();
	var removeUnderscore = LeFormatter.defaultRemoveUnderscore();

	document.addEventListener('keydown', (e) => {
		if (e.altKey && e.shiftKey && e.code === 'KeyF') {
			e.preventDefault();
			promptFields.forEach((field) => LeFormatter.formatPipeline(field, dedupe, removeUnderscore, true));
		}
	});

	const formatter = LeFormatterUI.setupUIs(
		() => {
			promptFields.forEach((field) => LeFormatter.formatPipeline(field, dedupe, removeUnderscore, true));
		},
		autoRun, dedupe, removeUnderscore
	);

	formatter.checkboxs[0].addEventListener("change", (e) => {
		autoRun = e.target.checked;
		formatter.btn.style.display = autoRun ? 'none' : 'flex';
	});

	formatter.checkboxs[1].addEventListener("change", (e) => {
		dedupe = e.target.checked;
	});

	formatter.checkboxs[2].addEventListener("change", (e) => {
		removeUnderscore = e.target.checked;
	});

	const tools = document.getElementById('quicksettings');
	tools.after(formatter);

	['txt', 'img'].forEach((mode) => {
		const generateButton = gradioApp().getElementById(`${mode}2img_generate`);
		const enqueueButton = gradioApp().getElementById(`${mode}2img_enqueue`);

		generateButton?.addEventListener('click', () => {
			if (autoRun)
				promptFields.forEach((field) => LeFormatter.formatPipeline(field, dedupe, removeUnderscore, refresh));
		});

		enqueueButton?.addEventListener('click', () => {
			if (autoRun)
				promptFields.forEach((field) => LeFormatter.formatPipeline(field, dedupe, removeUnderscore, refresh));
		});
	});
});
