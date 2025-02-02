document.getElementById("inspectionForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const reportData = {
        driverName: document.getElementById("driverName").value,
        vehicleNumber: document.getElementById("vehicleNumber").value,
        odometerReading: document.getElementById("odometerReading").value,
        driverSignature: document.getElementById("driverSignature").value
    };

    sessionStorage.setItem("reportData", JSON.stringify(reportData));
    window.location.href = "confirmdriverreport.html";
});