import React from 'react'

const PdfLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
           <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4 shadow-lg">
             <div className="w-12 h-12 border-4 border-t-green-600 border-gray-200 rounded-full animate-spin"></div>
             <p className="text-gray-700 font-medium text-lg">Generating PDF...</p>
             <p className="text-gray-500 text-sm">Please wait while your report is being prepared.</p>
           </div>
         </div>
  )
}

export default PdfLoader