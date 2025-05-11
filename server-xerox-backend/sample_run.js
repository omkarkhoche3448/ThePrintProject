const { print } = require("unix-print");

const fileToPrint = "print-color-test-page-basic-1.pdf";
const printer = "Virtual_PDF_Printer_1";
const options = ["-o landscape", "-o fit-to-page", "-o media=A4"];

print("print-color-test-page-basic-1.pdf", printer, options).then(console.log);