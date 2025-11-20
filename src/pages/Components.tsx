import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Copy, Check, X } from 'lucide-react';
import { allComponents, componentCategories } from '../components/library';

const Components: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Buttons');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleComponentDoubleClick = (code: string) => {
    setSelectedCode(code);
    setIsModalOpen(true);
    setIsCopied(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedCode);
    setIsCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCode('');
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex">
      {/* Left Sidebar */}
      <div className="hidden md:block md:w-64 bg-white dark:bg-slate-900 shadow-lg border-r border-gray-200 dark:border-slate-700 overflow-y-auto fixed left-0 top-16 bottom-0">
        <div className="p-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Components</h2>
          <nav className="space-y-1">
            {componentCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="md:ml-64 flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
        <div className="w-full max-w-full">
          {/* Mobile Category Selector */}
          <div className="md:hidden mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 font-medium"
            >
              {componentCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 break-words">{selectedCategory}</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Double-click any component to view and copy its code
            </p>
          </div>

          {/* Components Grid */}
          <div className="flex flex-wrap gap-4 sm:gap-6 items-start">
            {allComponents[selectedCategory as keyof typeof allComponents].map((component, index) => (
              <div
                key={index}
                onDoubleClick={() => handleComponentDoubleClick(component.code)} // 👈 double-click only
                  onContextMenu={(e) => {        // 👈 right-click
    e.preventDefault();           // prevent default context menu
    handleComponentDoubleClick(component.code);
  }}
                className="rounded-2xl   hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all  overflow-hidden flex-shrink-0 cursor-pointer"
              >
                <div className="relative p-4 flex items-center justify-center min-w-0">
                  {/* Component Display - Allow interactions */}
                  <div className="w-full max-w-full overflow-auto">
                    {component.preview}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-[#1e1e1e] rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-gray-200">Component Code</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyCode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isCopied
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6">
              <pre className="text-sm font-mono text-gray-300 leading-relaxed">
                <code className="language-jsx">{selectedCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Components;
