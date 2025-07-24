import { MessageSquare } from "lucide-react";

export default function ChatHeader() {
  return (
    <header className="bg-white dark:bg-card border-b-2 border-primary px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-0">
          {/* PartSelect Official Logo */}
          <div className="flex flex-col items-start">
            <div className="text-black dark:text-white font-bold text-2xl tracking-tight">
              PartSelect
            </div>
            <div className="bg-primary text-white px-2 py-1 text-xs font-medium -mt-1">
              Here to help since 1999
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Parts Specialist - Refrigerator & Dishwasher Support
          </div>
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Available</span>
          </div>
        </div>
      </div>
    </header>
  );
}
