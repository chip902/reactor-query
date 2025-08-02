"use client";

const Footer = () => {
	return (
		<footer className="mt-auto w-full bg-[var(--color-button-primary-bg)] py-4">
			<div className="container mx-auto text-center text-[var(--color-button-primary-text)]">
				<p>© {new Date().getFullYear()} Chip Hosting Solutions LLC All rights reserved.</p>
			</div>
		</footer>
	);
};

export default Footer;
