import React from "react";

/*
  Ensure the selected language (if any) is applied to the document early,
  before React mounts any components. This prevents the initial render from
  falling back to English when a saved language exists.
*/
try {
  if (typeof window !== "undefined") {
    const storedLang = localStorage.getItem("lang");
    if (storedLang && storedLang !== document.documentElement.getAttribute("lang")) {
      document.documentElement.setAttribute("lang", storedLang);
    }
  }
} catch (e) {
  // ignore in non-browser env
}

import AppRoutes from "./routes/AppRoutes.jsx";
import { TaskRecordsProvider } from "./context/TaskRecordsContext";
import { BalanceProvider } from "./context/balanceContext";
import { ProfileProvider } from "./context/profileContext";
import { TransactionProvider } from "./context/transactionContext";
import { ToastProvider } from "./context/ToastContext";
import LanguageSwitcher from "./components/LanguageSwitcher";
import "./index.css";

// LanguageProvider wraps the entire app and handles initI18n + remount on language change
import { LanguageProvider } from "./context/LanguageContext";
// Replaced the previous CurrencyContext with the new SettingsContext that fetches settings from the backend
import { SettingsProvider } from "./context/SettingsContext";

export default function App() {
  // NOTE: initI18n call removed from here — LanguageProvider performs initialization.

  return (
    <SettingsProvider>
      <LanguageProvider>
        <ToastProvider>
          <ProfileProvider>
            <BalanceProvider>
              <TaskRecordsProvider>
                <TransactionProvider>
                  <div className="min-h-screen bg-gray-100">
                    {/* Keep console log if you had it */}
                    {console.log("App initialized")}

                    {/* Global Language Switcher removed as requested */}

                    <AppRoutes />
                  </div>
                </TransactionProvider>
              </TaskRecordsProvider>
            </BalanceProvider>
          </ProfileProvider>
        </ToastProvider>
      </LanguageProvider>
    </SettingsProvider>
  );
}


