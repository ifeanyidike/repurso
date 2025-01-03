import React, { useState, useRef, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";

type Font = Record<"label" | "value", string> & { isTailwind?: boolean };

interface FontDropdownProps {
  font: string;
  cb: (value: string) => void;
}

const fonts = [
  "Abel",
  "Abril Fatface",
  "Alex Brush",
  "Allan",
  "Amatic SC",
  "Anton",
  "Asap",
  "Assistant",
  "Avocado",
  "Bai Jamjuree",
  "Bangers",
  "Barlow",
  "Bebas Neue",
  "Be Vietnam",
  "Bitter",
  "Blinker",
  "Cabin",
  "Catamaran",
  "Chakra Petch",
  "Charmonman",
  "Chivo",
  "Cinzel",
  "Crimson Pro",
  "Courgette",
  "DM Sans",
  "Dancing Script",
  "Dosis",
  "EB Garamond",
  "Fira Sans",
  "Fjalla One",
  "Fredericka the Great",
  "Gloock",
  "Great Vibes",
  "Gochi Hand",
  "Grand Hotel",
  "Hind Siliguri",
  "IBM Plex Sans",
  "Inconsolata",
  "Indie Flower",
  "Jost",
  "Josefin Sans",
  "Julius Sans One",
  "Kalam",
  "Kanit",
  "Karla",
  "Lato",
  "Libre Baskerville",
  "Libre Franklin",
  "Lobster",
  "Lobster Two",
  "Lora",
  "Manrope",
  "Mada",
  "Merienda",
  "Merriweather",
  "Montserrat",
  "Mukta",
  "Nanum Gothic",
  "Neuton",
  "Noto Sans",
  "Nunito",
  "Nunito Sans",
  "Open Sans",
  "Oswald",
  "Outfit",
  "Pacifico",
  "Patrick Hand",
  "Permanent Marker",
  "Playfair Display",
  "Poppins",
  "Quattrocento",
  "Quicksand",
  "Raleway",
  "Roboto",
  "Roboto Condensed",
  "Roboto Mono",
  "Roboto Slab",
  "Rubik",
  "Righteous",
  "Sacramento",
  "Satisfy",
  "Shadows Into Light",
  "Slabo 13px",
  "Slabo 27px",
  "Source Code Pro",
  "Space Grotesk",
  "Titillium Web",
  "Ubuntu",
  "Work Sans",
  "Zilla Slab",
];

const FontsDropdown: React.FC<FontDropdownProps> = ({ cb, font }) => {
  const [selectedFont, setSelectedFont] = useState<string>(font);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelectedFont(font!);
  }, [font]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div className="relative w-64 ">
      <Listbox
        as="div"
        value={selectedFont}
        onChange={(e) => {
          setSelectedFont(e);
          cb(e);
        }}
      >
        {({ open }) => (
          <>
            <Listbox.Button
              className={`relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                open ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => setIsOpen(!isOpen)}
              onKeyDown={handleKeyDown}
            >
              <span
                style={{
                  fontFamily: selectedFont || "",
                }}
                className={`block truncate ${selectedFont}`}
              >
                {selectedFont}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronUpDownIcon
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Listbox.Options
              ref={dropdownRef}
              className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${
                open ? "block" : "hidden"
              }`}
            >
              {fonts.map((font, idx) => (
                <Listbox.Option
                  key={idx}
                  value={font}
                  className={({ active }) =>
                    `${
                      active ? "text-indigo-600 bg-indigo-100" : "text-gray-900"
                    }
                    cursor-pointer select-none relative py-2 pl-10 pr-4 ${font}`
                  }
                  style={{
                    fontFamily: font,
                  }}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-semibold" : "font-normal"
                        }`}
                      >
                        {font}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <ChevronUpDownIcon
                            className="w-5 h-5 text-indigo-600"
                            aria-hidden="true"
                          />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </>
        )}
      </Listbox>
    </div>
  );
};

export default FontsDropdown;
