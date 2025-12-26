import { Menu, Transition } from "@headlessui/react";
import PlainButton from "../shared/plainbutton";
import { Fragment } from "react";
import Link from "next/link";

export default function PanelMenu({
  menuItems,
}: {
  menuItems: { href?: string; text: string; onClick?: () => void }[];
}) {
  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button>
            <PlainButton noPadding>
              <div className="px-4 w-10 flex justify-center items-center">▼</div>
            </PlainButton>
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="z-20 absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-hidden text-left">
            <div className="px-1 py-1 ">
              {menuItems.map((item, i) =>
                item.href ? (
                  <Menu.Item key={i}>
                    {({ active }) => (
                      <Link
                        href={item.href ?? ""}
                        target="_blank"
                        prefetch={false}
                        className={`${
                          active ? "bg-blue-700 text-white" : "text-gray-900  dark:text-gray-200"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm no-underline text-left`}
                      >
                        {item.text}
                      </Link>
                    )}
                  </Menu.Item>
                ) : (
                  <Menu.Item key={i}>
                    {({ active }) => (
                      <button
                        onClick={item.onClick}
                        className={`${
                          active ? "bg-blue-700 text-white" : "text-gray-900  dark:text-gray-200"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm text-left`}
                      >
                        {item.text}
                      </button>
                    )}
                  </Menu.Item>
                )
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
}
