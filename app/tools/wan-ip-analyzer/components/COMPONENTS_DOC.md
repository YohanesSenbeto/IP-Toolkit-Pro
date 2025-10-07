# WAN IP Analyzer – Extracted Components Documentation

This document explains the purpose, props, and design considerations of the modular components extracted from the original monolithic `page.tsx` for the WAN IP Analyzer tool.

## Goals of Extraction
- Reduce cognitive load in `page.tsx`
- Improve reusability and testability
- Centralize table styling patterns
- Enable consistent dark mode and density adjustments

---

## 1. `ImportantInfoTable`
**File:** `ImportantInfoTable.tsx`

### Purpose
Displays the primary interface-level values immediately useful for network troubleshooting: WAN IP, Subnet Mask, Default Gateway.

### Props
| Prop | Type | Description |
|------|------|-------------|
| `wanIp` | `string \| undefined` | The resolved WAN/public IP. |
| `subnetMask` | `string \| undefined` | Subnet mask from network info or interface. |
| `defaultGateway` | `string \| undefined` | Router or upstream gateway. |

### Notes
- Uses a dense two-column semantic table for consistency with other sections.
- Fallback placeholder: em dash (—) for missing values.

---

## 2. `NetworkInfoTable`
**File:** `NetworkInfoTable.tsx`

### Purpose
Encapsulates CIDR-based network range metadata returned from the analysis step.

### Props
| Prop | Type | Description |
|------|------|-------------|
| `networkInfo` | `{ subnetMask?; cidr?; networkAddress?; broadcastAddress?; firstUsableIp?; lastUsableIp?; totalHosts?; usableHosts? }` | Network calculation output. |

### Behavior
- Shows a section header row ("Range & Capacity").
- Formats CIDR with leading slash if present.
- Localizes numeric host counts using `toLocaleString()` if available.

---

## 3. `DetailRecordTable`
**File:** `DetailRecordTable.tsx`

### Purpose
Renders the full historical detail record after the user clicks "Show Detail" (or "Refresh Detail"). Groups logically related data segments.

### Props
| Prop | Type | Description |
|------|------|-------------|
| `detailEntry` | `DetailRecord` | Raw detail object (includes flexible field naming variants). |
| `analysis` | `any` | The primary analysis result for fallback values. |
| `expanded` | `boolean` | Controls visibility of the table body (collapse/expand). |
| `onToggle` | `() => void` | Handler to flip expanded state. |

### Internal Interfaces
`DetailRecord` supports multiple naming variants (`wanIp`/`ipAddress`, `regionName`/`region_name`, etc.) to tolerate different backend shapes until normalized.

### Sections Rendered
1. Core (WAN IP, Subnet, Gateway, CIDR, Timestamp, Router Recommendation)
2. Network Range (Network/Broadcast, First/Last IP, Host counts)
3. Region & Interface (regional metadata + interface label)
4. Assignment (status, customer, account, location)

### Design Choices
- Repetitive fallback chains intentionally left explicit for clarity while migrating toward a normalization utility (planned).
- Minimal logic in markup thanks to helper `<Row />` and `<SectionHeader />` subcomponents.

---

## 4. (Planned) `CustomerInfoTable`
**Status:** Not yet extracted (still inline in `page.tsx`).

### Planned Props
| Prop | Type | Description |
|------|------|-------------|
| `customer` | `{ customerId?; name?; phone? }` | Customer lookup result. |
| `detailUrl` | `string \| undefined` | Optional link to a full history/customer detail page. |

### Planned Behavior
- Mirror styling of other tables.
- Provide optional Detail button if `customerId` present.
- Support skeleton loading pattern in future enhancements.

---

## Shared Styling & UX Patterns
- All tables use `.table-strong-lines` class for consistent border density.
- Section headers: gray muted row with uppercase label, using `bg-muted/50` or `bg-muted/60` variations.
- Monospace for IP/CIDR values to improve alignment and scannability.
- Em dash (—) for absent values, avoiding empty cells.

---

## Accessibility Considerations
- Tables remain semantic (`<table>` + `<thead>` + `<tbody>`) aiding screen readers.
- Collapsible detail preserves heading + button controls grouped logically.
- Future enhancement: Add `aria-label` or `aria-describedby` to each table for additional context where needed.

---

## Future Refactors
| Area | Rationale | Action |
|------|-----------|--------|
| Fallback Chains | Repetition | Introduce `resolve(fields: string[], obj: any)` helper. |
| Customer Info | Consistency | Extract into `CustomerInfoTable`. |
| Loading States | UX polish | Add skeleton row components. |
| Test Coverage | Reliability | Add unit tests for conditional rendering & fallback resolution. |

---

## Usage Snapshot
```tsx
<ImportantInfoTable wanIp={analysis.ipAddress} subnetMask={analysis.networkInfo?.subnetMask} defaultGateway={analysis.interface?.defaultGateway} />
<NetworkInfoTable networkInfo={analysis.networkInfo} />
{detailEntry && (
  <DetailRecordTable detailEntry={detailEntry} analysis={analysis} expanded={detailExpanded} onToggle={() => setDetailExpanded(p => !p)} />
)}
```

---

## Maintenance Notes
- Keep prop contracts narrow; avoid passing entire parent state objects.
- Normalize incoming API shapes before they reach presentation components (future `formatAnalysisResult`).
- When adding new fields, update both the interface and the documentation tables above.

---

_Last updated: 2025-10-06_
