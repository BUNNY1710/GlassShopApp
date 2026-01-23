# Quotation Management - Feature Implementation Prompt

## Overview
This document describes all the features and changes that need to be implemented in the Quotation Management section. The quotation creation form has been enhanced with advanced size input, table selection, and polish selection features.

---

## 1. Size Input Section

### 1.1 Unit Toggle (MM/INCH)
- **Location**: Above height and width input fields
- **Default**: INCH mode (checkbox unchecked)
- **Checkbox Label**: "Size in mm"
- **Behavior**:
  - When unchecked (default): Input is in INCHES
  - When checked: Input is in MILLIMETERS
  - Changing the checkbox updates both height and width units automatically

### 1.2 Height and Width Input Fields
- **Type**: Text input (not number input) to support fractions
- **Placeholder**:
  - INCH mode: `"e.g., 9 or 9 1/2 (inch)"`
  - MM mode: `"e.g., 228.6 (mm)"`
- **Fraction Support** (INCH mode only):
  - Accept formats: `9 1/2`, `9-1/2`, `1/2`, `9.5`, `9`
  - Parse fractions to decimal for calculations
  - Store original input in field, convert to decimal for calculations
- **Validation**: Required fields with visual indicator (red dot)

---

## 2. Table Selection Section

### 2.1 Layout
- **Container**: Light gray background box with border
- **Title**: "Table Selection"
- **Layout**: Two columns (side by side on desktop, stacked on mobile)
  - Left: Height Table
  - Right: Width Table

### 2.2 Table Number Input
- **Type**: Text input (fully editable, allows backspace)
- **Label**: "Height Table Number" / "Width Table Number"
- **Default Value**: 6
- **Range**: 1-12
- **Validation**:
  - Allow typing any number 1-12
  - On blur: Validate and correct if out of range
  - If empty or invalid, default to 6
- **Behavior**: When table number changes, recalculate selected table values based on current height/width

### 2.3 Table Value Buttons
- **Display**: Show all table values based on selected table number
- **Formula**: `tableNumber × multiplier` where multiplier = 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
- **Example**: Table 6 shows: 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66
- **Styling**:
  - Selected value: Blue border (2px), light blue background (#eef2ff), blue text, bold
  - Unselected: Gray border (1px), white background, normal weight
- **Clickable**: User can manually select any table value

### 2.4 Auto-Selection Logic
- **Trigger**: When height or width is entered/changed
- **Algorithm**:
  1. Convert input to inches (if in MM, convert first)
  2. Generate all table values for the selected table number
  3. Check if input value exactly matches any table value
     - **If exact match**: Select that exact value
     - **If no exact match**: Find the next table value that is greater than input
  4. Update selected table value automatically
- **Examples**:
  - Height: 9, Table: 1 → Selects 9 (exact match)
  - Height: 9, Table: 2 → Selects 10 (next after 9)
  - Height: 9, Table: 6 → Selects 12 (next after 9)
  - Height: 8, Table: 2 → Selects 8 (exact match)
- **Recalculation**: When table number changes, recalculate based on current height/width

---

## 3. Polish Selection Section

### 3.1 Location
- **Position**: Inside Table Selection section, below table value buttons
- **Visual Separator**: Horizontal line (border-top: 2px solid #e5e7eb)
- **Title**: "Polish Selection"

### 3.2 Rate Configuration
- **Location**: Above the polish selection table
- **Layout**: Three input fields side by side
- **Fields**:
  - P Rate (default: 15)
  - H Rate (default: 75)
  - B Rate (default: 75)
- **Type**: Number input, modifiable
- **Styling**: Light gray background box with padding

### 3.3 Polish Selection Table

#### 3.3.1 Table Structure
- **Rows**: Always 4 rows (representing 4 sides of glass)
- **Row Labels**:
  - Row 1: "Height 1 (X)" where X is selected height table value
  - Row 2: "Width 1 (X)" where X is selected width table value
  - Row 3: "Height 2 (X)" where X is selected height table value
  - Row 4: "Width 2 (X)" where X is selected width table value

#### 3.3.2 Columns
1. **Side Column**:
   - Checkbox in header (select/deselect all sides)
   - Checkbox for each row
   - Side label: "Height 1 (12)" or "Width 1 (18)" format
   - When checkbox is checked, enables polish type selection for that row

2. **P (Polish) Column**:
   - Checkbox in header (select all rows as P)
   - Radio button for each row
   - When header checkbox is clicked: All checked rows become type "P"

3. **H (Half-round) Column**:
   - Checkbox in header (select all rows as H)
   - Radio button for each row
   - When header checkbox is clicked: All checked rows become type "H"

4. **B (Beveling) Column**:
   - Checkbox in header (select all rows as B)
   - Radio button for each row
   - When header checkbox is clicked: All checked rows become type "B"

5. **Rate Column**:
   - Shows rate for selected type (P, H, or B)
   - Updates dynamically based on rate configuration
   - Shows "-" if no type selected

#### 3.3.3 Selection Rules
- **Mutually Exclusive**: Only one type (P, H, or B) can be selected per row
- **Checkbox Dependency**: Radio buttons are disabled until row checkbox is checked
- **Type Switching**: User can switch between P, H, B in the same row
- **Header Checkboxes**: 
  - Side header: Toggles all row checkboxes
  - P/H/B headers: Sets all checked rows to that type

#### 3.3.4 Data Structure
Each row stores:
```javascript
{
  number: 12,           // Table value
  type: "P" | "H" | "B" | null,
  checked: true | false,
  side: "Height" | "Width",
  sideNumber: 1 | 2
}
```

#### 3.3.5 Update Logic
- **Trigger**: When height/width table values change
- **Behavior**: 
  - Always show 4 rows
  - Order: Height 1, Width 1, Height 2, Width 2
  - Numbers come from selected table values
  - Preserve existing selections when possible

---

## 4. Data Storage

### 4.1 Form Data Structure
```javascript
{
  height: "9 1/2",              // Original input (fraction or decimal)
  width: "16 3/4",              // Original input
  heightDecimal: 9.5,           // Parsed decimal for calculations
  widthDecimal: 16.75,           // Parsed decimal for calculations
  sizeInMM: false,              // Unit toggle state
  heightTableNumber: 6,         // Selected table number (1-12)
  widthTableNumber: 6,         // Selected table number (1-12)
  selectedHeightTableValue: 12, // Selected table value
  selectedWidthTableValue: 18,  // Selected table value
  polishSelection: [            // Array of 4 objects
    { number: 12, type: "P", checked: true, side: "Height", sideNumber: 1 },
    { number: 18, type: null, checked: false, side: "Width", sideNumber: 1 },
    { number: 12, type: "H", checked: true, side: "Height", sideNumber: 2 },
    { number: 18, type: null, checked: false, side: "Width", sideNumber: 2 }
  ],
  polishRates: {
    P: 15,
    H: 75,
    B: 75
  }
}
```

### 4.2 Backend Storage
- **Description Field**: Store polish selection data as JSON string
```json
{
  "heightTableNumber": 6,
  "widthTableNumber": 6,
  "selectedHeightTableValue": 12,
  "selectedWidthTableValue": 18,
  "polishSelection": [...],
  "polishRates": { "P": 15, "H": 75, "B": 75 }
}
```

---

## 5. PDF Generation Updates

### 5.1 Cutting Pad PDF
- **Location**: Below each item's design column
- **Display**: 
  - "Polish Details:" label
  - Table information: "Table: H=6(12), W=6(18)"
  - Side information: "Sides: Height 1=P Width 1=H ..."

### 5.2 Delivery Challan PDF
- **Location**: In "Remarks" column
- **Display**: 
  - Table information: "Table: H=6(12), W=6(18)"
  - Polish information: " | Polish: Height 1=P Width 1=H ..."
  - Truncate if too long (max 50 chars)

---

## 6. Helper Functions Required

### 6.1 Fraction Parser
```javascript
const parseFraction = (input) => {
  // Supports: "9 1/2", "9-1/2", "1/2", "9.5", "9"
  // Returns decimal value or null
}
```

### 6.2 Table Value Generator
```javascript
const generateTableValues = (tableNumber) => {
  // Returns array: [tableNumber×1, tableNumber×2, ..., tableNumber×11]
}
```

### 6.3 Table Value Finder
```javascript
const findNextTableValue = (inputValue, tableNumber) => {
  // 1. Check for exact match in table values
  // 2. If no match, find next value > input
  // 3. Return selected value
}
```

### 6.4 Polish Selection Updater
```javascript
const updatePolishSelectionNumbers = (items, index) => {
  // Create 4 rows: Height 1, Width 1, Height 2, Width 2
  // Use selected table values
  // Preserve existing selections
}
```

---

## 7. UI/UX Requirements

### 7.1 Responsive Design
- Mobile: Stack columns vertically
- Desktop: Side by side layout
- Touch-friendly button sizes (min 44px)

### 7.2 Visual Feedback
- Selected table values: Blue highlight
- Disabled radio buttons: Grayed out
- Rate updates: Real-time in table

### 7.3 Validation
- Table numbers: 1-12 range
- Height/Width: Required, parse fractions
- Polish rates: Positive numbers

---

## 8. Implementation Checklist

- [ ] Add "Size in mm" checkbox above height/width inputs
- [ ] Change height/width inputs to text type (support fractions)
- [ ] Implement fraction parser function
- [ ] Add Table Selection section with two columns
- [ ] Add table number inputs (editable, 1-12, default 6)
- [ ] Generate and display table value buttons
- [ ] Implement auto-selection logic (exact match or next)
- [ ] Add Polish Selection section inside Table Selection
- [ ] Add rate configuration inputs (P, H, B)
- [ ] Create polish selection table with 4 rows
- [ ] Implement checkbox and radio button logic
- [ ] Add "select all" checkboxes in table header
- [ ] Update polish selection when table values change
- [ ] Store polish data in description field as JSON
- [ ] Update PDF generation to show polish details
- [ ] Test fraction input parsing
- [ ] Test table value auto-selection
- [ ] Test polish selection interactions
- [ ] Verify PDF output includes polish details

---

## 9. Technical Notes

### 9.1 State Management
- Use React useState for form data
- Store original fraction input separately from decimal
- Update polish selection array when dependencies change

### 9.2 Calculations
- Always use decimal values for area/subtotal calculations
- Convert MM to inches before table calculations
- Preserve original input for display

### 9.3 Data Flow
1. User enters height/width (fraction or decimal)
2. Parse to decimal (if fraction)
3. Auto-select table values
4. Update polish selection numbers
5. Calculate area and subtotal
6. On submit: Store as JSON in description field

---

## 10. Example User Flow

1. **Enter Dimensions**:
   - Height: `9 1/2` (inches)
   - Width: `16 3/4` (inches)

2. **Table Selection**:
   - Height Table: 6 → Auto-selects 12 (next after 9.5)
   - Width Table: 6 → Auto-selects 18 (next after 16.75)
   - User can change table numbers or manually select values

3. **Polish Selection**:
   - 4 rows appear: Height 1 (12), Width 1 (18), Height 2 (12), Width 2 (18)
   - User checks rows and selects P, H, or B
   - Rates display dynamically

4. **Submit**:
   - All data saved including polish selection as JSON
   - PDFs generated with polish details

---

## End of Prompt

This prompt contains all the features and requirements for the enhanced quotation management system. Follow the checklist and implement each feature as described.

