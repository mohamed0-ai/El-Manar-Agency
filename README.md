# شركة المنار للتكييف وفلاتر المياه والتوكيلات التجارية
## Al-Manar Air Conditioning, Water Filters & Commercial Agencies - Assiut, Egypt

> **رواد الحلول الهندسية لأنظمة التكييف والتوريدات العامة في صعيد مصر**

A hardened, high-performance, full-stack E-Commerce & Service Management Web Platform built for **شركة المنار للتوكيلات التجارية** in Assiut, Egypt.

---

### 1. Brand Profile & Official Credentials
* **Company Name (AR):** شركة المنار للتكييف وفلاتر المياه والتوكيلات التجارية
* **Company Name (EN):** Al-Manar Air Conditioning, Water Filters & Commercial Agencies
* **Headquarters & Showroom:** أسيوط - أول شارع التجنيد من شارع الجمهورية - أمام بنك الإمارات دبي الوطني (Emirates NBD)، مدينة أسيوط، مصر.
* **Direct Hotlines:**
  * Primary: `00000000`
  * Secondary / Sales: `00000001`
  * Emergency HVAC 24/7: `000000000`
* **Email:** `almanaragencies@gmail.com`
* **Commercial Registration:** س.ت `00000`
* **Tax Card:** ب.ض `20000000007`
* **Official Banking Details:**
  * **Bank:** Banque Misr (بنك مصر - فرع أسيوط)
  * **Account Holder:** شركة المنار للتوكيلات التجارية
  * **Swift Code:** `000000000`
  * **IBAN:** `00000000000000000000000000`

---

### 2. Core Domains & Features
1. **Air Conditioning Systems (أنظمة التكييف):**
   * Split Units, Concealed Ducting (الكونسيلد), Central AC, and Commercial VRF/VRV systems (8-36 HP / 25.2-100 kW).
   * Authorized Dealerships: Carrier, Midea, Haier, LG, Sharp, Fresh, Tornado, AUX, Trane, York.
   * Multi-faceted filtering: Horsepower (1.5 HP to 28+ HP), Inverter vs. Standard, Cool vs. Cold/Hot, 5-year official factory guarantee.
2. **Water Purification & Dispensers (فلاتر ومبردات المياه):**
   * 7-Stage Reverse Osmosis (RO) domestic filtration systems with American membranes and booster pumps.
   * Commercial RO water stations for clinics, factories, and corporate cafeterias.
   * Authentic replacement cartridge kits (طقم شمعات فلاتر كامل).
   * Hot and cold water dispensers with built-in filtration and mini refrigeration cabinets.
3. **Home & Office Appliances (الأجهزة الكهربائية):**
   * Commercial and domestic refrigerators, front-load washing machines, conference room 4K smart screens (Samsung, Toshiba, LG).
4. **Office Supplies & Turnkey Furnishing (المستلزمات المكتبية والأثاث):**
   * Ergonomic mesh executive office chairs, conference tables, heavy-duty laser printers (HP LaserJet Pro), toners, and Deli supplies.
5. **Engineering Services & Preventive Maintenance (خدمات الصيانة والتركيب):**
   * Certified South African & American pure copper piping extension calculator (rated at 1,150 EGP per linear meter including Armaflex insulation and El Sewedy copper cables).
   * Annual HVAC Preventive Maintenance Contracts for factories and corporate headquarters (as featured in Al-Manar's industrial collaboration proposals).
   * Emergency 24/7 technical breakdown dispatch in Assiut.
6. **Smart AC Room Capacity & BTU Calculator (حاسبة قدرة التكييف):**
   * Sizing engine tailored specifically for the extreme summer heat of Upper Egypt (Assiut).
   * Calculates BTU requirement, recommended Horsepower, and provides energy-saving Inverter advice with matching in-stock models.

---

### 3. Egyptian Payment Gateways & Proof Verification Workflow
* **InstaPay Gateway (IPA):**
  * Displays active InstaPay Payment Address (e.g. `almanar@instapay`) with 1-click copy and step-by-step mobile guide.
* **Vodafone Cash Mobile Wallet:**
  * Displays active wallet phone numbers (`0000000`) with USSD dialing instructions (`*90000mount#`).
* **Banque Misr Direct Bank Transfer:**
  * Official IBAN and Swift Code breakdown.
* **Cash on Delivery (COD):**
  * Inspection and cash handover upon delivery by Al-Manar's technical team.
* **Proof Verification Subsystem:**
  * Customers submit sender phone / InstaPay handle, transaction reference number, and upload image or PDF proof (up to 5MB).
  * Orders transition to `Pending_Payment_Verification`.
  * Sales & Orders Officers inspect the uploaded receipt, zoom and review the reference number, and can **Approve** (transitions order to `Paid` and `Processing`) or **Reject** with custom feedback.
  * If rejected, customers receive an alert in their Customer Portal and can re-upload a corrected proof!

---

### 4. Role-Based Access Control (RBAC) Matrix

| Role | Role Code | Privileges & Responsibilities |
| :--- | :--- | :--- |
| **Super Admin** | 0 Full platform ownership: manage user accounts, assign roles, financial analytics, audit logs, configure global store settings (wallets, bank details, hotlines). |
| **Catalog Manager** |0 | Full CRUD for products, categories, brands, stock quantities, and technical specifications. *Restricted from financials and user management.* |
| **Sales & Orders Officer** | `0| View customer orders, verify InstaPay / Vodafone Cash receipts, approve/reject payment proofs, update fulfillment status (`Processing`, `Shipped`, `Delivered`). |
| **Maintenance Dispatcher** | 0` | Manage HVAC installation and maintenance requests, assign field technicians, schedule dates, update job statuses. |
| **Customer** | `0` | Browse catalog, use AC calculator, place orders with proof upload, re-upload receipt if rejected, book maintenance requests, print tax invoices. |

---

### 5. Quick Demo Accounts (Pre-configured)

The system includes a **1-Click Demo Switcher** in the navigation bar and login screen:

* **Super Admin:** 
* **Catalog Manager:** `
* **Sales Officer:** 
* **Maintenance Dispatcher:** 
* **Customer:** `

---

### 6. Quick Start & Execution

From the project root (`almanar-platform`):

```bash
# 1. Install dependencies (if not already installed)
npm install
cd server && npm install
cd ../client && npm install
cd ..

# 2. Seed database with authentic Al-Manar catalog & settings
npm run seed

# 3. Build frontend production assets
npm run build

# 4. Start the production server (serves both API & Frontend on port 5000)
npm start
```

Open your browser at: **`http://localhost:5000`**
