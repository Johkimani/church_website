

interface FooterProps {
    apiMessages: Record<string, string[]>;
    footerIndex: number;
    isFooterFading: boolean;
}

export const Footer = ({ apiMessages, footerIndex, isFooterFading }: FooterProps) => {
    return (
        <footer className="professional-footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <h3>CSA Shop</h3>
                    <p>Dedicated strictly to quality, faith, and community service.</p>
                </div>
                <div className="footer-message-box">
                    <p className={`message ${isFooterFading ? 'fade-out' : 'fade-in'}`}>
                        "{apiMessages.general && apiMessages.general.length > 0 ? apiMessages.general[footerIndex] : 'Quality services.'}"
                    </p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} CSA Shop. All rights reserved.</p>
            </div>
        </footer>
    );
};
