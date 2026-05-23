// Seed data generator — run with: node scripts/seed.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function save(name, data) {
    fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2));
    console.log(`  ✅ ${name}.json (${data.length} records)`);
}

console.log('🌱 Seeding procurement database...\n');

// ── Vendors ──
const vendors = [
    { id: 'VND-00001', name: 'TechPro Solutions', category: 'IT & Electronics', contact: 'Rajesh Sharma', email: 'rajesh@techpro.com', phone: '+91-9876543210', city: 'Mumbai', status: 'Active', rating: 4.8, onTimeDelivery: 96, qualityScore: 95, totalOrders: 142, totalSpend: 4500000, yearsActive: 8, complianceIssues: 0 },
    { id: 'VND-00002', name: 'Stallion Steel Corp', category: 'Raw Materials', contact: 'Meena Patel', email: 'meena@stallionsteel.com', phone: '+91-9876543211', city: 'Ahmedabad', status: 'Active', rating: 4.5, onTimeDelivery: 91, qualityScore: 92, totalOrders: 89, totalSpend: 12000000, yearsActive: 12, complianceIssues: 0 },
    { id: 'VND-00003', name: 'GreenPack Industries', category: 'Packaging', contact: 'Suresh Kumar', email: 'suresh@greenpack.in', phone: '+91-9876543212', city: 'Delhi', status: 'Active', rating: 4.2, onTimeDelivery: 88, qualityScore: 90, totalOrders: 67, totalSpend: 2800000, yearsActive: 5, complianceIssues: 1 },
    { id: 'VND-00004', name: 'SafeGuard Equipment', category: 'Safety Equipment', contact: 'Priya Nair', email: 'priya@safeguard.com', phone: '+91-9876543213', city: 'Chennai', status: 'Active', rating: 4.6, onTimeDelivery: 94, qualityScore: 97, totalOrders: 53, totalSpend: 1500000, yearsActive: 6, complianceIssues: 0 },
    { id: 'VND-00005', name: 'OfficeMart Supplies', category: 'Office Supplies', contact: 'Amit Verma', email: 'amit@officemart.in', phone: '+91-9876543214', city: 'Bangalore', status: 'Active', rating: 3.9, onTimeDelivery: 85, qualityScore: 86, totalOrders: 210, totalSpend: 950000, yearsActive: 4, complianceIssues: 0 },
    { id: 'VND-00006', name: 'PowerDrive Motors', category: 'Machinery', contact: 'Vikram Singh', email: 'vikram@powerdrive.com', phone: '+91-9876543215', city: 'Pune', status: 'Active', rating: 4.3, onTimeDelivery: 89, qualityScore: 91, totalOrders: 34, totalSpend: 8500000, yearsActive: 15, complianceIssues: 0 },
    { id: 'VND-00007', name: 'ChemFlow Pvt Ltd', category: 'Raw Materials', contact: 'Deepa Joshi', email: 'deepa@chemflow.in', phone: '+91-9876543216', city: 'Hyderabad', status: 'Under Review', rating: 3.4, onTimeDelivery: 75, qualityScore: 78, totalOrders: 18, totalSpend: 3200000, yearsActive: 3, complianceIssues: 2 },
    { id: 'VND-00008', name: 'ElectroCables India', category: 'Electrical', contact: 'Ravi Menon', email: 'ravi@electrocables.com', phone: '+91-9876543217', city: 'Kochi', status: 'Active', rating: 4.1, onTimeDelivery: 90, qualityScore: 88, totalOrders: 76, totalSpend: 5600000, yearsActive: 9, complianceIssues: 0 },
    { id: 'VND-00009', name: 'MRO Spares Global', category: 'MRO', contact: 'Anita Das', email: 'anita@mrospares.com', phone: '+91-9876543218', city: 'Kolkata', status: 'Active', rating: 4.0, onTimeDelivery: 87, qualityScore: 85, totalOrders: 120, totalSpend: 3400000, yearsActive: 7, complianceIssues: 1 },
    { id: 'VND-00010', name: 'NovaTech Systems', category: 'IT & Electronics', contact: 'Karan Gupta', email: 'karan@novatech.in', phone: '+91-9876543219', city: 'Gurgaon', status: 'Blacklisted', rating: 2.1, onTimeDelivery: 60, qualityScore: 55, totalOrders: 8, totalSpend: 450000, yearsActive: 1, complianceIssues: 5 },
];
save('vendors', vendors);

// ── Purchase Requisitions ──
const prs = [
    { id: 'PR-00001', title: 'Laptop and peripherals for new hires', department: 'IT', requestedBy: 'Rahul Mehta', date: '2026-02-15', priority: 'High', status: 'Approved', totalAmount: 450000, items: [{ name: 'Laptop Dell Latitude', qty: 5, unitPrice: 75000 }, { name: 'Monitor 27"', qty: 5, unitPrice: 15000 }] },
    { id: 'PR-00002', title: 'Steel plates for manufacturing Q1', department: 'Production', requestedBy: 'Sanjay Rao', date: '2026-02-14', priority: 'Critical', status: 'Pending Approval', totalAmount: 2800000, items: [{ name: 'MS Steel Plate 6mm', qty: 200, unitPrice: 12000 }, { name: 'SS Steel Plate 4mm', qty: 50, unitPrice: 8000 }] },
    { id: 'PR-00003', title: 'Q1 Office Supplies Replenishment', department: 'Admin', requestedBy: 'Neha Kapoor', date: '2026-02-13', priority: 'Medium', status: 'Approved', totalAmount: 85000, items: [{ name: 'A4 Paper Ream', qty: 200, unitPrice: 250 }, { name: 'Printer Cartridge', qty: 20, unitPrice: 1750 }] },
    { id: 'PR-00004', title: 'Safety helmets and vests — annual order', department: 'EHS', requestedBy: 'Amit Verma', date: '2026-02-12', priority: 'High', status: 'Draft', totalAmount: 320000, items: [{ name: 'Safety Helmet ISI', qty: 200, unitPrice: 800 }, { name: 'Reflective Vest', qty: 200, unitPrice: 800 }] },
    { id: 'PR-00005', title: 'CNC machine spare parts', department: 'Maintenance', requestedBy: 'Vijay Kumar', date: '2026-02-10', priority: 'Critical', status: 'Approved', totalAmount: 560000, items: [{ name: 'Spindle Bearing', qty: 4, unitPrice: 85000 }, { name: 'Cutting Tool Set', qty: 10, unitPrice: 22000 }] },
    { id: 'PR-00006', title: 'Server rack upgrade for data center', department: 'IT', requestedBy: 'Rahul Mehta', date: '2026-02-09', priority: 'High', status: 'Pending Approval', totalAmount: 1200000, items: [{ name: 'Server Rack 42U', qty: 2, unitPrice: 450000 }, { name: 'UPS 10KVA', qty: 2, unitPrice: 150000 }] },
    { id: 'PR-00007', title: 'Packaging material for product line B', department: 'Production', requestedBy: 'Meera Shah', date: '2026-02-08', priority: 'Medium', status: 'Rejected', totalAmount: 175000, items: [{ name: 'Corrugated Box', qty: 1000, unitPrice: 125 }, { name: 'Stretch Wrap Roll', qty: 50, unitPrice: 1000 }] },
    { id: 'PR-00008', title: 'Electrical cables for plant expansion', department: 'Projects', requestedBy: 'Ravi Desai', date: '2026-02-05', priority: 'High', status: 'Approved', totalAmount: 890000, items: [{ name: 'Copper Cable 4sqmm', qty: 500, unitPrice: 1200 }, { name: 'Armoured Cable 16sqmm', qty: 100, unitPrice: 2900 }] },
];
save('purchaseRequisitions', prs);

// ── Purchase Orders ──
const pos = [
    { id: 'PO-00001', prId: 'PR-00001', vendorId: 'VND-00001', vendor: 'TechPro Solutions', date: '2026-02-16', deliveryDate: '2026-03-01', status: 'Confirmed', totalAmount: 450000, paymentTerms: 'Net 30', items: [{ name: 'Laptop Dell Latitude', qty: 5, unitPrice: 75000, total: 375000 }, { name: 'Monitor 27"', qty: 5, unitPrice: 15000, total: 75000 }] },
    { id: 'PO-00002', prId: 'PR-00003', vendorId: 'VND-00005', vendor: 'OfficeMart Supplies', date: '2026-02-15', deliveryDate: '2026-02-22', status: 'Delivered', totalAmount: 85000, paymentTerms: 'Net 15', items: [{ name: 'A4 Paper Ream', qty: 200, unitPrice: 250, total: 50000 }, { name: 'Printer Cartridge', qty: 20, unitPrice: 1750, total: 35000 }] },
    { id: 'PO-00003', prId: 'PR-00005', vendorId: 'VND-00009', vendor: 'MRO Spares Global', date: '2026-02-14', deliveryDate: '2026-02-28', status: 'In Transit', totalAmount: 560000, paymentTerms: 'Net 45', items: [{ name: 'Spindle Bearing', qty: 4, unitPrice: 85000, total: 340000 }, { name: 'Cutting Tool Set', qty: 10, unitPrice: 22000, total: 220000 }] },
    { id: 'PO-00004', prId: 'PR-00008', vendorId: 'VND-00008', vendor: 'ElectroCables India', date: '2026-02-12', deliveryDate: '2026-03-05', status: 'Confirmed', totalAmount: 890000, paymentTerms: 'Net 30', items: [{ name: 'Copper Cable 4sqmm', qty: 500, unitPrice: 1200, total: 600000 }, { name: 'Armoured Cable 16sqmm', qty: 100, unitPrice: 2900, total: 290000 }] },
    { id: 'PO-00005', prId: 'PR-00002', vendorId: 'VND-00002', vendor: 'Stallion Steel Corp', date: '2026-02-10', deliveryDate: '2026-03-10', status: 'Pending', totalAmount: 2800000, paymentTerms: 'Net 60', items: [{ name: 'MS Steel Plate 6mm', qty: 200, unitPrice: 12000, total: 2400000 }, { name: 'SS Steel Plate 4mm', qty: 50, unitPrice: 8000, total: 400000 }] },
    { id: 'PO-00006', vendorId: 'VND-00004', vendor: 'SafeGuard Equipment', date: '2026-01-20', deliveryDate: '2026-02-10', status: 'Delivered', totalAmount: 280000, paymentTerms: 'Net 30', items: [{ name: 'Safety Helmet ISI', qty: 150, unitPrice: 800, total: 120000 }, { name: 'Safety Goggles', qty: 200, unitPrice: 800, total: 160000 }] },
];
save('purchaseOrders', pos);

// ── GRN ──
const grns = [
    { id: 'GRN-00001', poId: 'PO-00002', vendor: 'OfficeMart Supplies', date: '2026-02-22', status: 'Accepted', inspectedBy: 'Sunil Yadav', items: [{ name: 'A4 Paper Ream', orderedQty: 200, receivedQty: 200, acceptedQty: 200, status: 'Accepted' }, { name: 'Printer Cartridge', orderedQty: 20, receivedQty: 20, acceptedQty: 19, status: 'Partial' }] },
    { id: 'GRN-00002', poId: 'PO-00006', vendor: 'SafeGuard Equipment', date: '2026-02-10', status: 'Accepted', inspectedBy: 'Priya Nair', items: [{ name: 'Safety Helmet ISI', orderedQty: 150, receivedQty: 150, acceptedQty: 150, status: 'Accepted' }, { name: 'Safety Goggles', orderedQty: 200, receivedQty: 200, acceptedQty: 195, status: 'Partial' }] },
    { id: 'GRN-00003', poId: 'PO-00003', vendor: 'MRO Spares Global', date: '2026-02-28', status: 'Pending Inspection', inspectedBy: '', items: [{ name: 'Spindle Bearing', orderedQty: 4, receivedQty: 4, acceptedQty: 0, status: 'Pending' }, { name: 'Cutting Tool Set', orderedQty: 10, receivedQty: 10, acceptedQty: 0, status: 'Pending' }] },
    { id: 'GRN-00004', poId: 'PO-00001', vendor: 'TechPro Solutions', date: '2026-03-01', status: 'Rejected', inspectedBy: 'Rahul Mehta', items: [{ name: 'Laptop Dell Latitude', orderedQty: 5, receivedQty: 5, acceptedQty: 3, status: 'Partial' }, { name: 'Monitor 27"', orderedQty: 5, receivedQty: 5, acceptedQty: 5, status: 'Accepted' }] },
];
save('grns', grns);

// ── Reverse Shipping ──
const reverseShipments = [
    { id: 'RS-00001', grnId: 'GRN-00001', poId: 'PO-00002', vendor: 'OfficeMart Supplies', date: '2026-02-23', status: 'Shipped', reason: 'Defective cartridge', items: [{ name: 'Printer Cartridge', qty: 1, reason: 'Print quality defect' }], trackingNumber: 'TRK9876543210', carrier: 'BlueDart' },
    { id: 'RS-00002', grnId: 'GRN-00004', poId: 'PO-00001', vendor: 'TechPro Solutions', date: '2026-03-02', status: 'Pending Pickup', reason: 'Hardware defect — keyboard issue', items: [{ name: 'Laptop Dell Latitude', qty: 2, reason: 'Keyboard malfunction' }], trackingNumber: '', carrier: 'DTDC' },
    { id: 'RS-00003', grnId: 'GRN-00002', poId: 'PO-00006', vendor: 'SafeGuard Equipment', date: '2026-02-12', status: 'Refund Received', reason: 'Cracked lenses on goggles', items: [{ name: 'Safety Goggles', qty: 5, reason: 'Manufacturing defect' }], trackingNumber: 'TRK1234567890', carrier: 'FedEx' },
];
save('reverseShipments', reverseShipments);

// ── POD ──
const pods = [
    { id: 'POD-00001', poId: 'PO-00002', vendor: 'OfficeMart Supplies', deliveryDate: '2026-02-22', receivedBy: 'Sunil Yadav', status: 'Verified', location: 'Warehouse A', signature: true, remarks: 'Delivered on time, all boxes intact' },
    { id: 'POD-00002', poId: 'PO-00006', vendor: 'SafeGuard Equipment', deliveryDate: '2026-02-10', receivedBy: 'Priya Nair', status: 'Verified', location: 'EHS Store', signature: true, remarks: 'Delivery complete, minor box dents' },
    { id: 'POD-00003', poId: 'PO-00003', vendor: 'MRO Spares Global', deliveryDate: '2026-02-28', receivedBy: 'Vijay Kumar', status: 'Pending Verification', location: 'Maintenance Bay', signature: false, remarks: 'Waiting for quality inspection' },
    { id: 'POD-00004', poId: 'PO-00001', vendor: 'TechPro Solutions', deliveryDate: '2026-03-01', receivedBy: 'Rahul Mehta', status: 'Disputed', location: 'IT Lab', signature: true, remarks: '2 laptops with keyboard defects, issue raised' },
];
save('pods', pods);

// ── Invoices ──
const invoices = [
    { id: 'INV-00001', invoiceNumber: 'TPS/2026/0892', vendor: 'OfficeMart Supplies', vendorId: 'VND-00005', poId: 'PO-00002', date: '2026-02-23', dueDate: '2026-03-10', amount: 85000, status: 'Approved', matchStatus: 'Matched', threeWayScore: 98 },
    { id: 'INV-00002', invoiceNumber: 'SGE/2026/1445', vendor: 'SafeGuard Equipment', vendorId: 'VND-00004', poId: 'PO-00006', date: '2026-02-12', dueDate: '2026-03-14', amount: 280000, status: 'Pending Approval', matchStatus: 'Matched', threeWayScore: 95 },
    { id: 'INV-00003', invoiceNumber: 'TPS/2026/0901', vendor: 'TechPro Solutions', vendorId: 'VND-00001', poId: 'PO-00001', date: '2026-03-02', dueDate: '2026-04-01', amount: 450000, status: 'Under Review', matchStatus: 'Partial Match', threeWayScore: 72 },
    { id: 'INV-00004', invoiceNumber: 'SSC/2026/3321', vendor: 'Stallion Steel Corp', vendorId: 'VND-00002', poId: 'PO-00005', date: '2026-02-18', dueDate: '2026-04-18', amount: 2800000, status: 'Pending Approval', matchStatus: 'Pending', threeWayScore: 0 },
    { id: 'INV-00005', invoiceNumber: 'ECI/2026/0567', vendor: 'ElectroCables India', vendorId: 'VND-00008', poId: 'PO-00004', date: '2026-02-20', dueDate: '2026-03-22', amount: 890000, status: 'Draft', matchStatus: 'Pending', threeWayScore: 0 },
    { id: 'INV-00006', invoiceNumber: 'MSG/2026/2201', vendor: 'MRO Spares Global', vendorId: 'VND-00009', poId: 'PO-00003', date: '2026-03-01', dueDate: '2026-04-14', amount: 560000, status: 'Pending Approval', matchStatus: 'Matched', threeWayScore: 91 },
];
save('invoices', invoices);

// ── Accounts Payable ──
const accountsPayable = [
    { id: 'AP-00001', vendor: 'OfficeMart Supplies', vendorId: 'VND-00005', invoiceIds: ['INV-00001'], totalDue: 85000, paidAmount: 85000, status: 'Paid', paymentDate: '2026-03-08', paymentMethod: 'NEFT', dueDate: '2026-03-10' },
    { id: 'AP-00002', vendor: 'SafeGuard Equipment', vendorId: 'VND-00004', invoiceIds: ['INV-00002'], totalDue: 280000, paidAmount: 0, status: 'Pending', paymentDate: '', paymentMethod: '', dueDate: '2026-03-14' },
    { id: 'AP-00003', vendor: 'Stallion Steel Corp', vendorId: 'VND-00002', invoiceIds: ['INV-00004'], totalDue: 2800000, paidAmount: 0, status: 'Overdue', paymentDate: '', paymentMethod: '', dueDate: '2026-02-18' },
    { id: 'AP-00004', vendor: 'ElectroCables India', vendorId: 'VND-00008', invoiceIds: ['INV-00005'], totalDue: 890000, paidAmount: 0, status: 'Scheduled', paymentDate: '2026-03-20', paymentMethod: 'RTGS', dueDate: '2026-03-22' },
    { id: 'AP-00005', vendor: 'MRO Spares Global', vendorId: 'VND-00009', invoiceIds: ['INV-00006'], totalDue: 560000, paidAmount: 0, status: 'Pending', paymentDate: '', paymentMethod: '', dueDate: '2026-04-14' },
];
save('accountsPayable', accountsPayable);

// ── Contracts ──
const contracts = [
    { id: 'CON-00001', contractNumber: 'CTR/2025/001', vendor: 'TechPro Solutions', vendorId: 'VND-00001', title: 'Annual IT Hardware Supply Agreement', startDate: '2025-04-01', endDate: '2026-03-31', value: 5000000, status: 'Active', autoRenewal: true, category: 'IT & Electronics' },
    { id: 'CON-00002', contractNumber: 'CTR/2025/002', vendor: 'Stallion Steel Corp', vendorId: 'VND-00002', title: 'Steel Supply Rate Contract FY2025-26', startDate: '2025-04-01', endDate: '2026-03-31', value: 15000000, status: 'Active', autoRenewal: false, category: 'Raw Materials' },
    { id: 'CON-00003', contractNumber: 'CTR/2024/015', vendor: 'GreenPack Industries', vendorId: 'VND-00003', title: 'Packaging Material Supply Contract', startDate: '2024-07-01', endDate: '2026-06-30', value: 3500000, status: 'Active', autoRenewal: true, category: 'Packaging' },
    { id: 'CON-00004', contractNumber: 'CTR/2025/008', vendor: 'SafeGuard Equipment', vendorId: 'VND-00004', title: 'Safety Equipment AMC', startDate: '2025-01-01', endDate: '2025-12-31', value: 2000000, status: 'Expired', autoRenewal: false, category: 'Safety Equipment' },
    { id: 'CON-00005', contractNumber: 'CTR/2025/012', vendor: 'ElectroCables India', vendorId: 'VND-00008', title: 'Electrical Supplies Framework Agreement', startDate: '2025-06-01', endDate: '2027-05-31', value: 8000000, status: 'Active', autoRenewal: true, category: 'Electrical' },
];
save('contracts', contracts);

// ── Inventory ──
const inventory = [
    { id: 'ITM-00001', itemCode: 'LAP-DL-001', name: 'Laptop Dell Latitude 5540', category: 'IT & Electronics', quantity: 12, reorderLevel: 5, unitPrice: 75000, location: 'IT Store', monthlyUsage: 3, leadTimeDays: 10, safetyDays: 5, lastRestocked: '2026-02-01' },
    { id: 'ITM-00002', itemCode: 'STL-MS-6MM', name: 'MS Steel Plate 6mm', category: 'Raw Materials', quantity: 45, reorderLevel: 100, unitPrice: 12000, location: 'Warehouse B', monthlyUsage: 80, leadTimeDays: 14, safetyDays: 7, lastRestocked: '2026-01-15' },
    { id: 'ITM-00003', itemCode: 'PPR-A4-001', name: 'A4 Copier Paper Ream', category: 'Office Supplies', quantity: 350, reorderLevel: 100, unitPrice: 250, location: 'Admin Store', monthlyUsage: 60, leadTimeDays: 3, safetyDays: 2, lastRestocked: '2026-02-20' },
    { id: 'ITM-00004', itemCode: 'HLM-ISI-001', name: 'Safety Helmet ISI Marked', category: 'Safety Equipment', quantity: 28, reorderLevel: 50, unitPrice: 800, location: 'EHS Store', monthlyUsage: 15, leadTimeDays: 7, safetyDays: 3, lastRestocked: '2026-02-10' },
    { id: 'ITM-00005', itemCode: 'CBL-CU-4MM', name: 'Copper Cable 4sqmm', category: 'Electrical', quantity: 200, reorderLevel: 150, unitPrice: 1200, location: 'Electrical Store', monthlyUsage: 100, leadTimeDays: 10, safetyDays: 5, lastRestocked: '2026-01-28' },
    { id: 'ITM-00006', itemCode: 'BRG-SKF-001', name: 'SKF Bearing 6205', category: 'MRO', quantity: 8, reorderLevel: 10, unitPrice: 1500, location: 'Maintenance Store', monthlyUsage: 4, leadTimeDays: 7, safetyDays: 3, lastRestocked: '2026-01-20' },
    { id: 'ITM-00007', itemCode: 'BOX-CRG-001', name: 'Corrugated Box 12x10x8', category: 'Packaging', quantity: 2500, reorderLevel: 500, unitPrice: 125, location: 'Packing Area', monthlyUsage: 400, leadTimeDays: 5, safetyDays: 3, lastRestocked: '2026-02-15' },
    { id: 'ITM-00008', itemCode: 'LUB-001', name: 'Machine Lubricant 5L', category: 'MRO', quantity: 3, reorderLevel: 10, unitPrice: 3500, location: 'Maintenance Store', monthlyUsage: 6, leadTimeDays: 5, safetyDays: 2, lastRestocked: '2026-01-10' },
];
save('inventory', inventory);

// ── RFIs ──
const rfis = [
    { id: 'RFI-00001', title: 'Industrial IoT sensors for predictive maintenance', category: 'IT & Electronics', date: '2026-02-10', dueDate: '2026-02-25', status: 'Open', sentTo: ['VND-00001', 'VND-00010'], responses: 1 },
    { id: 'RFI-00002', title: 'Eco-friendly packaging alternatives', category: 'Packaging', date: '2026-02-08', dueDate: '2026-02-22', status: 'Closed', sentTo: ['VND-00003'], responses: 1 },
    { id: 'RFI-00003', title: 'High-grade aluminum alloy supply capabilities', category: 'Raw Materials', date: '2026-02-05', dueDate: '2026-02-20', status: 'Open', sentTo: ['VND-00002', 'VND-00007'], responses: 0 },
];
save('rfis', rfis);

// ── RFPs ──
const rfps = [
    { id: 'RFP-00001', title: 'Annual IT infrastructure upgrade — FY2026-27', category: 'IT & Electronics', date: '2026-02-12', dueDate: '2026-03-15', status: 'Open', budget: 8000000, vendors: ['VND-00001', 'VND-00010'], submissions: 0 },
    { id: 'RFP-00002', title: 'Raw material supply contract renewal', category: 'Raw Materials', date: '2026-02-01', dueDate: '2026-03-01', status: 'Under Evaluation', budget: 20000000, vendors: ['VND-00002', 'VND-00007'], submissions: 2 },
    { id: 'RFP-00003', title: 'Safety equipment and PPE — annual order', category: 'Safety Equipment', date: '2026-01-25', dueDate: '2026-02-20', status: 'Awarded', budget: 3000000, vendors: ['VND-00004'], submissions: 1, awardedTo: 'VND-00004' },
];
save('rfps', rfps);

// ── E-Auctions ──
const eauctions = [
    { id: 'AUC-00001', title: 'Steel plates bulk procurement — Q2 2026', category: 'Raw Materials', startDate: '2026-03-01T10:00:00', endDate: '2026-03-01T14:00:00', status: 'Upcoming', reservePrice: 2500000, currentBid: 0, participants: ['VND-00002', 'VND-00007'], bids: [] },
    { id: 'AUC-00002', title: 'Office furniture supply for new wing', category: 'Office Supplies', startDate: '2026-02-15T09:00:00', endDate: '2026-02-15T13:00:00', status: 'Completed', reservePrice: 500000, currentBid: 420000, participants: ['VND-00005'], bids: [{ vendor: 'VND-00005', amount: 480000, time: '09:15' }, { vendor: 'VND-00005', amount: 450000, time: '10:30' }, { vendor: 'VND-00005', amount: 420000, time: '12:00' }] },
    { id: 'AUC-00003', title: 'Packaging materials reverse auction', category: 'Packaging', startDate: '2026-02-20T11:00:00', endDate: '2026-02-20T15:00:00', status: 'Live', reservePrice: 350000, currentBid: 310000, participants: ['VND-00003'], bids: [{ vendor: 'VND-00003', amount: 340000, time: '11:20' }, { vendor: 'VND-00003', amount: 310000, time: '13:45' }] },
];
save('eauctions', eauctions);

// ── Negotiations ──
const negotiations = [
    { id: 'NEG-00001', title: 'Steel rate negotiation — FY2026-27 contract', vendor: 'Stallion Steel Corp', vendorId: 'VND-00002', status: 'In Progress', rounds: 3, currentOffer: 11500, targetPrice: 10800, unit: 'per MT', startDate: '2026-02-10', lastActivity: '2026-02-18' },
    { id: 'NEG-00002', title: 'IT AMC renewal pricing discussion', vendor: 'TechPro Solutions', vendorId: 'VND-00001', status: 'Completed', rounds: 2, currentOffer: 4200000, targetPrice: 4000000, unit: 'annual', startDate: '2026-01-15', lastActivity: '2026-02-01' },
    { id: 'NEG-00003', title: 'Bulk cable pricing for plant expansion', vendor: 'ElectroCables India', vendorId: 'VND-00008', status: 'Pending Response', rounds: 1, currentOffer: 1100, targetPrice: 1000, unit: 'per meter', startDate: '2026-02-15', lastActivity: '2026-02-16' },
];
save('negotiations', negotiations);

// ── Budget ──
const budgets = [
    { id: 'BUD-00001', department: 'IT', category: 'Hardware', allocated: 8000000, spent: 5400000, period: 'FY 2025-26', status: 'On Track' },
    { id: 'BUD-00002', department: 'Production', category: 'Raw Materials', allocated: 25000000, spent: 18500000, period: 'FY 2025-26', status: 'Warning' },
    { id: 'BUD-00003', department: 'Admin', category: 'Office Supplies', allocated: 1200000, spent: 850000, period: 'FY 2025-26', status: 'On Track' },
    { id: 'BUD-00004', department: 'EHS', category: 'Safety Equipment', allocated: 3000000, spent: 2200000, period: 'FY 2025-26', status: 'On Track' },
    { id: 'BUD-00005', department: 'Maintenance', category: 'MRO', allocated: 5000000, spent: 4800000, period: 'FY 2025-26', status: 'Critical' },
    { id: 'BUD-00006', department: 'Projects', category: 'Capital Expenditure', allocated: 15000000, spent: 6200000, period: 'FY 2025-26', status: 'On Track' },
];
save('budgets', budgets);

// ── Approvals ──
const approvals = [
    { id: 'APR-00001', type: 'Purchase Requisition', referenceId: 'PR-00002', title: 'Steel plates for manufacturing Q1', requestedBy: 'Sanjay Rao', amount: 2800000, date: '2026-02-14', status: 'Pending', priority: 'High', approver: 'VP Procurement', level: 'senior' },
    { id: 'APR-00002', type: 'Purchase Requisition', referenceId: 'PR-00006', title: 'Server rack upgrade for data center', requestedBy: 'Rahul Mehta', amount: 1200000, date: '2026-02-09', status: 'Pending', priority: 'High', approver: 'CFO', level: 'executive' },
    { id: 'APR-00003', type: 'Invoice', referenceId: 'INV-00002', title: 'SafeGuard Equipment invoice approval', requestedBy: 'System', amount: 280000, date: '2026-02-13', status: 'Pending', priority: 'Medium', approver: 'Procurement Manager', level: 'manager' },
    { id: 'APR-00004', type: 'Purchase Order', referenceId: 'PO-00005', title: 'Steel PO release approval', requestedBy: 'Sanjay Rao', amount: 2800000, date: '2026-02-11', status: 'Approved', priority: 'Critical', approver: 'CFO', level: 'executive' },
    { id: 'APR-00005', type: 'Contract', referenceId: 'CON-00002', title: 'Steel contract renewal approval', requestedBy: 'Meena Patel', amount: 15000000, date: '2026-02-05', status: 'Pending', priority: 'Critical', approver: 'CEO', level: 'executive' },
];
save('approvals', approvals);

// ── Compliance / Audit Trail ──
const compliance = [
    { id: 'AUD-00001', action: 'PR Created', module: 'Purchase Requisition', user: 'Sanjay Rao', timestamp: '2026-02-14T09:30:00', details: 'Created PR-00002: Steel plates for manufacturing Q1', ipAddress: '192.168.1.45' },
    { id: 'AUD-00002', action: 'PO Approved', module: 'Purchase Order', user: 'Arjun Kumar', timestamp: '2026-02-16T11:15:00', details: 'Approved PO-00001 for TechPro Solutions — ₹4,50,000', ipAddress: '192.168.1.10' },
    { id: 'AUD-00003', action: 'Vendor Blacklisted', module: 'Vendor Management', user: 'Arjun Kumar', timestamp: '2026-02-12T14:00:00', details: 'NovaTech Systems blacklisted due to repeated compliance violations', ipAddress: '192.168.1.10' },
    { id: 'AUD-00004', action: 'Invoice 3-Way Match', module: 'Invoice Approval', user: 'System (AI)', timestamp: '2026-02-23T08:00:00', details: 'Auto-matched INV-00001 with PO-00002 and GRN-00001 — Score: 98%', ipAddress: 'system' },
    { id: 'AUD-00005', action: 'GRN Rejected', module: 'GRN', user: 'Rahul Mehta', timestamp: '2026-03-01T16:45:00', details: 'Partially rejected GRN-00004: 2 laptops with keyboard defects', ipAddress: '192.168.1.22' },
    { id: 'AUD-00006', action: 'Contract Expired', module: 'Contract Management', user: 'System', timestamp: '2026-01-01T00:00:00', details: 'CON-00004 (Safety Equipment AMC) expired — renewal required', ipAddress: 'system' },
    { id: 'AUD-00007', action: 'Budget Alert', module: 'Budget Management', user: 'System (AI)', timestamp: '2026-02-15T07:00:00', details: 'Maintenance department budget at 96% utilization — critical alert triggered', ipAddress: 'system' },
];
save('compliance', compliance);

// ── Catalog ──
const catalog = [
    { id: 'CAT-00001', itemCode: 'LAP-DL-001', name: 'Laptop Dell Latitude 5540', category: 'IT & Electronics', description: '15.6" FHD, Intel i7, 16GB, 512GB SSD', unitPrice: 75000, preferredVendors: ['VND-00001'], status: 'Active' },
    { id: 'CAT-00002', itemCode: 'STL-MS-6MM', name: 'MS Steel Plate 6mm', category: 'Raw Materials', description: 'Mild steel plate, 6mm thickness, IS 2062 grade', unitPrice: 12000, preferredVendors: ['VND-00002'], status: 'Active' },
    { id: 'CAT-00003', itemCode: 'PPR-A4-001', name: 'A4 Copier Paper Ream (500 sheets)', category: 'Office Supplies', description: '75 GSM, white, A4 size', unitPrice: 250, preferredVendors: ['VND-00005'], status: 'Active' },
    { id: 'CAT-00004', itemCode: 'HLM-ISI-001', name: 'Safety Helmet ISI Marked', category: 'Safety Equipment', description: 'HDPE shell, adjustable cradle, ISI marked', unitPrice: 800, preferredVendors: ['VND-00004'], status: 'Active' },
    { id: 'CAT-00005', itemCode: 'CBL-CU-4MM', name: 'Copper Cable 4sqmm', category: 'Electrical', description: 'Copper conductor, PVC insulated, 4 sq mm', unitPrice: 1200, preferredVendors: ['VND-00008'], status: 'Active' },
    { id: 'CAT-00006', itemCode: 'BRG-SKF-001', name: 'SKF Bearing 6205', category: 'MRO', description: 'Deep groove ball bearing, 25x52x15mm', unitPrice: 1500, preferredVendors: ['VND-00009'], status: 'Active' },
    { id: 'CAT-00007', itemCode: 'BOX-CRG-001', name: 'Corrugated Box 12x10x8', category: 'Packaging', description: '3-ply corrugated, brown kraft', unitPrice: 125, preferredVendors: ['VND-00003'], status: 'Active' },
    { id: 'CAT-00008', itemCode: 'LUB-001', name: 'Machine Lubricant 5L', category: 'MRO', description: 'Multi-purpose machine oil, ISO VG 68', unitPrice: 3500, preferredVendors: ['VND-00009'], status: 'Active' },
];
save('catalog', catalog);

console.log('\n✨ Database seeded successfully!');
