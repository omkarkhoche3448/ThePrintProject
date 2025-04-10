import cups
import json
from typing import Dict

class PrinterManager:
    def __init__(self):
        self.conn = cups.Connection()

    def get_available_printers(self) -> Dict[str, Dict]:
        """Get all available printers and their attributes."""
        return self.conn.getPrinters()

    def get_printer_capabilities(self, printer_name: str) -> Dict:
        """Get the capabilities (attributes) of a specific printer."""
        return self.conn.getPrinterAttributes(printer_name)

# Usage
printer = PrinterManager()
printers = printer.get_available_printers()

all_printers_info = {}

for name, info in printers.items():
    printer_info = {
        "basic_info": info,
        "capabilities": printer.get_printer_capabilities(name)
    }
    all_printers_info[name] = printer_info

# Save to JSON file
with open("printers_info.json", "w") as f:
    json.dump(all_printers_info, f, indent=2)

print("Printer info saved to printers_info.json")
