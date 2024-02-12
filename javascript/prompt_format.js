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

	// ===== UI Related =====
	static button({ onClick }) {
		const button = document.createElement('button');
		button.id = 'manual-format';
		button.classList.add(['lg', 'secondary', 'gradio-button']);

		button.textContent = 'Format';
		button.style.padding = '2px 8px';
		button.style.borderRadius = '0.2em';
		button.style.border = 'var(--button-border-width) solid var(--button-secondary-border-color)';
		button.style.background = 'var(--button-secondary-background-fill)';

		button.addEventListener('click', onClick);
		return button;
	}

	static checkbox(text, default_value, { onChange }) {
		const label = gradioApp().getElementById('tab_settings').querySelector('input[type=checkbox]').parentNode.cloneNode(true);
		label.removeAttribute('id');

		const checkbox = label.children[0];

		checkbox.checked = default_value;
		checkbox.addEventListener('change', (event) => {
			onChange(event.target.checked);
		});

		const span = label.children[1];
		span.textContent = text;

		label.style.display = 'flex';
		label.style.alignItems = 'center';
		label.style.margin = '2px 8px';
		return label;
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
	static shouldRefresh() {
		const config = gradioApp().getElementById('setting_pf_disableupdateinput').querySelector('input[type=checkbox]');
		return !config.checked;
	}

	static defaultAuto() {
		const config = gradioApp().getElementById('setting_pf_startinauto').querySelector('input[type=checkbox]');
		return config.checked;
	}

	static defaultDedupe() {
		const config = gradioApp().getElementById('setting_pf_startwithdedupe').querySelector('input[type=checkbox]');
		return config.checked;
	}

	static defaultRemoveUnderscore() {
		const config = gradioApp().getElementById('setting_pf_startwithrmudscr').querySelector('input[type=checkbox]');
		return config.checked;
	}

	// ===== Cache All Prompt Fields =====
	static getPromptFields() {
		// Expandable ID List in 1 place
		const ids = ['txt2img_prompt', 'txt2img_neg_prompt', 'img2img_prompt', 'img2img_neg_prompt', 'hires_prompt', 'hires_neg_prompt'];
		const textareas = [];

		ids.forEach((id) => {
			const textArea = gradioApp().getElementById(id)?.querySelector('textarea');
			if (textArea != null)
				textareas.push(textArea);
		});

		return textareas;
	}
}

onUiLoaded(async () => {
	const promptFields = LeFormatter.getPromptFields();

	var autoRun = LeFormatter.defaultAuto();
	var dedupe = LeFormatter.defaultDedupe();
	var removeUnderscore = LeFormatter.defaultRemoveUnderscore();
	const refresh = LeFormatter.shouldRefresh();

	const manualBtn = LeFormatter.button({
		onClick: () => {
			promptFields.forEach((field) => LeFormatter.formatPipeline(field, dedupe, removeUnderscore, true));
		}
	});

	manualBtn.style.display = autoRun ? 'none' : 'block';

	const autoCB = LeFormatter.checkbox('Auto Format', autoRun, {
		onChange: (checked) => {
			autoRun = checked;
			manualBtn.style.display = autoRun ? 'none' : 'block';
		}
	});

	const dedupeCB = LeFormatter.checkbox('Remove Duplicates', dedupe, {
		onChange: (checked) => { dedupe = checked; }
	});

	const underlineCB = LeFormatter.checkbox('Remove Underscores', removeUnderscore, {
		onChange: (checked) => { removeUnderscore = checked; }
	});

	const formatter = document.createElement('div');
	formatter.id = 'le-formatter';
	formatter.style.display = 'flex';
	formatter.style.flex.direction = 'row';

	formatter.appendChild(autoCB);
	formatter.appendChild(manualBtn);
	formatter.appendChild(dedupeCB);
	formatter.appendChild(underlineCB);

	const tools = document.getElementById('quicksettings');
	tools.after(formatter);

	['txt', 'img'].forEach((mode) => {
		gradioApp().getElementById(`${mode}2img_generate`).addEventListener('click', () => {
			if (autoRun)
				promptFields.forEach((field) => LeFormatter.formatPipeline(field, dedupe, removeUnderscore, refresh));
		});
	});
});
