import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const START_BLUE = "#1fb6fc";

/**
 * Terms and Conditions page (document-scrollable)
 *
 * Changes made:
 * - Kept translation logic and observers.
 * - Header remains fixed.
 * - Removed card maxHeight + inner overflow so the whole page/document scrolls.
 * - The white card expands with content and the page scrolls up/down.
 *
 * Nothing else (handlers / translation logic) was removed.
 */
export default function TermsAndConditions() {
  const navigate = useNavigate();

  // Apply translations to all elements with data-i18n (keeps previous behaviour)
  async function applyTranslations() {
    try {
      // 1) If the app exposes a dedicated translator function, use it
      if (typeof window.applyTranslations === "function") {
        try {
          window.applyTranslations();
          return;
        } catch (e) {
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
      if (!res.ok) return;
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
      console.warn("applyTranslations error:", err);
    }
  }

  useEffect(() => {
    applyTranslations();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "lang") {
          applyTranslations();
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });

    const onLangEvent = () => applyTranslations();
    window.addEventListener("languageChanged", onLangEvent);
    window.addEventListener("i18nChanged", onLangEvent);

    return () => {
      observer.disconnect();
      window.removeEventListener("languageChanged", onLangEvent);
      window.removeEventListener("i18nChanged", onLangEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The full Terms & Conditions text (exactly as provided)
  const termsText = `Welcome to Digital Blitz and its services!

Digital Blitz is a partner of the United Nations World Food Programme (WFP). All users of the platform will be donors to this charitable organization. We thank all users on Digital Blitz for their contributions to the charity, hoping that all humanity can enjoy healthy food.

I. Starting Product Maintenance

1.1) Users need a minimum account balance of 100 USDC before beginning a new set of maintenance tasks.

1.2) At least 100 USDC is required to reset the maintenance cycle for a new set.

1.3) After completing all tasks for the day, users must apply for a full withdrawal and receive the withdrawal amount before applying to reset the account.

II. Withdrawal

2.1) For withdrawal amounts of 10,000 USDC or above, please contact our online customer service.
1: The maximum withdrawal for VIP1 users is 10,000 USDC.
2: The maximum for VIP2 is 50,000 USDC.
3: For VIP3, it's 150,000 USDC.
4: VIP4 users can withdraw up to 500,000 USDC.

2.2) Once the account is reset, users must complete a set of all product maintenance before they can apply for withdrawal.

2.3) Opting out or exiting during the maintenance of combo products will prevent withdrawal or refund applications.

2.4) Withdrawal requests will not be processed if not received from the user.

2.5) Withdrawal applications are impossible with a credit score below 100%. You must restore your account's credit score before applying.

III. Funds

3.1) Funds are stored securely in users' accounts and can be fully withdrawn after completing all product maintenance.

3.2) To prevent fund loss, all data processing is handled by the system without manual intervention.

3.3) The platform takes full responsibility for any accidental loss of funds.

IV. Account Security

4.1) Do not share your login password and security code with others. The platform isn't responsible for any loss incurred from shared credentials.

4.2) Avoid using personal information such as your birthday or ID number as your security code or login password.

4.3) If you forget your login details, please contact our online customer service to reset them.

V. Standard Applications

5.1) Platform earnings are categorized into normal earnings and multiple earnings (more than 6 times). In a set of product data, users typically encounter 1-2 combo products and can receive up to 3 combo products.

5.2) VIP1 earns a 0.4% commission for each standard maintenance product.

5.3) VIP1 earns more than a 2.4% commission for each maintenance of combo products.

5.4) After maintenance completion, funds and earnings are returned to the user's account.

5.5) The system allocates product value to users' accounts randomly, based on the real-time balance.

VI. Combo Products

6.1) Combo products consist of 1-3 products, and users are not guaranteed to receive 3 products. The system randomly allocates standard products based on the user's account funds, with a higher likelihood of receiving 1-2 products in a combo.

6.2) Users receive more than 6 times the commission of a standard product for each product in the combo products.

6.3) All funds stop rolling until you complete the orders for each product in the combo and return them to your account.

6.4) The system randomly allocates combo products to users' accounts based on the total account balance.

6.5) Once a combo product is allocated to a user, it cannot be canceled or skipped. Users must clear the account negative before they can submit the order for the combo product and apply for withdrawal after completing all tasks.

VII. Deposit

7.1) The deposit amount is chosen by the user; the platform cannot make this decision for the user. It is advised to select the amount according to one's financial capacity.

7.2) Users advised to prepay a deposit upon receiving combo products should do so based on the insufficient amount displayed in their account.

7.3) Before prepaying, you must consult with online customer service for details and confirm the deposit.

7.4) If a user deposits into the incorrect address, the platform is not responsible for any losses incurred.

7.5) During the platform's promotional period, to further reward our valued users and allow them to earn more commissions, the system will automatically upgrade any account to VIP4 status if the user's funds exceed 20,000 USDC.

VIII. Merchant Collaboration

8.1) The platform has various products going online and offline. If a product is not maintained in a timely manner, it can negatively affect the product's reputation. Users are encouraged to complete all product maintenance promptly.

8.2) Merchants provide deposit details for user deposits.

8.3) Delays in completing product maintenance can result in losses for merchants and disrupt the process.

IX. Agent/User Responsibilities

9.1) Agents/users must complete the maintenance of the entire set of products within 24 hours. Otherwise, it may result in some functionalities of the account being restricted by the system, and you will need to contact online customer service to lift the account restrictions.

9.2) Combo products are distributed randomly by the system. Users must fully understand the platform rules and choose their deposit amount based on their financial situation. Once allocated combo products, users can earn more than 6 times the commission, but they need to complete the clearance/deposit for the combo products within the specified 24 hours. Failure to do so can affect the reputation of the combo products, impact the user's account credit score, and the user will bear all responsibilities.

X. Invitation

10.1) Agents can invite other users through the invitation code on their account.

10.2) If the account has not completed all product maintenance, it cannot invite other users.

10.3) The referrer will receive an additional 20% of the total product commission from the referred person for the day, excluding commissions.`;

  return (
    <div style={{ minHeight: "100vh", background: "#efe9e3", fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
      {/* Black fixed header */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: 64,
        background: "#111",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 40,
        boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.02)"
      }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            padding: 8,
            cursor: "pointer",
            color: "#fff",
          }}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="15 6 9 12 15 18" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div style={{ fontWeight: 800, fontSize: 18 }}>Terms and Conditions</div>

        <div style={{ position: "absolute", right: 14, width: 24 }} />
      </div>

      {/* Spacer for header */}
      <div style={{ height: 72 }} />

      {/* Centered white card; no inner fixed height — the document scrolls */}
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "16px", boxSizing: "border-box" }}>
        <div style={{
          background: "#ffffff",
          borderRadius: 12,
          padding: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          // removed maxHeight/overflow so the card grows with content and the page scrolls
        }}>
          <div style={{ whiteSpace: "pre-wrap", color: "#222", lineHeight: 1.6, fontSize: 14 }}>
            {termsText}
          </div>
        </div>
      </main>
    </div>
  );
}