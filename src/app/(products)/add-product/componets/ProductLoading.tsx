"use client"
import { Loader2 } from "lucide-react"

export default function LoadingOverlay({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-gray-700 font-medium text-lg">Adding product...</p>
        <p className="text-gray-500 text-sm">Please wait while we upload your product details.</p>
      </div>
    </div>
  )
}
