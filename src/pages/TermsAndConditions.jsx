import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const START_BLUE = "#1fb6fc";

/**
 * Terms and Conditions page
 *
 * This version calls `applyTranslations()` when the component mounts and
 * re-applies translations when the document `lang` attribute changes or when
 * a `languageChanged` event is dispatched on window.
 *
 * The applyTranslations implementation:
 *  - Prefer using a global translator if available (window.applyTranslations)
 *  - If i18next is present globally, use it to translate each [data-i18n] node
 *  - Fallback: attempt to load `/i18n/<locale>.json` (locale from i18next, localStorage, or <html lang>)
 *
 * The page keeps the existing `data-i18n` attributes so translations work with
 * the same DOM-replacement strategy used in Tasks.jsx.
 */
export default function TermsAndConditions() {
  const navigate = useNavigate();

  // Apply translations to all elements with data-i18n
  async function applyTranslations() {
    try {
      // 1) If the app exposes a dedicated translator function, use it
      if (typeof window.applyTranslations === "function") {
        try {
          window.applyTranslations();
          return;
        } catch (e) {
          // continue to other methods on failure
          console.warn("window.applyTranslations() threw:", e);
        }
      }

      // 2) If i18next is available globally, use it
      if (window.i18next && typeof window.i18next.t === "function") {
        try {
          document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            if (!key) return;
            const translated = window.i18next.t(key);
            // If translation exists (not equal to key), apply it
            if (translated && translated !== key) {
              el.innerHTML = translated;
            }
          });
          return;
        } catch (e) {
          console.warn("i18next-based translation failed:", e);
        }
      }

      // 3) Fallback: fetch locale JSON from /i18n/<locale>.json
      const locale =
        (window.i18next && window.i18next.language) ||
        localStorage.getItem("i18nextLng") ||
        document.documentElement.lang ||
        "en";
      const path = `/i18n/${locale}.json`;
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) {
        // If not found, don't error loudly; just return
        return;
      }
      const json = await res.json();
      if (!json) return;
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (!key) return;
        const val = json[key];
        if (val !== undefined && val !== null) {
          el.innerHTML = val;
        }
      });
    } catch (err) {
      // Keep the console message, but don't break rendering
      console.warn("applyTranslations error:", err);
    }
  }

  useEffect(() => {
    // Run once on mount
    applyTranslations();

    // Re-run when the <html lang> attribute changes (some i18n libs toggle this)
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "lang") {
          applyTranslations();
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });

    // Listen for a custom global event 'languageChanged' (many apps emit similar events)
    const onLangEvent = () => applyTranslations();
    window.addEventListener("languageChanged", onLangEvent);
    window.addEventListener("i18nChanged", onLangEvent);

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener("languageChanged", onLangEvent);
      window.removeEventListener("i18nChanged", onLangEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative bg-white h-screen w-full">
      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 bg-[#2d2d2d] text-white flex items-center justify-between p-4 z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-xl font-bold"
          aria-label="Back"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width={28} height={28} viewBox="0 0 22 22">
            <polyline
              points="14,5 8,11 14,17"
              fill="none"
              stroke={START_BLUE}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="text-base font-semibold" data-i18n="Terms and Conditions">
          Terms and Conditions
        </div>
        <div className="w-6" /> {/* Empty space for alignment */}
      </div>

      {/* Scrollable content below the fixed header */}
      <div className="absolute top-16 bottom-0 left-0 right-0 overflow-y-auto p-4 text-sm">
        <h2 className="font-bold mb-2" data-i18n="I. Starting Optimization Tasks">
          I. Starting Optimization Tasks
        </h2>
        <p>
          <strong data-i18n="Account Restart Requirement">Account Restart Requirement:</strong>{" "}
          <span data-i18n="Accounts need a minimum of 100 USDT to start new optimization tasks. Reset tasks must be processed by contacting Customer Service.">
            Accounts need a minimum of 100 USDT to start new optimization tasks. Reset tasks must be processed by contacting Customer Service.
          </span>
        </p>
        <p>
          <strong data-i18n="Post-Task Withdrawal Protocol">Post-Task Withdrawal Protocol:</strong>{" "}
          <span data-i18n="Users must complete two sets of optimization tasks before withdrawing funds; withdrawals are not permitted mid-task">
            Users must complete two sets of optimization tasks before withdrawing funds; withdrawals are not permitted mid-task
          </span>
        </p>

        <h2 className="font-bold mt-4 mb-2" data-i18n="II. Withdrawal Policies">
          II. Withdrawal Policies
        </h2>
        <p>
          <strong data-i18n="Large Withdrawals and VIP Limits">Large Withdrawals and VIP Limits:</strong>{" "}
          <span data-i18n="Contact customer service for withdrawals over 10,000 USDT. Withdrawal limits vary by VIP level:">
            Contact customer service for withdrawals over 10,000 USDT. Withdrawal limits vary by VIP level:
          </span>
        </p>
        <ul className="list-disc ml-5">
          <li data-i18n="VIP1: Up to 5,000 GBP">VIP1: Up to 5,000 USDT</li>
          <li data-i18n="VIP2: Up to 10,000 GBP">VIP2: Up to 10,000 USDT</li>
          <li data-i18n="VIP3: Up to 20,000 GBP">VIP3: Up to 20,000 USDT</li>
          <li data-i18n="VIP4: Up to 100,000 GBP">VIP4: Up to 100,000 USDT</li>
        </ul>
        <p>
          <strong data-i18n="Withdrawal Frequency by VIP Level">Withdrawal Frequency by VIP Level:</strong>
        </p>
        <ul className="list-disc ml-5">
          <li data-i18n="VIP1: 1 withdrawal per day">VIP1: 1 withdrawal per day</li>
          <li data-i18n="VIP2: 2 withdrawals per day">VIP2: 2 withdrawals per day</li>
          <li data-i18n="VIP3: 3 withdrawals per day">VIP3: 3 withdrawals per day</li>
          <li data-i18n="VIP4: 4 withdrawals per day">VIP4: 4 withdrawals per day</li>
        </ul>
        <p>
          <strong data-i18n="Withdrawal After Task Completion">Withdrawal After Task Completion:</strong>{" "}
          <span data-i18n="Withdrawals can be made upon completion of all tasks.">Withdrawals can be made upon completion of all tasks.</span>
        </p>
        <p>
          <strong data-i18n="Task Completion for Withdrawal">Task Completion for Withdrawal:</strong>{" "}
          <span data-i18n="Must complete all tasks before withdrawal request.">Must complete all tasks before withdrawal request.</span>
        </p>
        <p>
          <strong data-i18n="No Withdrawal for Incomplete or Abandoned Tasks">No Withdrawal for Incomplete or Abandoned Tasks:</strong>{" "}
          <span data-i18n="Forfeiture of withdrawal and refund rights if tasks are abandoned or withdrawn from prematurely.">
            Forfeiture of withdrawal and refund rights if tasks are abandoned or withdrawn from prematurely.
          </span>
        </p>
        <p>
          <strong data-i18n="User-Initiated Withdrawal Requests">User-Initiated Withdrawal Requests:</strong>{" "}
          <span data-i18n="Withdrawals processed only upon direct user request.">Withdrawals processed only upon direct user request.</span>
        </p>

        <h2 className="font-bold mt-4 mb-2" data-i18n="III. Fund Management and Security">
          III. Fund Management and Security
        </h2>
        <p>
          <strong data-i18n="Secure Funds Holding">Secure Funds Holding:</strong>{" "}
          <span data-i18n="Funds safely stored and fully accessible post-product optimization.">Funds safely stored and fully accessible post-product optimization.</span>
        </p>
        <p>
          <strong data-i18n="Automated Transaction Processing">Automated Transaction Processing:</strong>{" "}
          <span data-i18n="To prevent fund loss.">To prevent fund loss.</span>
        </p>
        <p>
          <strong data-i18n="Platform's Responsibility for Fund Loss">Platform's Responsibility for Fund Loss:</strong>{" "}
          <span data-i18n="Liability for accidental loss of funds.">Liability for accidental loss of funds.</span>
        </p>

        <h2 className="font-bold mt-4 mb-2" data-i18n="IV. Account Security">
          IV. Account Security
        </h2>
        <p>
          <strong data-i18n="Keeping Login Details Confidential">Keeping Login Details Confidential:</strong>{" "}
          <span data-i18n="Non-disclosure of login password and security code.">Non-disclosure of login password and security code.</span>
        </p>
        <p>
          <strong data-i18n="Password and Security Code Advice">Password and Security Code Advice:</strong>{" "}
          <span data-i18n="Avoid predictable information.">Avoid predictable information.</span>
        </p>
        <p>
          <strong data-i18n="Resetting Forgotten Credentials">Resetting Forgotten Credentials:</strong>{" "}
          <span data-i18n="Contact customer service for assistance.">Contact customer service for assistance.</span>
        </p>

        <h2 className="font-bold mt-4 mb-2" data-i18n="V. Product Earnings and Task Assignment">
          V. Product Earnings and Task Assignment
        </h2>
        <p>
          <strong data-i18n="Earnings Categories">Earnings Categories:</strong>{" "}
          <span data-i18n="Regular and six-fold categories. Daily tasks offer 1–8 chances for six-fold earnings.">
            Regular and six-fold categories. Daily tasks offer 1–8 chances for six-fold earnings.
          </span>
        </p>
        <ul className="list-disc ml-5">
          <li data-i18n="VIP1: 0.5% standard, 3% combined">VIP1: 0.5% standard, 3% combined</li>
          <li data-i18n="VIP2: 1% standard, 6% combined">VIP2: 1% standard, 6% combined</li>
          <li data-i18n="VIP3: 1.5% standard, 9% combined">VIP3: 1.5% standard, 9% combined</li>
          <li data-i18n="VIP4: 2% standard, 12% combined">VIP4: 2% standard, 12% combined</li>
        </ul>
        <p>
          <strong data-i18n="Earnings and Funds Crediting">Earnings and Funds Crediting:</strong>{" "}
          <span data-i18n="Post-task completion.">Post-task completion.</span>
        </p>
        <p>
          <strong data-i18n="Random Task Assignments">Random Task Assignments:</strong>{" "}
          <span data-i18n="Based on total account balance.">Based on total account balance.</span>
        </p>
        <p>
          <strong data-i18n="Non-Cancellable Tasks">Non-Cancellable Tasks:</strong>{" "}
          <span data-i18n="Once a task is assigned, it cannot be canceled or transferred to others.">
            Once a task is assigned, it cannot be canceled or transferred to others.
          </span>
        </p>

        <h2 className="font-bold mt-4 mb-2" data-i18n="VI. Combined Task Specifics">
          VI. Combined Task Specifics
        </h2>
        <p>
          <strong data-i18n="Nature of Combined Products">Nature of Combined Products:</strong>{" "}
          <span data-i18n="1 to 3 items, assigned randomly.">1 to 3 items, assigned randomly.</span>
        </p>
        <p>
          <strong data-i18n="Number of Orders">Number of Orders:</strong>{" "}
          <span data-i18n="1–8 high commission combinations are normal.">1–8 high commission combinations are normal.</span>
        </p>
        <p>
          <strong data-i18n="Increased Commissions">Increased Commissions:</strong>{" "}
          <span data-i18n="Six-fold commission compared to regular products.">Six-fold commission compared to regular products.</span>
        </p>
        <p>
          <strong data-i18n="Handling of Funds">Handling of Funds:</strong>{" "}
          <span data-i18n="Used for product trade submissions, reimbursed upon completion.">Used for product trade submissions, reimbursed upon completion.</span>
        </p>
        <p>
          <strong data-i18n="Balance-Based Allocation">Balance-Based Allocation:</strong>{" "}
          <span data-i18n="Allocation based on total account balance.">Allocation based on total account balance.</span>
        </p>
        <p>
          <strong data-i18n="Irrevocable Assignments">Irrevocable Assignments:</strong>{" "}
          <span data-i18n="Cannot be canceled or skipped once assigned.">Cannot be canceled or skipped once assigned.</span>
        </p>

        <h2 className="font-bold mt-4 mb-2" data-i18n="VII. Deposit Conditions">
          VII. Deposit Conditions
        </h2>
        <p>
          <strong data-i18n="Verifying Deposit Addresses">Verifying Deposit Addresses:</strong>{" "}
          <span data-i18n="Confirm addresses with customer service.">Confirm addresses with customer service.</span>
        </p>
        <p>
          <strong data-i18n="Incorrect Deposit Responsibility">Incorrect Deposit Responsibility:</strong>{" "}
          <span data-i18n="User bears losses if deposits are not verified.">User bears losses if deposits are not verified.</span>
        </p>
        <p>
          <strong data-i18n="Additional Details">Additional Details:</strong>
        </p>
        <ul className="list-disc ml-5">
          <li data-i18n="4.1: Align deposits with financial ability.">4.1: Align deposits with financial ability.</li>
          <li data-i18n="4.2: Deposit according to negative balance.">4.2: Deposit according to negative balance.</li>
          <li data-i18n="4.3: Confirm daily updated valid deposit address.">4.3: Confirm daily updated valid deposit address.</li>
          <li data-i18n="4.4: Unverified address = user bears risk.">4.4: Unverified address = user bears risk.</li>
        </ul>

        <h2 className="font-bold mt-4 mb-2" data-i18n="VIII. Merchant Task Cooperation">
          VIII. Merchant Task Cooperation
        </h2>
        <p>
          <strong data-i18n="Impact of Delayed Completion">Impact of Delayed Completion:</strong>{" "}
          <span data-i18n="Affects merchant operations.">Affects merchant operations.</span>
        </p>
        <p>
          <strong data-i18n="Merchant Deposit Details">Merchant Deposit Details:</strong>{" "}
          <span data-i18n="Provided specifically.">Provided specifically.</span>
        </p>
        <p>
          <strong data-i18n="Consequences">Consequences:</strong>{" "}
          <span data-i18n="May lower credit score.">May lower credit score.</span>
        </p>
        <ul className="list-disc ml-5">
          <li data-i18n="8.1: Complete within 8 hours.">8.1: Complete within 8 hours.</li>
          <li data-i18n="8.2: Delays lead to complaints and score reduction.">8.2: Delays lead to complaints and score reduction.</li>
        </ul>

        <h2 className="font-bold mt-4 mb-2" data-i18n="IX. Invitations and User Eligibility">
          IX. Invitations and User Eligibility
        </h2>
        <p>
          <strong data-i18n="VIP4 Invitation Rights">VIP4 Invitation Rights:</strong>{" "}
          <span data-i18n="Available after 30+ working days.">Available after 30+ working days.</span>
        </p>
        <p>
          <strong data-i18n="Restrictions">Restrictions:</strong>{" "}
          <span data-i18n="Must complete optimizations before inviting.">Must complete optimizations before inviting.</span>
        </p>
        <ul className="list-disc ml-5">
          <li data-i18n="9.1: No invites if tasks aren’t done.">9.1: No invites if tasks aren’t done.</li>
          <li data-i18n="9.2: Invitation quotas based on performance.">9.2: Invitation quotas based on performance.</li>
          <li data-i18n="9.3: 20% profit reward from subordinates.">9.3: 20% profit reward from subordinates.</li>
        </ul>

        <h2 className="font-bold mt-4 mb-2" data-i18n="X. Operational Hours">
          X. Operational Hours
        </h2>
        <p>
          <strong data-i18n="Platform">Platform:</strong>{" "}
          <span data-i18n="10:00–21:59:59 (UTC-00:00)">10:00–21:59:59 (UTC-00:00)</span>
        </p>
        <p>
          <strong data-i18n="Customer Service">Customer Service:</strong>{" "}
          <span data-i18n="10:00–21:59:59 (UTC-00:00)">10:00–21:59:59 (UTC-00:00)</span>
        </p>
        <p>
          <strong data-i18n="Withdrawals">Withdrawals:</strong>{" "}
          <span data-i18n="10:00–21:59:59 (UTC-00:00)">10:00–21:59:59 (UTC-00:00)</span>
        </p>

        <h2 className="font-bold mt-4 mb-2" data-i18n="XI. Personal Income Tax Compliance">
          XI. Personal Income Tax Compliance
        </h2>
        <p data-i18n="The Platform operates in compliance with local country tax laws. Users are responsible for declaring and paying taxes on any income. Tax thresholds may vary based on local regulations.">
          The Platform operates in compliance with local country tax laws. Users are responsible for declaring and paying taxes on any income. Tax thresholds may vary based on local regulations.
        </p>

        <h2 className="font-bold mt-4 mb-2" data-i18n="XII. Confidentiality and Non-Disclosure Agreement">
          XII. Confidentiality and Non-Disclosure Agreement
        </h2>
        <p data-i18n="Upon registering, you agree to keep all platform data and operations strictly confidential, even after leaving the platform. Violation may result in legal action and account termination.">
          Upon registering, you agree to keep all platform data and operations strictly confidential, even after leaving the platform. Violation may result in legal action and account termination.
        </p>
      </div>
    </div>
  );
}

