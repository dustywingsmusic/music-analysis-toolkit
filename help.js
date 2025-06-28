// This script handles all functionality related to the help modal.

document.addEventListener('DOMContentLoaded', () => {

    const helpLink = document.getElementById('help-link');
    const helpModal = document.getElementById('help-modal');
    const helpModalClose = document.getElementById('help-modal-close');
    const helpContentContainer = document.getElementById('help-content-container');

    // Show the modal when the "Help" link is clicked
    if (helpLink) {
        helpLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the link from navigating
            if (helpModal) {
                helpModal.style.display = 'block';
            }
        });
    }

    // Hide the modal when the close button is clicked
    if (helpModalClose) {
        helpModalClose.addEventListener('click', () => {
            if (helpModal) {
                helpModal.style.display = 'none';
            }
        });
    }

    // Hide the modal if the user clicks on the background overlay
    if (helpModal) {
        helpModal.addEventListener('click', (event) => {
            if (event.target === helpModal) {
                helpModal.style.display = 'none';
            }
        });
    }

    // Fetch and render the content of readme.md
    if (helpContentContainer) {
        fetch('readme.md')
            .then(response => {
                if (!response.ok) {
                    throw new Error('readme.md not found.');
                }
                return response.text();
            })
            .then(text => {
                // A simple markdown to HTML converter
                function simpleMdToHtml(md) {
                    md = md.replace(/^# (.*$)/gim, '<h1>$1</h1>');
                    md = md.replace(/^### (.*$)/gim, '<h3>$1</h3>');
                    md = md.replace(/\*\*(.*)\*\*/gim, '<b>$1</b>');
                    md = md.replace(/^\* (.*$)/gim, '<li>$1</li>');
                    // Handle line breaks within paragraphs
                    md = md.replace(/\n\n/g, '<p></p>').replace(/\n/g, '<br/>');
                    return md;
                }
                helpContentContainer.innerHTML = simpleMdToHtml(text);
            })
            .catch(error => {
                console.error("Error loading help content:", error);
                helpContentContainer.innerHTML = '<p>Error: Could not load help file. Make sure readme.md is in the same folder as index.html.</p>';
            });
    }
});
