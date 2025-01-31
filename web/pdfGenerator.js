export function generatePDF(reportData, logoImageElement) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Ensure the image is loaded before drawing it to the canvas
    if (!logoImageElement.complete || logoImageElement.naturalWidth === 0) {
        console.error("Logo image not fully loaded.");
        alert("Error: Logo image is not available.");
        return;
    }

    // Convert the image to a Base64 Data URL
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions equal to the image dimensions
    canvas.width = logoImageElement.naturalWidth;
    canvas.height = logoImageElement.naturalHeight;
    ctx.drawImage(logoImageElement, 0, 0);

    // Convert the image to a base64 string
    const logoBase64 = canvas.toDataURL("image/png");

    // Add the image to the PDF
    doc.addImage(logoBase64, "PNG", 10, 10, 50, 50); // Adjust width & height as needed

    // Add the title
    doc.setFontSize(16);
    doc.text("Driver's Vehicle Inspection Report", 10, 70);

    // Add report details
    doc.setFontSize(12);
    doc.text(`Driver's Name: ${reportData.driverName}`, 10, 80);
    doc.text(`Vehicle Number: ${reportData.vehicleNumber}`, 10, 90);
    doc.text(`Odometer Reading: ${reportData.odometerReading}`, 10, 100);
    doc.text(`Driver's Signature: ${reportData.driverSignature}`, 10, 110);

    // Save the PDF
    doc.save("Inspection_Report.pdf");
}