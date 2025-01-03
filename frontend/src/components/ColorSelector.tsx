// ForegroundColorSelector.tsx
import React, { useEffect, useState } from 'react';

const ColorSelector: React.FC<{
  value: string;
  onChange: (color: string) => void;
}> = ({ onChange, value }) => {
  const [color, setColor] = useState(value);
  const [alpha, setAlpha] = useState(1);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [tempHex, setTempHex] = useState<string>('');

  useEffect(() => {
    setColor(value);
  }, [value]);

  const updateColor = (newColor: string) => {
    setColor(newColor);
    onChange(newColor);
    if (!recentColors.includes(newColor)) {
      setRecentColors([newColor, ...recentColors.slice(0, 4)]);
    }
  };

  const handleAlphaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempHex('');
    const newAlpha = parseFloat(event.target.value);
    setAlpha(newAlpha);
    onChange(
      `${color}${Math.floor(newAlpha * 255)
        .toString(16)
        .padStart(2, '0')}`
    );
  };

  const handleHexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    if (/^#([0-9A-F]{3}){1,2}$/i.test(newColor)) {
      setTempHex('');
      updateColor(newColor);
    } else {
      setTempHex(newColor);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-lg">
      <div className="relative w-48 h-48">
        <div
          className="absolute w-full h-full rounded-full"
          style={{
            backgroundColor: color,
            opacity: alpha,
            border: color?.toLowerCase()?.startsWith('#fff')
              ? '1px solid #ddd'
              : '',
          }}
        />
        <input
          type="color"
          value={color}
          onChange={e => updateColor(e.target.value)}
          className="absolute w-full h-full opacity-0 cursor-pointer rounded-full"
        />
      </div>
      <input
        type="text"
        value={tempHex || color}
        onChange={handleHexChange}
        className={`mt-4 w-full p-2 border rounded transition ${/^#([0-9A-F]{3}){1,2}$/i.test(color) ? 'border-gray-300' : 'border-red-500'}`}
        placeholder="Enter HEX code"
      />
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={alpha}
        onChange={handleAlphaChange}
        className="mt-4 w-full"
      />
      <p className="mt-2 text-sm text-gray-700">
        Alpha: {Math.round(alpha * 100)}%
      </p>
      <div className="mt-4 flex space-x-2">
        {recentColors.map((c, index) => (
          <div
            key={index}
            className="w-10 h-10 border rounded cursor-pointer shadow-md hover:shadow-lg transition-transform transform hover:scale-110"
            style={{ backgroundColor: c }}
            title={c}
            onClick={() => updateColor(c)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;
