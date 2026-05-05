"use client";
import { Mail } from "lucide-react";
import Link from "next/link";
export function EmailVerificationBanner() {
  //   const [isVisible, setIsVisible] = useState(true);

  //   const handleClose = () => {
  //     setIsVisible(false);
  //     // if (onClose) onClose();
  //   };

  //   if (!isVisible) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center flex-wrap justify-between gap-4">
          <div className="flex items-center gap-3 min-w-[200px] flex-1">
            <div className="shrink-0">
              <Mail className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900">
                Please verify your email address
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                Check your inbox for a verification link to access all features.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/verify-email"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
              Verify Email
            </Link>
            {/* <button
              onClick={handleClose}
              className="inline-flex items-center p-1.5 rounded-md text-amber-600 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
