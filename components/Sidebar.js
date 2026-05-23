'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    IconDashboard, IconClipboard, IconPackage, IconCheck, IconDollar,
    IconBuilding, IconHelp, IconFileText, IconGavel, IconHandshake,
    IconBook, IconDownload, IconRefresh, IconMail, IconFactory,
    IconReceipt, IconCreditCard, IconFile, IconShield, IconBarChart,
    IconTruck, IconChevronLeft, IconChevronRight
} from './Icons';

const navGroups = [
    {
        title: 'Overview',
        items: [
            { label: 'Dashboard', icon: IconDashboard, href: '/' },
        ]
    },
    {
        title: 'Procurement',
        items: [
            { label: 'Purchase Requisition', icon: IconClipboard, href: '/pr', badge: 5 },
            { label: 'Purchase Order', icon: IconPackage, href: '/po' },
            { label: 'Approval Workflows', icon: IconCheck, href: '/approvals', badge: 3 },
            { label: 'Budget Management', icon: IconDollar, href: '/budget' },
        ]
    },
    {
        title: 'Sourcing',
        items: [
            { label: 'Vendor Management', icon: IconBuilding, href: '/vendors' },
            { label: 'RFI', icon: IconHelp, href: '/rfi' },
            { label: 'RFP', icon: IconFileText, href: '/rfp' },
            { label: 'E-Auction', icon: IconGavel, href: '/e-auction' },
            { label: 'Negotiation', icon: IconHandshake, href: '/negotiation' },
            { label: 'Catalog', icon: IconBook, href: '/catalog' },
        ]
    },
    {
        title: 'Supply Chain',
        items: [
            { label: 'GRN', icon: IconDownload, href: '/grn' },
            { label: 'Reverse Shipping', icon: IconRefresh, href: '/reverse-shipping' },
            { label: 'Proof of Delivery', icon: IconTruck, href: '/pod' },
            { label: 'Inventory', icon: IconFactory, href: '/inventory' },
        ]
    },
    {
        title: 'Finance',
        items: [
            { label: 'Invoice Approval', icon: IconReceipt, href: '/invoices' },
            { label: 'Accounts Payable', icon: IconCreditCard, href: '/accounts-payable' },
            { label: 'Contracts', icon: IconFile, href: '/contracts' },
        ]
    },
    {
        title: 'Administration',
        items: [
            { label: 'Compliance & Audit', icon: IconShield, href: '/compliance' },
            { label: 'Reports & Analytics', icon: IconBarChart, href: '/reports', badge: 'AI' },
        ]
    }
];

export default function Sidebar({ collapsed, onToggle }) {
    const pathname = usePathname();

    return (
        <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">Z</div>
                    {!collapsed && <span>ZYNO Procure</span>}
                </div>
                <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
                    {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {navGroups.map((group) => (
                    <div className="nav-group" key={group.title}>
                        <div className="nav-group-title">{group.title}</div>
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-item${pathname === item.href ? ' active' : ''}`}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <span className="nav-item-icon"><Icon size={18} /></span>
                                    <span className="nav-item-label">{item.label}</span>
                                    {item.badge && <span className="nav-item-badge">{item.badge}</span>}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">AK</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">Arjun Kumar</div>
                        <div className="sidebar-user-role">Procurement Manager</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
