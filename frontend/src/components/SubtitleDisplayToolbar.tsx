import React from "react";
import { FiEyeOff, FiRefreshCw, FiType, FiXCircle } from "react-icons/fi"; // Icon for timestamps
import { Menu, Transition } from "@headlessui/react";
import { observer } from "mobx-react-lite";
import { stores } from "../store/Stores";
import { property } from "../store/PropertyStore";

const SubtitleDisplayToolbar = observer(() => {
  const subtitleStates = stores.editorStore!.store.subtitleActions;
  return (
    <div className="w-full bg-white shadow-md rounded-md p-4 mb-6 flex items-center justify-between sticky top-0 z-50 overflow-x-auto">
      <div className="flex items-center space-x-6">
        <button
          onClick={() =>
            property.editAllSubtitleElements(
              subtitleStates.fillersHidden ? "show-fillers" : "hide-fillers"
            )
          }
          className="flex items-center space-x-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          {subtitleStates.fillersHidden ? (
            <>
              <FiXCircle className="text-red-500" size={20} />
              <span className="text-xs text-gray-700">Reset Fillers</span>
            </>
          ) : (
            <>
              <FiXCircle className="text-red-500" size={20} />
              <span className="text-xs text-gray-700">Remove Fillers</span>
            </>
          )}
        </button>

        <button
          className={`flex items-center space-x-2 px-2 py-1 rounded-full transition-colors ${
            subtitleStates.periodsHidden
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700"
          } hover:bg-blue-600`}
          onClick={() => {
            property.editAllSubtitleElements(
              subtitleStates.periodsHidden ? "show-periods" : "hide-periods"
            );
          }}
        >
          {subtitleStates.periodsHidden ? (
            <>
              <FiEyeOff className="text-current" size={20} />
              <span className="text-xs">Unhide Periods</span>
            </>
          ) : (
            <>
              <FiEyeOff className="text-current" size={20} />
              <span className="text-xs">Hide Periods</span>
            </>
          )}
        </button>

        {/* Hide Commas */}
        <button
          className={`flex items-center space-x-2 px-2 py-1 rounded-full transition-colors ${
            subtitleStates.commasHidden
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700"
          } hover:bg-blue-600`}
          onClick={() => {
            property.editAllSubtitleElements(
              subtitleStates.commasHidden ? "show-commas" : "hide-commas"
            );
          }}
        >
          {subtitleStates.commasHidden ? (
            <>
              <FiEyeOff className="text-current" size={20} />
              <span className="text-xs">Unhide Commas</span>
            </>
          ) : (
            <>
              <FiEyeOff className="text-current" size={20} />
              <span className="text-xs">Hide Commas</span>
            </>
          )}
        </button>
      </div>

      {/* Right Section: Text Transformations */}
      <div className="flex items-center space-x-6">
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center space-x-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <FiType className="text-gray-700" size={20} />
            <span className="text-xs text-gray-700">Text Transform</span>
          </Menu.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="fixed right-10 mt-2 w-48 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                    } flex justify-between w-full px-2 py-1 text-sm leading-5`}
                    onClick={() => {
                      property.editAllSubtitleElements(
                        subtitleStates.uppercaseTransform
                          ? "reset-transform"
                          : "uppercase"
                      );
                    }}
                  >
                    {subtitleStates.uppercaseTransform
                      ? "Reset uppercase"
                      : "Uppercase"}
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                    } flex justify-between w-full px-2 py-1 text-sm leading-5`}
                    onClick={() => {
                      property.editAllSubtitleElements(
                        subtitleStates.lowercaseTransform
                          ? "reset-transform"
                          : "lowercase"
                      );
                    }}
                  >
                    {subtitleStates.lowercaseTransform
                      ? "Reset lowercase"
                      : "Lowercase"}
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                    } flex justify-between w-full px-2 py-1 text-sm leading-5`}
                    onClick={() => {
                      property.editAllSubtitleElements(
                        subtitleStates.capitalizeTransform
                          ? "reset-transform"
                          : "capitalize"
                      );
                    }}
                  >
                    {subtitleStates.capitalizeTransform
                      ? "Reset Capitalize"
                      : "Capitalize"}
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>

        {/* Reset Button */}
        <button
          onClick={() => property.editAllSubtitleElements("resetAll")}
          className="flex items-center space-x-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <FiRefreshCw className="text-gray-700" size={20} />
          <span className="text-xs text-gray-700">Reset</span>
        </button>
      </div>
    </div>
  );
});

export default SubtitleDisplayToolbar;
