import { Settings, Save } from 'lucide-react';

export default function AIModelsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Model Configuration</h1>
        <p className="mt-1 text-sm text-gray-500">Manage computer vision models and confidence thresholds.</p>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-400" />
            Active Provider
          </h3>
        </div>
        <div className="p-6 space-y-6">
          
          <div>
            <label className="text-base font-medium text-gray-900">Vision Model Provider</label>
            <p className="text-sm leading-5 text-gray-500 mb-4">Select which AI provider is currently serving predictions in production.</p>
            <div className="space-y-4">
              <div className="flex items-center">
                <input id="gemini" name="provider" type="radio" defaultChecked className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300" />
                <label htmlFor="gemini" className="ml-3 block text-sm font-medium text-gray-700">Google Gemini 1.5 Pro Vision</label>
              </div>
              <div className="flex items-center">
                <input id="yolo" name="provider" type="radio" className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300" />
                <label htmlFor="yolo" className="ml-3 block text-sm font-medium text-gray-700">Custom YOLOv11 (Edge)</label>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">Confidence Threshold (%)</label>
            <p className="text-sm leading-5 text-gray-500 mb-2">Predictions below this score will trigger a 'Low Confidence' warning and recommend human KVK officer intervention.</p>
            <input type="range" id="threshold" min="0" max="100" defaultValue="80" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span className="font-bold text-emerald-600">80%</span>
              <span>100%</span>
            </div>
          </div>

        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
