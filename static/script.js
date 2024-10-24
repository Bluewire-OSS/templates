function isDocumentReady() {
    return document.readyState === "complete" || document.readyState === "interactive";
}

function onDocumentReady() {
    for (var day = 1; day <= 31; day++) {
        var option = document.createElement('option');
        option.value = day;
        option.text = day;
        daySelect.appendChild(option);
    }

    var currentYear = new Date().getFullYear();
    for (var year = currentYear; year >= 1900; year--) {
        var option = document.createElement('option');
        option.value = year;
        option.text = year;
        yearSelect.appendChild(option);
    }
}

if (isDocumentReady()) {
    onDocumentReady();
} else {
    document.addEventListener("DOMContentLoaded", onDocumentReady);
}