document.addEventListener("DOMContentLoaded", () => {
    const reportData = JSON.parse(sessionStorage.getItem("reportData"));

    if (!reportData) {
        alert("No report data found. Redirecting to report creation.");
        window.location.href = "createreport.html";
        return;
    }

    // Display report data
    document.getElementById("reportPreview").innerHTML = `
        <p><strong>Driver's Name:</strong> ${reportData.driverName}</p>
        <p><strong>Vehicle Number:</strong> ${reportData.vehicleNumber}</p>
        <p><strong>Odometer Reading:</strong> ${reportData.odometerReading}</p>
        <p><strong>Driver's Signature:</strong> ${reportData.driverSignature}</p>
    `;

    // Attach event listener to submit button
    document.getElementById("submitReport").addEventListener("click", async () => {
        console.log("📄 Submit Report clicked");

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text("Driver's Vehicle Inspection Report", 20, 20);
        doc.text(`Driver's Name: ${reportData.driverName}`, 20, 40);
        doc.text(`Vehicle Number: ${reportData.vehicleNumber}`, 20, 50);
        doc.text(`Odometer Reading: ${reportData.odometerReading}`, 20, 60);
        doc.text(`Driver's Signature: ${reportData.driverSignature}`, 20, 70);

        // Convert to Blob
        const pdfBlob = doc.output("blob");

        // ✅ Ensure PDF is correctly formatted as a File before sending
        const pdfFile = new File([pdfBlob], "inspection_report.pdf", { type: "application/pdf" });

        // Retrieve token and check if it exists
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ No authentication token found. User must log in.");
            alert("❌ Authentication error: Please log in again.");
            return;
        }

        console.log("🔑 Token being sent:", token);

        // Upload PDF to the backend
        const formData = new FormData();
        formData.append("pdf", pdfFile);
        formData.append("username", reportData.driverName);
        formData.append("email", localStorage.getItem("email"));
        formData.append("role", localStorage.getItem("role"));

        try {
            console.log("📤 Uploading PDF...");
            const response = await fetch("https://ddheavyhauling.xyz/pdfs/upload/", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Try to parse response as JSON, fallback to text if it's an error page
            let result;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                result = await response.json();
            } else {
                result = await response.text();
                console.error("❌ Server returned unexpected response (not JSON):", result);
                throw new Error("Invalid JSON response from server.");
            }

            console.log(result);

            if (response.ok) {
                alert("✅ PDF successfully uploaded!");
            } else {
                alert("❌ Error uploading PDF: " + (result.error || "Unknown error"));
                console.error("❌ Upload Error:", result);
            }
        } catch (error) {
            console.error("❌ Upload Request Failed:", error);
            alert("❌ Error uploading PDF. Check console for details.");
        }
    });
});