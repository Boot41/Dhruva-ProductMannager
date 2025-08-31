import React from 'react';
import type { DependencyAnalysisOutput } from '../Api/llm'; 

interface LLMSuggestionDialogProps {
  open: boolean;
  onClose: () => void;
  data: DependencyAnalysisOutput | null;
}

const LLMSuggestionDialog: React.FC<LLMSuggestionDialogProps> = ({ open, onClose, data }) => {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold mb-4">LLM Dependency Analysis</h3>
        <div className="mb-2">
          <p><strong>New Feature:</strong> {data.new_feature}</p>
        </div>
        <div className="mb-2">
          <p><strong>Depends On:</strong> {data.depends_on.length > 0 ? data.depends_on.join(', ') : 'No dependencies'}</p>
        </div>
        <div className="mb-4">
          <p><strong>Reasoning:</strong> {data.reasoning}</p>
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LLMSuggestionDialog;
