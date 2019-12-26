export const canvas2png = (canvas, filename = "download.png") => {
	canvas.toBlob(blob => {
		const link = document.createElement("a");
		link.download = filename;
		link.href = URL.createObjectURL(blob);
		const event = document.createEvent("MouseEvents");
		event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		link.dispatchEvent(event);
	});
};
