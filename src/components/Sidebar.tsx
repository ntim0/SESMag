'use client';

import { FC } from 'react';
import FeeAvatar from './FeeAvatar';

const Sidebar: FC = () => {
  return (
    <aside className="hidden lg:flex lg:w-64 bg-white border-r border-indigo-200 flex-col p-6 shadow-lg fixed h-screen">
      <div className="mb-8 flex items-center gap-3">
        <FeeAvatar />
        <div>
          <h2 className="text-lg font-bold text-indigo-900">Fee</h2>
          <p className="text-xs text-gray-600">SESMag Agent</p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <h3 className="font-semibold text-indigo-900 text-sm mb-2">Quick Tips</h3>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>✓ Upload SESMag PDFs</li>
            <li>✓ Ask Fee for reviews</li>
            <li>✓ Get persona insights</li>
            <li>✓ Compare documents</li>
          </ul>
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        <p>© 2025 SESMag Agent</p>
      </div>
    </aside>
  );
};

export default Sidebar;
