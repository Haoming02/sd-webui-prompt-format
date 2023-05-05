class LeFormatter {

	static injectButton(id, { onClick }) {
		const button = gradioApp().getElementById(id)
		button.addEventListener('click', onClick)
	}

	static checkbox(text, { onChange }) {
		const label = document.createElement('label')
		label.style.display = 'flex'
		label.style.alignItems = 'center'

		const checkbox = gradioApp().querySelector('input[type=checkbox]').cloneNode()
		checkbox.checked = false
		checkbox.addEventListener('change', (event) => {
			onChange(event.target.checked)
		})

		const span = document.createElement('span')
		span.style.marginLeft = 'var(--size-2, 4px)'
		span.textContent = text

		label.appendChild(checkbox)
		label.appendChild(span)

		return label
	}
}

function fixBrackets(input) {
	return input.replace(' )', ')').replace(' ]', ']').replace('( ', '(').replace('[ ', '[');
}

onUiLoaded(async () => {
	var dedupe = false

	const checkbox = LeFormatter.checkbox('Remove Duplicates', {
		onChange: (checked) => { dedupe = checked }
	})

	const tools = document.getElementById('quicksettings')
	tools.appendChild(checkbox)

	LeFormatter.injectButton('txt2img_generate', {
		onClick: () => {
			const idP = 'txt2img_prompt'
			const textareaP = gradioApp().getElementById(idP).querySelector('textarea')
			const tagsP = textareaP.value.split(',').map(word => word.trim()).filter(word => word !== '');
			const sentenceP = dedupe ? [...new Set(tagsP)].join(', ') : tagsP.join(', ');
			textareaP.value = fixBrackets(sentenceP.replace(/\s+/g, ' ')).trim();
			updateInput(textareaP)

			const idN = 'txt2img_neg_prompt'
			const textareaN = gradioApp().getElementById(idN).querySelector('textarea')
			const tagsN = textareaN.value.split(',').map(word => word.trim()).filter(word => word !== '');
			const sentenceN = dedupe ? [...new Set(tagsN)].join(', ') : tagsN.join(', ');
			textareaN.value = fixBrackets(sentenceN.replace(/\s+/g, ' ')).trim();
			updateInput(textareaN)
		}
	})

	LeFormatter.injectButton('img2img_generate', {
		onClick: () => {
			const idP = 'img2img_prompt'
			const textareaP = gradioApp().getElementById(idP).querySelector('textarea')
			const tagsP = textareaP.value.split(',').map(word => word.trim()).filter(word => word !== '');
			const sentenceP = dedupe ? [...new Set(tagsP)].join(', ') : tagsP.join(', ');
			textareaP.value = fixBrackets(sentenceP.replace(/\s+/g, ' ')).trim();
			updateInput(textareaP)

			const idN = 'img2img_neg_prompt'
			const textareaN = gradioApp().getElementById(idN).querySelector('textarea')
			const tagsN = textareaN.value.split(',').map(word => word.trim()).filter(word => word !== '');
			const sentenceN = dedupe ? [...new Set(tagsN)].join(', ') : tagsN.join(', ');
			textareaN.value = fixBrackets(sentenceN.replace(/\s+/g, ' ')).trim();
			updateInput(textareaN)
		}
	})

})