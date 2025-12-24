import { Dialog } from "@headlessui/react";

export default function BaseDialog({
  isOpen,
  onClose,
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-xs rounded bg-white dark:bg-gray-800 p-4">
          <Dialog.Title className="text-xl">{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
          <hr className="dark:border-gray-600 pb-3" />
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
