import React from 'react';
import { 
  ColorMode, 
  PaperSize, 
  PaperType, 
  BindingType, 
  BindingPosition, 
  PrintOptions 
} from '../../types/print';

interface PrintOptionsFormProps {
  options: PrintOptions;
  onChange: (options: PrintOptions) => void;
  isGlobal?: boolean;
  isDarkTheme: boolean;
}

export const PrintOptionsForm: React.FC<PrintOptionsFormProps> = ({
  options,
  onChange,
  isGlobal = false,
  isDarkTheme,
}) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      onChange({
        ...options,
        [parent]: {
          ...options[parent as keyof PrintOptions],
          [child]: value,
        },
      });
    } else if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      onChange({
        ...options,
        [name]: checked,
      });
    } else if (type === 'number') {
      onChange({
        ...options,
        [name]: parseInt(value, 10),
      });
    } else {
      onChange({
        ...options,
        [name]: value,
      });
    }
  };

  const inputClass = isDarkTheme
    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500';

  const labelClass = isDarkTheme ? 'text-gray-300' : 'text-gray-700';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="paperSize" className={`block text-sm font-medium ${labelClass} mb-1`}>
          Paper Size
        </label>
        <select
          id="paperSize"
          name="paperSize"
          value={options.paperSize}
          onChange={handleChange}
          className={`block w-full rounded-md border ${inputClass} p-2.5 text-sm`}
        >
          <option value="A4">A4</option>
          <option value="A3">A3</option>
          <option value="Letter">Letter</option>
          <option value="Legal">Legal</option>
          <option value="Executive">Executive</option>
        </select>
      </div>

      <div>
        <label htmlFor="colorMode" className={`block text-sm font-medium ${labelClass} mb-1`}>
          Color Mode
        </label>
        <select
          id="colorMode"
          name="colorMode"
          value={options.colorMode}
          onChange={handleChange}
          className={`block w-full rounded-md border ${inputClass} p-2.5 text-sm`}
        >
          <option value="BlackAndWhite">Black & White</option>
          <option value="Color">Color</option>
        </select>
      </div>

      <div>
        <label htmlFor="paperType" className={`block text-sm font-medium ${labelClass} mb-1`}>
          Paper Type
        </label>
        <select
          id="paperType"
          name="paperType"
          value={options.paperType}
          onChange={handleChange}
          className={`block w-full rounded-md border ${inputClass} p-2.5 text-sm`}
        >
          <option value="Standard">Standard</option>
          <option value="Glossy">Glossy</option>
          <option value="Recycled">Recycled</option>
          <option value="Cardstock">Cardstock</option>
        </select>
      </div>

      <div>
        <label htmlFor="copies" className={`block text-sm font-medium ${labelClass} mb-1`}>
          Copies
        </label>
        <input
          type="number"
          id="copies"
          name="copies"
          min="1"
          max="100"
          value={options.copies}
          onChange={handleChange}
          className={`block w-full rounded-md border ${inputClass} p-2.5 text-sm`}
        />
      </div>

      <div className="col-span-2">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="doubleSided"
            name="doubleSided"
            checked={options.doubleSided}
            onChange={handleChange}
            className={`w-4 h-4 rounded focus:ring-blue-500 ${
              isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
          <label htmlFor="doubleSided" className={`ml-2 text-sm font-medium ${labelClass}`}>
            Double-sided printing
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="binding.type" className={`block text-sm font-medium ${labelClass} mb-1`}>
          Binding Type
        </label>
        <select
          id="binding.type"
          name="binding.type"
          value={options.binding?.type || 'None'}
          onChange={handleChange}
          className={`block w-full rounded-md border ${inputClass} p-2.5 text-sm`}
        >
          <option value="None">None</option>
          <option value="Staple">Staple</option>
          <option value="Punch">Hole Punch</option>
          <option value="Spiral">Spiral Binding</option>
        </select>
      </div>

      {options.binding?.type && options.binding.type !== 'None' && (
        <div>
          <label htmlFor="binding.position" className={`block text-sm font-medium ${labelClass} mb-1`}>
            Binding Position
          </label>
          <select
            id="binding.position"
            name="binding.position"
            value={options.binding?.position || 'Left'}
            onChange={handleChange}
            className={`block w-full rounded-md border ${inputClass} p-2.5 text-sm`}
          >
            <option value="Left">Left</option>
            <option value="Top">Top</option>
            <option value="Right">Right</option>
            <option value="Bottom">Bottom</option>
          </select>
        </div>
      )}

      <div className="col-span-2">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="priority"
            name="priority"
            checked={options.priority || false}
            onChange={handleChange}
            className={`w-4 h-4 rounded focus:ring-blue-500 ${
              isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
          <label htmlFor="priority" className={`ml-2 text-sm font-medium ${labelClass}`}>
            Priority Printing (additional fee)
          </label>
        </div>
      </div>

      <div className="col-span-2">
        <label htmlFor="additionalInstructions" className={`block text-sm font-medium ${labelClass} mb-1`}>
          Additional Instructions
        </label>
        <textarea
          id="additionalInstructions"
          name="additionalInstructions"
          value={options.additionalInstructions || ''}
          onChange={handleChange}
          rows={3}
          className={`block w-full rounded-md border ${inputClass} p-2.5 text-sm`}
          placeholder="Any special instructions for printing..."
        />
      </div>
    </div>
  );
};