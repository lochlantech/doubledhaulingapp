// Initialize PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];

// URL of the PDF file (replace with the actual path)
const pdfUrl = "example.pdf";  // Change to actual PDF file

// Load the PDF
pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
    console.log(`PDF Loaded with ${pdf.numPages} pages`);
    displayPage(pdf, 1);
}).catch(error => {
    console.error("Error loading PDF:", error);
});

// Display a specific page
function displayPage(pdf, pageNumber) {
    pdf.getPage(pageNumber).then(page => {
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        // Create a canvas element dynamically
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        document.body.appendChild(canvas); // Append to the page

        // Render the page
        const renderContext = { canvasContext: context, viewport: viewport };
        page.render(renderContext);
    });
}