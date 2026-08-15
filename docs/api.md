# AyuLink API Specification

## Base URL
`/api`

## Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Authenticate user with demo credentials and return token + role profile |
| `GET` | `/auth/demo-accounts` | List available demo personas (Doctor, Pharmacy, Patient) |

## Clinical & Prescriptions
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/prescriptions` | Create structured prescription with medication schedule |
| `GET` | `/prescriptions` | Query prescriptions with filters (`doctor_id`, `pharmacy_id`, `patient_id`, `status`) |
| `GET` | `/prescriptions/{id}` | Detailed prescription view |
| `POST` | `/prescriptions/{id}/send` | Send prescription to designated pharmacy |
| `POST` | `/prescriptions/{id}/unavailable` | Pharmacy triggers out-of-stock alert to physician |
| `POST` | `/prescriptions/{id}/doctor-response` | Physician confirms clinical resolution (substitution, reroute, instructions) |
| `POST` | `/prescriptions/{id}/complete` | Pharmacy dispenses and completes prescription |

## Medicines & Inventory
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/medicines` | Search catalog by brand, generic name, or strength |
| `GET` | `/medicines/{id}` | Fetch individual medicine details |
| `GET` | `/medicines/{id}/availability` | **Public Patient Endpoint**: Returns participating pharmacy availability status without exposing stock counts |
| `GET` | `/pharmacies/{id}/inventory` | **Internal Pharmacy Endpoint**: Full stock management feed |
| `PATCH` | `/inventory/{id}` | Update item availability status (`available`, `unavailable`, `uncertain`) |
| `POST` | `/inventory/sync` | Trigger simulated POS/ERP inventory sync cycle |

## Demand Intelligence & AI
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/demand` | Regional aggregated demand metrics & supply gap flags |
| `GET` | `/demand/{medicine_id}` | Detailed metric breakdown for specific medicine |
| `POST` | `/ai/history-summary` | Generate longitudinal prescription summary for patient |
| `POST` | `/ai/safety-check` | Real-time medication safety & drug interaction check |
| `POST` | `/ai/demand-explanation` | Explainable scoring factor breakdown for demand intelligence |

## System & Demo Operations
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/demo/reset` | Restore demo scenario baseline state |
