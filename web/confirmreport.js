document.addEventListener("DOMContentLoaded", () => {
    const reportData = JSON.parse(sessionStorage.getItem("reportData"));

    if (!reportData) {
        window.location.href = "createreport.html";
    }

    document.getElementById("reportPreview").innerHTML = `
        <p><strong>Driver's Name:</strong> ${reportData.driverName}</p>
        <p><strong>Vehicle Number:</strong> ${reportData.vehicleNumber}</p>
        <p><strong>Odometer Reading:</strong> ${reportData.odometerReading}</p>
        <p><strong>Driver's Signature:</strong> ${reportData.driverSignature}</p>
    `;

    document.getElementById("submitReport").addEventListener("click", () => {
        generatePDF(reportData);
    });
});

// PDF Generation
function generatePDF(reportData) {
    const { jsPDF } = window.jspdf; // Ensure this points to the global jsPDF object
    const doc = new jsPDF();

    doc.text("Driver's Vehicle Inspection Report", 10, 10);
    doc.text(`Driver's Name: ${reportData.driverName}`, 10, 20);
    doc.text(`Vehicle Number: ${reportData.vehicleNumber}`, 10, 30);
    doc.text(`Odometer Reading: ${reportData.odometerReading}`, 10, 40);
    doc.text(`Driver's Signature: ${reportData.driverSignature}`, 10, 50);

    doc.save("Inspection_Report.pdf");
}