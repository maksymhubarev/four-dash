import React from "react";
import XLSX from "xlsx";

const ExportPage = (props) => {
  const { orders } = props.location.state;

  const exportToExcel = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(orders);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Orders");

    // Export the workbook to Excel file
    XLSX.writeFile(wb, "orders.xlsx");
  };

  return (
    <div className="export-container">
      <h1>Export Orders to Excel</h1>
      <button onClick={exportToExcel}>Export</button>
    </div>
  );
};

export default ExportPage;
