'use client';
import { usePathname } from 'next/navigation';
import { IconSearch, IconBell, IconSettings } from './Icons';

const routeNames = {
    '/': 'Dashboard',
    '/pr': 'Purchase Requisition',
    '/po': 'Purchase Orders',
    '/approvals': 'Approval Workflows',
    '/budget': 'Budget Management',
    '/vendors': 'Vendor Management',
    '/rfi': 'Request for Information',
    '/rfp': 'Request for Proposal',
    '/e-auction': 'E-Auction',
    '/negotiation': 'Online Negotiation',
    '/catalog': 'Catalog Management',
    '/grn': 'Goods Receipt Note',
    '/reverse-shipping': 'Reverse Shipping',
    '/pod': 'Proof of Delivery',
    '/inventory': 'Inventory Management',
    '/invoices': 'Invoice Approval',
    '/accounts-payable': 'Accounts Payable',
    '/contracts': 'Contract Management',
    '/compliance': 'Compliance & Audit',
    '/reports': 'Reports & Analytics',
};

export default function Topbar() {
    const pathname = usePathname();
    const pageName = routeNames[pathname] || 'Page';

    return (
        <header className="topbar">
            <div className="topbar-left">
                <div className="breadcrumbs">
                    <span className="breadcrumb-item">Home</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-item active">{pageName}</span>
                </div>
            </div>
            <div className="topbar-right">
                <div className="topbar-search">
                    <span className="topbar-search-icon"><IconSearch size={15} /></span>
                    <input type="text" placeholder="Search... (⌘K)" />
                </div>
                <button className="topbar-btn" title="Notifications">
                    <IconBell size={18} />
                    <span className="notification-dot"></span>
                </button>
                <button className="topbar-btn" title="Settings">
                    <IconSettings size={18} />
                </button>
                <button className="user-menu-btn">
                    <div className="user-menu-avatar">AK</div>
                </button>
            </div>
        </header>
    );
}
