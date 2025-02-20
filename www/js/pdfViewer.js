// Initialize PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];

// Fetch and list available PDFs from the backend
async function fetchAndListPDFs() {
    try {
        const response = await fetch("https://ddheavyhauling.xyz/pdfs", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) throw new Error("Failed to fetch PDFs");

        const pdfReports = await response.json();
        const pdfTableBody = document.querySelector("#pdfReportsTable tbody");

        pdfTableBody.innerHTML = ""; // Clear table before populating

        pdfReports.forEach(report => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${report.username}</td>
                <td><a href="${report.fileUrl}" target="_blank">${report.fileUrl.split('/').pop()}</a></td>
                <td>${new Date(report.createdAt).toLocaleString()}</td>
            `;
            pdfTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Fetch PDFs Error:", error);
    }
}

// Load and render a selected PDF
async function loadAndRenderPDF(pdfUrl) {
    try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        console.log(`PDF Loaded with ${pdf.numPages} pages`);
        displayPage(pdf, 1);
    } catch (error) {
        console.error("Error loading PDF:", error);
    }
}

// Display a specific PDF page
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

// Run fetchAndListPDFs on page load
document.addEventListener("DOMContentLoaded", fetchAndListPDFs);