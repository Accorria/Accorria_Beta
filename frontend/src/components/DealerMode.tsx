'use client';

import React, { useState } from 'react';

interface DealerModeProps {
  userTier?: string;
}

export default function DealerMode({ userTier = 'free_trial' }: DealerModeProps) {
  const [dealerId, setDealerId] = useState('toyota_demo');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const isDealerTier = userTier === 'dealer_monthly' || userTier === 'dealer_annual';

  const handleImport = async () => {
    if (!isDealerTier) {
      setImportResult('Dealer Mode is available for dealer subscriptions only. Upgrade to access bulk inventory import.');
      return;
    }

    setIsImporting(true);
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setImportResult(`Successfully imported inventory for dealer: ${dealerId}`);
    } catch (error) {
      setImportResult('Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isDealerTier) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
            <span className="text-2xl">🏢</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Dealer Mode
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Import your entire inventory and let AI generate professional listings for all your vehicles.
          </p>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div>• Bulk CSV import</div>
            <div>• AI-generated descriptions</div>
            <div>• Multi-platform posting</div>
            <div>• Inventory management</div>
          </div>
          <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Upgrade to Dealer Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <span className="text-xl">🏢</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dealer Mode
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Import your inventory and let AI generate professional listings
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="dealerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dealer ID
          </label>
          <input
            type="text"
            id="dealerId"
            value={dealerId}
            onChange={(e) => setDealerId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter dealer ID"
          />
        </div>

        <div>
          <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            CSV File
          </label>
          <input
            type="file"
            id="csvFile"
            accept=".csv"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Upload a CSV file with columns: VIN, Year, Make, Model, Mileage, Price, Title_Status, Description, Photo_URLs
          </p>
        </div>

        <div>
          <button className="text-blue-600 hover:text-blue-800 text-sm underline">
            Download Sample CSV Format
          </button>
        </div>

        <button
          onClick={handleImport}
          disabled={isImporting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isImporting ? 'Importing...' : 'Import Inventory'}
        </button>

        {importResult && (
          <div className={`p-3 rounded-lg text-sm ${
            importResult.includes('Successfully') 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {importResult}
          </div>
        )}
      </div>
    </div>
  );
}
