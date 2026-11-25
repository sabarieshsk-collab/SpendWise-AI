import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import Sidebar from './Sidebar'

export const MobileNav = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-full bg-sidebar z-10 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
        <div className="absolute top-4 right-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar onClose={onClose} />
      </div>
    </div>
  )
}

export default MobileNav
