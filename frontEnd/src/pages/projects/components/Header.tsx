import { NavLink } from 'react-router-dom';

// Icons
export const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

export const CartIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
);

export const MoonIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);

export const SunIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
);

interface HeaderProps {
    cartCount: number;
    setIsCartOpen: (open: boolean) => void;
    isDarkMode?: boolean;
    toggleDarkMode?: () => void;
}

export const Header = ({
    cartCount, setIsCartOpen, isDarkMode, toggleDarkMode
}: HeaderProps) => {

    return (
        <>
            <header className="topbar">
                <NavLink to="/" className="topbar-logo">
                    CSA <span>Shop</span>
                </NavLink>

                <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <NavLink to="/admin" style={{
                        color: 'var(--color-text-muted)',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)'
                    }}>
                        ADMIN
                    </NavLink>

                    <button
                        className="icon-btn"
                        onClick={toggleDarkMode}
                        style={{ background: 'transparent', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', display: 'flex' }}
                        aria-label="Toggle Dark Mode"
                    >
                        {isDarkMode ? <SunIcon /> : <MoonIcon />}
                    </button>

                    <button
                        className="cart-btn"
                        onClick={() => setIsCartOpen(true)}
                        style={{
                            position: 'relative',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-main)',
                            cursor: 'pointer',
                            display: 'flex',
                            padding: '8px'
                        }}
                    >
                        <CartIcon />
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                background: 'var(--color-primary)',
                                color: '#fff',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid var(--color-bg-base)'
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            <nav className="category-nav">
                <div className="category-nav-links">
                        <NavLink to="/t-shirts">T-shirts</NavLink>
                    <NavLink to="/chairs">Chairs</NavLink>
                    <NavLink to="/instruments">Instruments</NavLink>
                    <NavLink to="/other-projects">Other Projects</NavLink>
                </div>
            </nav>
        </>
    )
}
